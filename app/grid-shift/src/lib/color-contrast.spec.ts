import { describe, expect, it } from "vitest";
import { contrastRatio, ensureContrast, parseColor } from "./color-contrast";

describe("parseColor", () => {
    it("reads hex and rgb() forms", () => {
        expect(parseColor("#ffd23f")).toEqual([255, 210, 63]);
        expect(parseColor("#fff")).toEqual([255, 255, 255]);
        expect(parseColor("rgb(26, 33, 29)")).toEqual([26, 33, 29]);
        expect(parseColor("var(--x)")).toBeUndefined();
    });
});

describe("contrastRatio", () => {
    it("matches the WCAG extremes", () => {
        expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
        expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
    });
});

describe("ensureContrast", () => {
    it("darkens the model's solar yellow until it reaches 3:1 on a white card", () => {
        expect(contrastRatio("#ffd23f", "#ffffff")!).toBeLessThan(3);
        const adjusted = ensureContrast("#ffd23f", "#ffffff");
        expect(adjusted).not.toBe("#ffd23f");
        expect(contrastRatio(adjusted, "#ffffff")!).toBeGreaterThanOrEqual(3);
    });

    it("lightens a color that is too dark for a dark card", () => {
        const adjusted = ensureContrast("#2a3830", "#1a211d");
        expect(contrastRatio(adjusted, "#1a211d")!).toBeGreaterThanOrEqual(3);
    });

    it("keeps colors that already pass, and unparseable input", () => {
        expect(ensureContrast("#ffd23f", "#1a211d")).toBe("#ffd23f");
        expect(ensureContrast("#ffd23f", "transparent")).toBe("#ffd23f");
    });
});
