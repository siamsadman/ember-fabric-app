import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { validateNote, WATCH_NOTE_MAX_LENGTH } from "./watch-notes";

describe("validateNote", () => {
    it("trims and accepts a note within the limit", () => {
        expect(validateNote("  Gas share fell again  ")).toEqual({ ok: true, value: "Gas share fell again" });
    });

    it("rejects empty and whitespace-only notes", () => {
        for (const draft of ["", "   ", "\n\t "]) {
            const result = validateNote(draft);
            expect(result.ok).toBe(false);
            if (!result.ok) expect(result.error).toBe("Write a note before saving.");
        }
    });

    it("accepts exactly the maximum length and rejects one more", () => {
        expect(validateNote("a".repeat(WATCH_NOTE_MAX_LENGTH)).ok).toBe(true);
        const over = validateNote("a".repeat(WATCH_NOTE_MAX_LENGTH + 1));
        expect(over).toEqual({
            ok: false,
            error: `Notes can be up to ${WATCH_NOTE_MAX_LENGTH} characters. This one is ${WATCH_NOTE_MAX_LENGTH + 1}.`,
        });
    });

    it("measures length after trimming", () => {
        expect(validateNote(`  ${"a".repeat(WATCH_NOTE_MAX_LENGTH)}  `).ok).toBe(true);
    });
});

describe("WATCH_NOTE_MAX_LENGTH", () => {
    // The entity file uses TC39 decorators, so read it as text instead of importing it.
    it("matches the database column limit declared on the WatchNote entity", () => {
        const entity = readFileSync(resolve(__dirname, "../../rayfin/data/WatchNote.ts"), "utf8");
        expect(entity).toContain(`export const WATCH_NOTE_MAX = ${WATCH_NOTE_MAX_LENGTH};`);
        expect(entity).toMatch(/@text\(\{ min: 1, max: WATCH_NOTE_MAX \}\) note!: string;/);
    });
});
