import { asNumber, type TableRecord } from "./table-records";

/** A calendar month as returned by the model (`dim_date[month_date]`, ISO date-time text). */
export interface YearMonth {
    year: number;
    /** 1–12 */
    month: number;
}

/**
 * Reads the year and month from an ISO date or date-time string such as
 * "2026-08-01T00:00:00.000". Parsed from the text, not through `Date`, so the time zone
 * of the viewer can never shift the month.
 */
export function parseYearMonth(value: unknown): YearMonth | undefined {
    if (typeof value !== "string") return undefined;
    const match = /^(\d{4})-(\d{2})/.exec(value);
    if (!match) return undefined;
    const month = Number(match[2]);
    return month >= 1 && month <= 12 ? { year: Number(match[1]), month } : undefined;
}

const monthLabel = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" });

/** "Aug 2026" */
export function formatYearMonth(value: YearMonth | undefined): string {
    return value ? monthLabel.format(new Date(value.year, value.month - 1, 1)) : "n/a";
}

export interface YoyRow {
    source: string;
    latestMonth?: YearMonth;
    latestTWh?: number;
    yearEarlierMonth?: YearMonth;
    yearEarlierTWh?: number;
    /** (latest − year earlier) / year earlier, when both exist and the earlier value is above 0. */
    change?: number;
}

/**
 * Shapes the monthly-yoy result (columns `Source`, `LatestMonth`, `LatestTWh`,
 * `YearEarlierMonth`, `YearEarlierTWh`) into rows for display. Blank measures stay
 * `undefined`; nothing is filled in.
 */
export function toYoyRows(records: TableRecord[]): YoyRow[] {
    return records
        .filter((r) => typeof r.Source === "string")
        .map((r) => {
            const latestTWh = asNumber(r.LatestTWh);
            const yearEarlierTWh = asNumber(r.YearEarlierTWh);
            const change =
                latestTWh !== undefined && yearEarlierTWh !== undefined && yearEarlierTWh > 0
                    ? (latestTWh - yearEarlierTWh) / yearEarlierTWh
                    : undefined;
            return {
                source: r.Source as string,
                latestMonth: parseYearMonth(r.LatestMonth),
                latestTWh,
                yearEarlierMonth: parseYearMonth(r.YearEarlierMonth),
                yearEarlierTWh,
                change,
            };
        });
}
