import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { WatchNotesError, type WatchNoteItem } from "@/lib/watch-notes";
import { WatchNoteList } from "./watch-note-list";

// Shaped like rows returned by listWatchNotes; the text is test input, not app data.
const notes: WatchNoteItem[] = [
    { id: "b", areaName: "Bangladesh", note: "Second note", createdAt: new Date("2026-10-29T09:30:00Z") },
    { id: "a", areaName: "Bangladesh", note: "First note\nwith a line break", createdAt: new Date("2026-10-28T08:00:00Z") },
];

const noop = () => {};

describe("WatchNoteList", () => {
    it("shows a loading state without any notes", () => {
        render(<WatchNoteList areaName="Bangladesh" state={{ status: "loading" }} onDelete={noop} onRetry={noop} />);
        expect(screen.getByText("Loading your notes for Bangladesh")).toBeInTheDocument();
        expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
    });

    it("shows an empty state for an area with no notes", () => {
        render(
            <WatchNoteList
                areaName="Nepal"
                state={{ status: "ready", notes: [], hasMore: false }}
                onDelete={noop}
                onRetry={noop}
            />,
        );
        expect(screen.getByText("No notes for Nepal yet.")).toBeInTheDocument();
        expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });

    it("lists each saved note with its own labelled delete button", () => {
        const onDelete = vi.fn();
        render(
            <WatchNoteList
                areaName="Bangladesh"
                state={{ status: "ready", notes, hasMore: false }}
                onDelete={onDelete}
                onRetry={noop}
            />,
        );
        const items = screen.getAllByRole("listitem");
        expect(items).toHaveLength(2);
        expect(items[0]).toHaveTextContent("Second note");
        expect(items[1]).toHaveTextContent("First note");

        const buttons = screen.getAllByRole("button", { name: /^Delete note from / });
        expect(buttons).toHaveLength(2);
        fireEvent.click(buttons[1]);
        expect(onDelete).toHaveBeenCalledWith("a");
        expect(screen.queryByText(/most recent notes/)).not.toBeInTheDocument();
    });

    it("disables every delete button while one note is being deleted", () => {
        render(
            <WatchNoteList
                areaName="Bangladesh"
                state={{ status: "ready", notes, hasMore: true }}
                deletingId="b"
                onDelete={noop}
                onRetry={noop}
            />,
        );
        for (const button of screen.getAllByRole("button")) expect(button).toBeDisabled();
        expect(screen.getByRole("button", { name: /^Deleting note from / })).toHaveAttribute("aria-busy", "true");
        expect(screen.getByText("Showing your 50 most recent notes for Bangladesh.")).toBeInTheDocument();
    });

    it("shows the error with its detail and a retry when the service is unavailable", () => {
        const onRetry = vi.fn();
        const error = new WatchNotesError("unavailable", "Couldn't load your notes.", "GraphQL request failed");
        render(<WatchNoteList areaName="India" state={{ status: "error", error }} onDelete={noop} onRetry={onRetry} />);
        expect(screen.getByRole("alert")).toHaveTextContent("Couldn't load your notes.");
        expect(screen.getByText("GraphQL request failed")).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Try again" }));
        expect(onRetry).toHaveBeenCalledOnce();
    });

    it("offers no retry when the user is signed out", () => {
        const error = new WatchNotesError("signed-out", "Sign in with Fabric to use the watchlist.");
        render(<WatchNoteList areaName="India" state={{ status: "error", error }} onDelete={noop} onRetry={noop} />);
        expect(screen.getByRole("alert")).toHaveTextContent("Sign in with Fabric");
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
});
