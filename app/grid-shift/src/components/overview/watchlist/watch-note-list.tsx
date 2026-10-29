import { Trash2, TriangleAlert } from "lucide-react";
import type { WatchNotesError } from "@/lib/watch-notes";
import { WATCH_NOTE_PAGE_SIZE } from "@/lib/watch-notes";
import { cn } from "@/lib/utils";
import type { WatchNotesState } from "./use-watch-notes";

const savedAt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

export function NotesErrorMessage({ error, onRetry }: { error: WatchNotesError; onRetry?: () => void }) {
    return (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-destructive p-3 text-300 text-foreground">
            <TriangleAlert aria-hidden="true" className="icon-size-300 shrink-0 text-destructive" />
            <div className="flex min-w-0 flex-col gap-2">
                <p>{error.message}</p>
                {error.detail && (
                    <p className="break-words font-monospace text-200 text-muted-foreground">{error.detail}</p>
                )}
                {onRetry && error.kind === "unavailable" && (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="h-11 self-start rounded-full border bg-card px-4 text-300 font-semibold text-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                        Try again
                    </button>
                )}
            </div>
        </div>
    );
}

interface WatchNoteListProps {
    areaName: string;
    state: WatchNotesState;
    deletingId?: string;
    onDelete: (id: string) => void;
    onRetry: () => void;
}

/** The saved notes for one area, or its loading, empty or error state. Shows only stored notes. */
export function WatchNoteList({ areaName, state, deletingId, onDelete, onRetry }: WatchNoteListProps) {
    if (state.status === "loading") {
        return (
            <div aria-busy="true" className="flex flex-col gap-2">
                <span className="sr-only">Loading your notes for {areaName}</span>
                {[0, 1].map((i) => (
                    <div key={i} aria-hidden="true" className="h-16 animate-pulse rounded-2xl bg-muted" />
                ))}
            </div>
        );
    }

    if (state.status === "error") {
        return <NotesErrorMessage error={state.error} onRetry={onRetry} />;
    }

    if (state.notes.length === 0) {
        return <p className="text-300 text-muted-foreground">No notes for {areaName} yet.</p>;
    }

    return (
        <div className="flex flex-col gap-2">
            <ul aria-label={`Your notes on ${areaName}`} className="flex flex-col gap-2">
                {state.notes.map((item) => {
                    const when = savedAt.format(item.createdAt);
                    const deleting = deletingId === item.id;
                    return (
                        <li key={item.id} className="flex items-start gap-3 rounded-2xl border bg-background p-3">
                            <div className="min-w-0 flex-1">
                                <p className="whitespace-pre-wrap break-words text-300 text-foreground">{item.note}</p>
                                <time dateTime={item.createdAt.toISOString()} className="font-monospace text-200 text-muted-foreground">
                                    {when}
                                </time>
                            </div>
                            <button
                                type="button"
                                onClick={() => onDelete(item.id)}
                                disabled={deletingId !== undefined}
                                aria-busy={deleting}
                                aria-label={deleting ? `Deleting note from ${when}` : `Delete note from ${when}`}
                                className={cn(
                                    "flex size-11 shrink-0 items-center justify-center rounded-full border bg-card text-foreground",
                                    "hover:border-destructive hover:text-destructive",
                                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                                    "disabled:cursor-not-allowed disabled:text-muted-foreground disabled:hover:border-border",
                                )}
                            >
                                <Trash2 aria-hidden="true" className={cn("icon-size-200", deleting && "animate-pulse")} />
                            </button>
                        </li>
                    );
                })}
            </ul>
            {state.hasMore && (
                <p className="text-200 text-muted-foreground">
                    Showing your {WATCH_NOTE_PAGE_SIZE} most recent notes for {areaName}.
                </p>
            )}
        </div>
    );
}
