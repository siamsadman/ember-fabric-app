import type { TypedDataClients } from "@microsoft/rayfin-data";
import { NetworkError } from "@microsoft/rayfin-lib";
import type { GridShiftDataSchema } from "../../rayfin/data/schema";
import { getRayfinClient } from "./rayfin-client";

/**
 * The `WatchNote` client typed by the app-owned schema in `rayfin/data/`. The shared client
 * keeps the template's untyped `EntitySchema`, which the auth service depends on.
 */
function watchNotes() {
    return (getRayfinClient().data as unknown as TypedDataClients<GridShiftDataSchema>).WatchNote;
}

/** Longest note a user can save; mirrors `WATCH_NOTE_MAX` in `rayfin/data/WatchNote.ts`. */
export const WATCH_NOTE_MAX_LENGTH = 280;

/** How many of an area's notes the card loads at once (newest first). */
export const WATCH_NOTE_PAGE_SIZE = 50;

/** A saved note as the watchlist card shows it. */
export interface WatchNoteItem {
    id: string;
    areaName: string;
    note: string;
    createdAt: Date;
}

export type NoteValidation = { ok: true; value: string } | { ok: false; error: string };

/**
 * Checks a draft note before it is sent. Trims surrounding whitespace, then requires
 * 1 to {@link WATCH_NOTE_MAX_LENGTH} characters, counted the way the database column is
 * sized (UTF-16 code units, i.e. `String.length`).
 */
export function validateNote(draft: string): NoteValidation {
    const value = draft.trim();
    if (value.length === 0) {
        return { ok: false, error: "Write a note before saving." };
    }
    if (value.length > WATCH_NOTE_MAX_LENGTH) {
        return {
            ok: false,
            error: `Notes can be up to ${WATCH_NOTE_MAX_LENGTH} characters. This one is ${value.length}.`,
        };
    }
    return { ok: true, value };
}

/** A failed notes request, with a message fit to show the user. */
export class WatchNotesError extends Error {
    readonly kind: "signed-out" | "unavailable";
    readonly detail?: string;

    constructor(kind: "signed-out" | "unavailable", message: string, detail?: string) {
        super(message);
        this.name = "WatchNotesError";
        this.kind = kind;
        this.detail = detail;
    }
}

/**
 * Error text for the detail line. The SDK's HTTP client throws a `NetworkError` carrying
 * the status for every non-2xx response, so the status is shown when it is known.
 */
function describe(err: unknown): string {
    const message = err instanceof Error && err.message ? err.message : String(err);
    if (err instanceof NetworkError && err.status !== undefined && !message.includes(String(err.status))) {
        return `HTTP ${err.status}: ${message}`;
    }
    return message;
}

/** Wraps any client or network failure so the card can show it instead of crashing. */
function unavailable(action: string, err: unknown): WatchNotesError {
    return new WatchNotesError(
        "unavailable",
        `Couldn't ${action}. The notes database may not be deployed yet, or the connection failed.`,
        describe(err),
    );
}

/** The signed-in user's id, which the row policy compares with the `sub` claim. */
function currentUserId(): string {
    const session = getRayfinClient().auth.getSession();
    if (!session.isAuthenticated || !session.user) {
        throw new WatchNotesError("signed-out", "Sign in with Fabric to use the watchlist.");
    }
    return session.user.id;
}

function toItem(row: { id: string; areaName: string; note: string; createdAt: Date | string }): WatchNoteItem {
    return { id: row.id, areaName: row.areaName, note: row.note, createdAt: new Date(row.createdAt) };
}

export interface WatchNotePage {
    notes: WatchNoteItem[];
    /** True when the area has more notes than {@link WATCH_NOTE_PAGE_SIZE}. */
    hasMore: boolean;
}

/**
 * Loads the signed-in user's notes for one area, newest first. The server-side policy
 * already limits rows to the caller; the owner filter here only narrows the query.
 */
export async function listWatchNotes(areaName: string): Promise<WatchNotePage> {
    try {
        const ownerId = currentUserId();
        const page = await watchNotes()
            .select(["id", "areaName", "note", "createdAt"])
            .where({ areaName: { eq: areaName }, owner_id: { eq: ownerId } })
            .orderBy({ createdAt: "desc" })
            .first(WATCH_NOTE_PAGE_SIZE)
            .executePaginated();
        return { notes: page.items.map(toItem), hasMore: page.hasNextPage };
    } catch (err) {
        if (err instanceof WatchNotesError) throw err;
        throw unavailable("load your notes", err);
    }
}

/** Saves a validated note for one area as the signed-in user. */
export async function createWatchNote(areaName: string, draft: string): Promise<WatchNoteItem> {
    const checked = validateNote(draft);
    if (!checked.ok) throw new Error(checked.error);
    try {
        const ownerId = currentUserId();
        const row = await watchNotes().create({
            areaName,
            note: checked.value,
            createdAt: new Date(),
            owner_id: ownerId,
        });
        return toItem(row);
    } catch (err) {
        if (err instanceof WatchNotesError) throw err;
        throw unavailable("save your note", err);
    }
}

/**
 * Deletes one of the signed-in user's notes and resolves only when the server confirmed it.
 *
 * The SDK rejects a non-2xx HTTP status, a GraphQL error, or a response without a deleted
 * row. On top of that, the row the server returns must be the note that was asked for
 * (DAB returns the row it deleted); anything else counts as not deleted.
 */
export async function deleteWatchNote(id: string): Promise<void> {
    let deleted: { id?: string } | null | undefined;
    try {
        currentUserId();
        deleted = await watchNotes().delete({ id });
    } catch (err) {
        if (err instanceof WatchNotesError) throw err;
        throw unavailable("delete the note", err);
    }
    if (typeof deleted?.id !== "string" || deleted.id.toLowerCase() !== id.toLowerCase()) {
        throw new WatchNotesError(
            "unavailable",
            "The server didn't confirm the delete, so the note was kept.",
            `Asked to delete ${id}; the server returned ${deleted?.id ?? "no row"}.`,
        );
    }
}
