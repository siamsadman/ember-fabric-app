import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import * as watchNotes from "@/lib/watch-notes";
import { WatchlistCard } from "./watchlist-card";

vi.mock("@/lib/watch-notes", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/lib/watch-notes")>();
    return { ...actual, listWatchNotes: vi.fn(), deleteWatchNote: vi.fn() };
});

const listWatchNotes = vi.mocked(watchNotes.listWatchNotes);
const deleteWatchNote = vi.mocked(watchNotes.deleteWatchNote);

// Before `rayfin up` there is no data service, so reads fail; signed out, there is no
// session. Either way the card must show a clear error, never crash or invent notes.
describe("WatchlistCard when notes cannot be loaded", () => {
    // Block body on purpose: Vitest runs a function returned from `beforeEach` as teardown,
    // and `mockClear()` returns the mock itself, which would then be called and throw.
    beforeEach(() => {
        listWatchNotes.mockClear();
    });

    it("explains that the notes database is unavailable and keeps Save disabled", async () => {
        listWatchNotes.mockImplementation(async () => {
            throw new watchNotes.WatchNotesError(
                "unavailable",
                "Couldn't load your notes. The notes database may not be deployed yet, or the connection failed.",
                "GraphQL request failed: entity WatchNote not found",
            );
        });
        render(<WatchlistCard areaName="Bangladesh" />);

        expect(screen.getByLabelText("Note about Bangladesh")).toBeInTheDocument();
        const alert = await screen.findByRole("alert");
        expect(alert).toHaveTextContent("may not be deployed yet");
        expect(alert).toHaveTextContent("entity WatchNote not found");
        expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Save note" })).toBeDisabled();
        expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
        expect(listWatchNotes).toHaveBeenCalledWith("Bangladesh");
    });

    it("asks the user to sign in when there is no session", async () => {
        listWatchNotes.mockImplementation(async () => {
            throw new watchNotes.WatchNotesError("signed-out", "Sign in with Fabric to use the watchlist.");
        });
        render(<WatchlistCard areaName="India" />);

        expect(await screen.findByRole("alert")).toHaveTextContent("Sign in with Fabric");
        expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Save note" })).toBeDisabled();
    });

    it("lists only the notes the service returned", async () => {
        listWatchNotes.mockResolvedValue({
            notes: [{ id: "n1", areaName: "Pakistan", note: "Test note", createdAt: new Date("2026-10-29T10:00:00Z") }],
            hasMore: false,
        });
        render(<WatchlistCard areaName="Pakistan" />);

        expect(await screen.findByRole("listitem")).toHaveTextContent("Test note");
        expect(screen.getAllByRole("listitem")).toHaveLength(1);
        expect(screen.getByRole("button", { name: "Save note" })).toBeEnabled();
    });
});

// Two saved notes, shaped like listWatchNotes rows; the text is test input, not app data.
const keep = { id: "keep", areaName: "Bangladesh", note: "Note to keep", createdAt: new Date("2026-10-29T10:00:00Z") };
const drop = { id: "drop", areaName: "Bangladesh", note: "Note to delete", createdAt: new Date("2026-10-28T10:00:00Z") };

function deleteButtonFor(text: string) {
    const item = screen.getByText(text).closest("li");
    if (!item) throw new Error(`no list item for ${text}`);
    return within(item).getByRole("button", { name: /^Delete note from / });
}

describe("WatchlistCard delete", () => {
    beforeEach(() => {
        listWatchNotes.mockClear();
        deleteWatchNote.mockReset();
    });

    it("keeps the note and shows the error when the server rejects the delete", async () => {
        listWatchNotes.mockResolvedValue({ notes: [keep, drop], hasMore: false });
        deleteWatchNote.mockImplementation(async () => {
            throw new watchNotes.WatchNotesError("unavailable", "Couldn't delete the note.", "HTTP 403: Forbidden");
        });
        render(<WatchlistCard areaName="Bangladesh" />);
        await screen.findByText("Note to delete");

        fireEvent.click(deleteButtonFor("Note to delete"));

        expect(await screen.findByRole("alert")).toHaveTextContent("HTTP 403: Forbidden");
        expect(screen.getByText("Note to delete")).toBeInTheDocument();
        expect(screen.getAllByRole("listitem")).toHaveLength(2);
        // A failed delete does not touch the list: only the initial load ran.
        expect(listWatchNotes).toHaveBeenCalledTimes(1);
    });

    it("keeps showing the note when the server still has it after a reported delete", async () => {
        listWatchNotes.mockResolvedValue({ notes: [keep, drop], hasMore: false });
        deleteWatchNote.mockResolvedValue(undefined);
        render(<WatchlistCard areaName="Bangladesh" />);
        await screen.findByText("Note to delete");

        fireEvent.click(deleteButtonFor("Note to delete"));

        expect(await screen.findByRole("alert")).toHaveTextContent("still saved on the server");
        expect(screen.getByText("Note to delete")).toBeInTheDocument();
        expect(deleteWatchNote).toHaveBeenCalledWith("drop");
        expect(listWatchNotes).toHaveBeenCalledTimes(2);
    });

    it("leaves the note on screen until the server confirms, then shows the reloaded list", async () => {
        listWatchNotes.mockResolvedValueOnce({ notes: [keep, drop], hasMore: false });
        let confirmDelete!: () => void;
        deleteWatchNote.mockImplementation(() => new Promise<void>((resolve) => (confirmDelete = resolve)));
        render(<WatchlistCard areaName="Bangladesh" />);
        await screen.findByText("Note to delete");

        fireEvent.click(deleteButtonFor("Note to delete"));
        // Still pending on the server: the row is shown, marked as deleting.
        expect(screen.getByText("Note to delete")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /^Deleting note from / })).toHaveAttribute("aria-busy", "true");

        listWatchNotes.mockResolvedValueOnce({ notes: [keep], hasMore: false });
        confirmDelete();

        await waitFor(() => expect(screen.queryByText("Note to delete")).not.toBeInTheDocument());
        expect(screen.getByText("Note to keep")).toBeInTheDocument();
        expect(listWatchNotes).toHaveBeenCalledTimes(2);
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("shows an error instead of a stale list when the reload after delete fails", async () => {
        listWatchNotes.mockResolvedValueOnce({ notes: [keep, drop], hasMore: false });
        deleteWatchNote.mockResolvedValue(undefined);
        render(<WatchlistCard areaName="Bangladesh" />);
        await screen.findByText("Note to delete");

        listWatchNotes.mockImplementationOnce(async () => {
            throw new watchNotes.WatchNotesError("unavailable", "Couldn't load your notes.", "HTTP 503");
        });
        fireEvent.click(deleteButtonFor("Note to delete"));

        expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't load your notes.");
        expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
    });
});
