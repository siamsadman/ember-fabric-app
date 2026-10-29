import { formatPercent } from "./format";
import { asNumber, type TableRecord } from "./table-records";

interface ShareRow {
    year: number;
    fuel: string;
    share: number;
}

/** Smallest first-to-latest change, in share points (0.01 = 1 pt), worth calling out. */
const MIN_MOVE = 0.01;

function toShareRows(records: TableRecord[]): ShareRow[] {
    const rows: ShareRow[] = [];
    for (const r of records) {
        const year = asNumber(r.Year);
        const share = asNumber(r.Share);
        if (year !== undefined && share !== undefined && typeof r.Fuel === "string") {
            rows.push({ year, fuel: r.Fuel, share });
        }
    }
    return rows;
}

/**
 * One-line takeaway for the mix-over-time result (columns `Year`, `Fuel`, `Share`), built
 * only from the rows given:
 *
 * - the fuel with the largest share in the latest year, its peak share and peak year, and
 *   its latest share;
 * - the other fuel whose share moved most between the first and latest year (when it moved
 *   at least 1 point and has a value in both years).
 *
 * Returns `undefined` when the result covers fewer than two years.
 */
export function mixTakeaway(records: TableRecord[]): string | undefined {
    const rows = toShareRows(records);
    if (rows.length === 0) return undefined;

    const years = rows.map((r) => r.year);
    const first = Math.min(...years);
    const last = Math.max(...years);
    if (first === last) return undefined;

    const shareIn = (fuel: string, year: number) => rows.find((r) => r.fuel === fuel && r.year === year)?.share;

    const latestRows = rows.filter((r) => r.year === last && r.share > 0);
    if (latestRows.length === 0) return undefined;
    const lead = latestRows.reduce((a, b) => (b.share > a.share ? b : a));

    const peak = rows
        .filter((r) => r.fuel === lead.fuel)
        .reduce((a, b) => (b.share > a.share || (b.share === a.share && b.year < a.year) ? b : a));

    const parts: string[] = [
        peak.year === last
            ? `${lead.fuel} is at its highest share since ${first}: ${formatPercent(lead.share)} in ${last}`
            : `${lead.fuel} peaked at ${formatPercent(peak.share)} in ${peak.year} and is ${formatPercent(lead.share)} in ${last}`,
    ];

    let mover: { fuel: string; from: number; to: number } | undefined;
    for (const fuel of new Set(rows.map((r) => r.fuel))) {
        if (fuel === lead.fuel) continue;
        const from = shareIn(fuel, first);
        const to = shareIn(fuel, last);
        if (from === undefined || to === undefined) continue;
        if (!mover || Math.abs(to - from) > Math.abs(mover.to - mover.from)) mover = { fuel, from, to };
    }
    if (mover && Math.abs(mover.to - mover.from) >= MIN_MOVE) {
        parts.push(
            `${mover.fuel} went from ${formatPercent(mover.from)} in ${first} to ${formatPercent(mover.to)} in ${last}`,
        );
    }

    return `${parts.join("; ")}.`;
}
