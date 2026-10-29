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

    const remove = useCallback(async (id: string) => {
        setDeletingId(id);
        setDeleteError(undefined);
        try {
            await deleteWatchNote(id);
            setState((prev) =>
                prev.status === "ready" ? { ...prev, notes: prev.notes.filter((n) => n.id !== id) } : prev,
            );
        } catch (err) {
            setDeleteError(asNotesError(err));
        } finally {
            setDeletingId(undefined);
        }
    }, []);

    return { state, reload: load, save, saving, saveError, remove, deletingId, deleteError };
}
