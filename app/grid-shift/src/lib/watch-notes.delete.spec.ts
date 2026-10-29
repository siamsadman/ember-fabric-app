import { beforeEach, describe, expect, it, vi } from "vitest";
import { NetworkError } from "@microsoft/rayfin-lib";
import { getRayfinClient } from "./rayfin-client";
import { deleteWatchNote, WatchNotesError } from "./watch-notes";

vi.mock("./rayfin-client", () => ({ getRayfinClient: vi.fn() }));

const sdkDelete = vi.fn();

beforeEach(() => {
    sdkDelete.mockReset();
    vi.mocked(getRayfinClient).mockReturnValue({
        auth: { getSession: () => ({ isAuthenticated: true, user: { id: "user-1" } }) },
        data: { WatchNote: { delete: sdkDelete } },
    } as unknown as ReturnType<typeof getRayfinClient>);
});

async function rejection(promise: Promise<unknown>): Promise<WatchNotesError> {
    try {
        await promise;
    } catch (err) {
        expect(err).toBeInstanceOf(WatchNotesError);
        return err as WatchNotesError;
    }
    throw new Error("expected deleteWatchNote to reject");
}

describe("deleteWatchNote", () => {
    it("resolves when the server returns the deleted row for that id", async () => {
        sdkDelete.mockResolvedValue({ id: "ABC-1" });
        await expect(deleteWatchNote("abc-1")).resolves.toBeUndefined();
        expect(sdkDelete).toHaveBeenCalledWith({ id: "abc-1" });
    });

    it("rejects with the HTTP status when the request is not a success", async () => {
        sdkDelete.mockImplementation(async () => {
            throw new NetworkError("Forbidden", 403);
        });
        const err = await rejection(deleteWatchNote("abc-1"));
        expect(err.message).toContain("Couldn't delete the note");
        expect(err.detail).toBe("HTTP 403: Forbidden");
    });

    it("rejects when the server returns a different row or no row", async () => {
        sdkDelete.mockResolvedValue({ id: "other" });
        expect((await rejection(deleteWatchNote("abc-1"))).message).toBe(
            "The server didn't confirm the delete, so the note was kept.",
        );

        sdkDelete.mockResolvedValue(undefined);
        expect((await rejection(deleteWatchNote("abc-1"))).detail).toContain("no row");
    });

    it("rejects without calling the server when nobody is signed in", async () => {
        vi.mocked(getRayfinClient).mockReturnValue({
            auth: { getSession: () => ({ isAuthenticated: false }) },
            data: { WatchNote: { delete: sdkDelete } },
        } as unknown as ReturnType<typeof getRayfinClient>);
        expect((await rejection(deleteWatchNote("abc-1"))).kind).toBe("signed-out");
        expect(sdkDelete).not.toHaveBeenCalled();
    });
});
