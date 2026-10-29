import { describe, expect, it } from "vitest";
import { mixTakeaway } from "./mix-takeaway";

// Rows shaped like the mix-over-time query after toDataTable + toRecords.
const row = (Year: number, Fuel: string, Share: number | null) => ({ Year, Fuel, SortOrder: 0, ColorHex: "#000000", Share });

describe("mixTakeaway", () => {
    it("reports the leading fuel's peak and the biggest mover between first and latest year", () => {
        const records = [
            row(2000, "Coal", 0),
            row(2000, "Gas", 0.8),
            row(2000, "Hydro", 0.1),
            row(2010, "Coal", 0.02),
            row(2010, "Gas", 0.9),
            row(2010, "Hydro", 0.04),
            row(2025, "Coal", 0.215),
            row(2025, "Gas", 0.643),
            row(2025, "Hydro", 0.006),
        ];
        expect(mixTakeaway(records)).toBe(
            "Gas peaked at 90.0% in 2010 and is 64.3% in 2025; Coal went from 0.0% in 2000 to 21.5% in 2025.",
        );
    });

    it("says when the leading fuel is at its peak in the latest year", () => {
        const records = [row(2000, "Hydro", 0.9), row(2000, "Solar", 0.1), row(2024, "Hydro", 0.99), row(2024, "Solar", 0.1)];
        expect(mixTakeaway(records)).toBe("Hydro is at its highest share since 2000: 99.0% in 2024.");
    });

    it("skips movers without a value in both years and small moves", () => {
        const records = [row(2000, "Gas", 0.5), row(2000, "Coal", 0.5), row(2001, "Gas", 0.505), row(2001, "Coal", 0.495), row(2001, "Wind", 0.3)];
        expect(mixTakeaway(records)).toBe("Gas is at its highest share since 2000: 50.5% in 2001.");
    });

    it("returns undefined for a single year or no usable rows", () => {
        expect(mixTakeaway([row(2025, "Gas", 0.6)])).toBeUndefined();
        expect(mixTakeaway([row(2000, "Gas", null), row(2025, "Gas", null)])).toBeUndefined();
    });
});
