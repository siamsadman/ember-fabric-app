import { formatPercentChange, formatTwh } from "@/lib/format";
import { formatYearMonth, type YoyRow } from "@/lib/monthly-yoy";

const LABELS: Record<string, string> = {
    Gas: "Gas",
    Coal: "Coal",
    "Total generation": "Total generation",
};

function YoyCard({ row }: { row: YoyRow }) {
    const label = LABELS[row.source] ?? row.source;
    const comparison =
        row.yearEarlierTWh === undefined
            ? `No value for ${formatYearMonth(row.yearEarlierMonth)}`
            : `vs ${formatTwh(row.yearEarlierTWh)} TWh in ${formatYearMonth(row.yearEarlierMonth)}` +
              (row.change === undefined ? "" : ` (${formatPercentChange(row.change)})`);

    return (
        <div className="flex min-w-0 flex-col gap-2 rounded-3xl border bg-card p-4">
            <dt className="font-monospace text-200 uppercase tracking-wide text-muted-foreground">
                {label}, {formatYearMonth(row.latestMonth)}
            </dt>
            <dd className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-numeric text-600 font-medium text-emphasis-foreground sm:text-hero-800">
                    {formatTwh(row.latestTWh)}
                </span>
                {row.latestTWh !== undefined && <span className="font-monospace text-300 text-muted-foreground">TWh</span>}
            </dd>
            <dd className="text-200 text-muted-foreground">{comparison}</dd>
        </div>
    );
}

/** Latest month vs the same month a year earlier, one card per source. */
export function MonthlyYoyCards({ areaName, rows }: { areaName: string; rows: YoyRow[] }) {
    return (
        <dl
            className="grid grid-cols-1 gap-grid sm:grid-cols-3"
            aria-label={`${areaName}: latest month compared with the same month a year earlier`}
        >
            {rows.map((row) => (
                <YoyCard key={row.source} row={row} />
            ))}
        </dl>
    );
}
