import { useCallback, useEffect, useRef, useState } from "react";
import {
    createWatchNote,
    deleteWatchNote,
    listWatchNotes,
    WatchNotesError,
    type WatchNoteItem,
} from "@/lib/watch-notes";

export type WatchNotesState =
    | { status: "loading" }
    | { status: "ready"; notes: WatchNoteItem[]; hasMore: boolean }
    | { status: "error"; error: WatchNotesError };

function asNotesError(err: unknown): WatchNotesError {
    return err instanceof WatchNotesError
        ? err
        : new WatchNotesError("unavailable", err instanceof Error ? err.message : String(err));
}

/**
 * The signed-in user's notes for one area, plus save and delete. Never throws: every
 * failure lands in `state.error`, `saveError` or `deleteError` for the card to show.
 */
export function useWatchNotes(areaName: string) {
    const [state, setState] = useState<WatchNotesState>({ status: "loading" });
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<WatchNotesError>();
    const [deletingId, setDeletingId] = useState<string>();
    const [deleteError, setDeleteError] = useState<WatchNotesError>();
    const requestRef = useRef(0);

    const load = useCallback(async () => {
        const request = ++requestRef.current;
        setState({ status: "loading" });
        try {
            const page = await listWatchNotes(areaName);
            if (request === requestRef.current) setState({ status: "ready", ...page });
        } catch (err) {
            if (request === requestRef.current) setState({ status: "error", error: asNotesError(err) });
        }
    }, [areaName]);

    useEffect(() => {
        setSaveError(undefined); // eslint-disable-line react-hooks/set-state-in-effect
        setDeleteError(undefined);
        void load();
        return () => {
            requestRef.current += 1;
        };
    }, [load]);

    /** Saves a note; resolves `true` when it was stored so the form can clear. */
    const save = useCallback(
        async (draft: string): Promise<boolean> => {
            setSaving(true);
            setSaveError(undefined);
            try {
                const created = await createWatchNote(areaName, draft);
                setState((prev) =>
                    prev.status === "ready" ? { ...prev, notes: [created, ...prev.notes] } : prev,
                );
                return true;
            } catch (err) {
                setSaveError(asNotesError(err));
                return false;
            } finally {
                setSaving(false);
            }
        },
        [areaName],
    );

    /**
     * Deletes a note, then re-reads the area's notes from the server. The row stays on screen
     * (marked as deleting) until the server has confirmed the delete and the reloaded list no
     * longer contains it; the list is never edited locally, so it always shows what the
     * server holds.
     */
    const remove = useCallback(
        async (id: string) => {
            const generation = requestRef.current;
            setDeletingId(id);
            setDeleteError(undefined);
            try {
                try {
                    await deleteWatchNote(id);
                } catch (err) {
                    setDeleteError(asNotesError(err));
                    return;
                }
                // The area changed while deleting; its own load already shows server state.
                if (generation !== requestRef.current) return;

                const request = ++requestRef.current;
                try {
                    const page = await listWatchNotes(areaName);
                    if (request !== requestRef.current) return;
                    setState({ status: "ready", ...page });
                    if (page.notes.some((n) => n.id === id)) {
                        setDeleteError(
                            new WatchNotesError(
                                "unavailable",
                                "The note is still saved on the server, so it was not deleted. Try again.",
                            ),
                        );
                    }
                } catch (err) {
                    if (request !== requestRef.current) return;
                    // Without a fresh list the card can't show what the server holds.
                    setState({ status: "error", error: asNotesError(err) });
                }
            } finally {
                setDeletingId(undefined);
            }
        },
        [areaName],
    );

    return { state, reload: load, save, saving, saveError, remove, deletingId, deleteError };
}
