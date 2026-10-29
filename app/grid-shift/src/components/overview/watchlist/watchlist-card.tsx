import { useId, useState, type FormEvent } from "react";
import { validateNote, WATCH_NOTE_MAX_LENGTH } from "@/lib/watch-notes";
import { cn } from "@/lib/utils";
import { useWatchNotes } from "./use-watch-notes";
import { NotesErrorMessage, WatchNoteList } from "./watch-note-list";

/**
 * Private notes for the selected area, stored in the app database (`WatchNote`).
 * Holds only what the user types; no Ember figures are written.
 */
export function WatchlistCard({ areaName, className }: { areaName: string; className?: string }) {
    const { state, reload, save, saving, saveError, remove, deletingId, deleteError } = useWatchNotes(areaName);
    const [draft, setDraft] = useState("");
    const [validationError, setValidationError] = useState<string>();
    const ids = useId();
    const inputId = `${ids}-note`;
    const countId = `${ids}-count`;
    const errorId = `${ids}-error`;
    const headingId = `${ids}-heading`;

    const length = draft.trim().length;
    const tooLong = length > WATCH_NOTE_MAX_LENGTH;
    const canSave = state.status === "ready" && !saving;

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const checked = validateNote(draft);
        if (!checked.ok) {
            setValidationError(checked.error);
            return;
        }
        setValidationError(undefined);
        if (await save(checked.value)) setDraft("");
    };

    const formError = validationError ?? saveError?.message;

    return (
        <section aria-labelledby={headingId} className={cn("flex min-w-0 flex-col gap-4 rounded-3xl border bg-card p-4", className)}>
            <header>
                <h2 id={headingId} className="font-visual-title text-visual-title font-semibold text-emphasis-foreground">
                    Watchlist
                </h2>
                <p className="text-visual-subtitle text-muted-foreground">
                    Private notes on {areaName}. Only you can see them.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="flex flex-col gap-2" noValidate>
                <label htmlFor={inputId} className="text-300 font-semibold text-foreground">
                    Note about {areaName}
                </label>
                <textarea
                    id={inputId}
                    value={draft}
                    onChange={(event) => {
                        setDraft(event.target.value);
                        if (validationError) setValidationError(undefined);
                    }}
                    rows={3}
                    aria-describedby={formError ? `${countId} ${errorId}` : countId}
                    aria-invalid={Boolean(validationError) || tooLong}
                    className={cn(
                        "min-h-24 w-full resize-y rounded-2xl border bg-background p-3 text-300 text-foreground",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                        tooLong && "border-destructive",
                    )}
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                        id={countId}
                        aria-live="polite"
                        className={cn("font-monospace text-200", tooLong ? "text-destructive" : "text-muted-foreground")}
                    >
                        {length} / {WATCH_NOTE_MAX_LENGTH}
                    </span>
                    <button
                        type="submit"
                        disabled={!canSave}
                        aria-busy={saving}
                        className={cn(
                            "h-11 rounded-full bg-brand px-5 text-300 font-semibold text-on-brand",
                            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                            "disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground",
                        )}
                    >
                        {saving ? "Saving…" : "Save note"}
                    </button>
                </div>
                {formError && (
                    <p id={errorId} role="alert" className="text-300 text-destructive">
                        {formError}
                    </p>
                )}
            </form>

            {deleteError && <NotesErrorMessage error={deleteError} />}

            <WatchNoteList
                areaName={areaName}
                state={state}
                deletingId={deletingId}
                onDelete={(id) => void remove(id)}
                onRetry={() => void reload()}
            />
        </section>
    );
}
