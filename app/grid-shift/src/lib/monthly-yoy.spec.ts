import { describe, expect, it } from "vitest";
import { formatYearMonth, parseYearMonth, toYoyRows } from "./monthly-yoy";

describe("parseYearMonth", () => {
    it("reads the month from the model's date-time text without time-zone shifts", () => {
        expect(parseYearMonth("2026-08-01T00:00:00.000")).toEqual({ year: 2026, month: 8 });
        expect(parseYearMonth("2019-01-01")).toEqual({ year: 2019, month: 1 });
    });

    it("rejects blanks and malformed values", () => {
        expect(parseYearMonth(null)).toBeUndefined();
        expect(parseYearMonth("")).toBeUndefined();
        expect(parseYearMonth("2026-13-01")).toBeUndefined();
    });

    it("formats as a short month and year", () => {
        expect(formatYearMonth({ year: 2026, month: 8 })).toBe("Aug 2026");
        expect(formatYearMonth(undefined)).toBe("n/a");
    });
});

describe("toYoyRows", () => {
    // Rows shaped like the monthly-yoy query after toDataTable + toRecords.
    const row = (Source: string, LatestTWh: number | null, YearEarlierTWh: number | null) => ({
        Source,
        SortOrder: 0,
        LatestMonth: "2026-08-01T00:00:00.000",
        LatestTWh,
        YearEarlierMonth: "2025-08-01T00:00:00.000",
        YearEarlierTWh,
    });

    it("computes the change against the same month a year earlier", () => {
        const [coal] = toYoyRows([row("Coal", 3.854, 3.145)]);
        expect(coal.source).toBe("Coal");
        expect(coal.latestMonth).toEqual({ year: 2026, month: 8 });
        expect(coal.yearEarlierMonth).toEqual({ year: 2025, month: 8 });
        expect(coal.change).toBeCloseTo((3.854 - 3.145) / 3.145, 10);
    });

    it("leaves the change undefined when a value is blank or the earlier value is zero", () => {
        const rows = toYoyRows([row("Coal", null, 1), row("Gas", 1, null), row("Total generation", 2, 0)]);
        expect(rows.map((r) => r.change)).toEqual([undefined, undefined, undefined]);
        expect(rows[0].latestTWh).toBeUndefined();
        expect(rows[1].yearEarlierTWh).toBeUndefined();
    });
});
