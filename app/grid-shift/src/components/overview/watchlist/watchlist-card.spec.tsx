import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import * as watchNotes from "@/lib/watch-notes";
import { WatchlistCard } from "./watchlist-card";

vi.mock("@/lib/watch-notes", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/lib/watch-notes")>();
    return { ...actual, listWatchNotes: vi.fn() };
});

const listWatchNotes = vi.mocked(watchNotes.listWatchNotes);

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
