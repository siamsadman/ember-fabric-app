import { CalendarOff } from "lucide-react";
import { useSemanticModelQuery } from "@/hooks/use-semantic-model-query";
import { areaPossessive } from "@/lib/area-names";
import { formatTwh } from "@/lib/format";
import { formatYearMonth, parseYearMonth, toYoyRows } from "@/lib/monthly-yoy";
import { asNumber, toRecords, type TableRecord } from "@/lib/table-records";
import { toDataTable } from "@/lib/to-data-table";
import { monthlyMix, monthlyYoy } from "@/queries";
import { queryFailure } from "../overview/query-failure";
import { QueryErrorBanner, Skeleton } from "../overview/query-state";
import { QueryVisual } from "../overview/query-visual";
import { MonthlyYoyCards } from "./monthly-yoy-cards";

/** Shown when the model has no monthly rows for the area. States the fact; no placeholder numbers. */
export function MonthlyEmptyState({ areaName }: { areaName: string }) {
    return (
        <section
            aria-label={`Monthly data for ${areaName}`}
            className="flex flex-col items-center gap-3 rounded-3xl border bg-card p-8 text-center"
        >
            <CalendarOff aria-hidden="true" className="icon-size-600 text-muted-foreground" />
            <h2 className="font-visual-title text-visual-title font-semibold text-emphasis-foreground">
                Monthly data is not available for {areaName}
            </h2>
            <p className="max-w-prose text-300 text-muted-foreground">
                The Ember dataset in sm_grid_shift has no monthly generation rows for {areaName}. Its yearly figures
                are on the Overview.
            </p>
        </section>
    );
}

function monthRange(records: TableRecord[]): { first?: string; last?: string } {
    const months = records
        .map((r) => (typeof r.Month === "string" ? r.Month : undefined))
        .filter((m): m is string => m !== undefined)
        .sort();
    return { first: months[0], last: months[months.length - 1] };
}

/** "Gas 3.46 TWh, Coal 3.85 TWh" for one month, largest first. */
function describeMonth(records: TableRecord[], month: string | undefined): string {
    return records
        .filter((r) => r.Month === month && (asNumber(r.TWh) ?? 0) > 0)
        .sort((a, b) => (asNumber(b.TWh) ?? 0) - (asNumber(a.TWh) ?? 0))
        .map((r) => `${String(r.Fuel)} ${formatTwh(asNumber(r.TWh))} TWh`)
        .join(", ");
}

function MonthlyMixChart({ areaName }: { areaName: string }) {
    return (
        <QueryVisual
            config={monthlyMix({ area: areaName })}
            title="Monthly generation by source"
            subtitle={(records) => {
                const { first, last } = monthRange(records);
                return `${areaName}, ${formatYearMonth(parseYearMonth(first))} to ${formatYearMonth(parseYearMonth(last))}, TWh. Individual fuels only; net imports are not included.`;
            }}
            describe={(records) => {
                const { first, last } = monthRange(records);
                return (
                    `Stacked area chart of ${areaPossessive(areaName)} monthly generation by fuel. ` +
                    `${formatYearMonth(parseYearMonth(first))}: ${describeMonth(records, first)}. ` +
                    `${formatYearMonth(parseYearMonth(last))}: ${describeMonth(records, last)}.`
                );
            }}
            emptyMessage={`Monthly data is not available for ${areaName}.`}
            fuelColors
            fuelLegend
            className=""
            heightClassName="h-120 sm:h-112"
        />
    );
}

/**
 * The Monthly view for one area. The year-over-year query decides whether the area has
 * monthly data at all: no rows means no monthly total generation, so one empty state is
 * shown instead of two empty panels.
 */
export function MonthlyView({ areaName }: { areaName: string }) {
    const config = monthlyYoy({ area: areaName });
    const { data } = useSemanticModelQuery({ connection: config.connection, query: config.query });

    const failure = queryFailure(data);
    if (failure) return <QueryErrorBanner failure={failure} />;

    if (data?.status !== "success") {
        return (
            <div className="flex flex-col gap-grid" aria-busy="true">
                <span className="sr-only">Loading monthly data for {areaName}</span>
                <div className="grid grid-cols-1 gap-grid sm:grid-cols-3">
                    {[0, 1, 2].map((i) => (
                        <Skeleton key={i} className="h-36 rounded-3xl" />
                    ))}
                </div>
                <Skeleton className="h-112 rounded-3xl" />
            </div>
        );
    }

    const rows = toYoyRows(toRecords(toDataTable(data.table, config.columnMetadata)));
    if (rows.length === 0) return <MonthlyEmptyState areaName={areaName} />;

    return (
        <div className="flex flex-col gap-grid">
            <MonthlyYoyCards areaName={areaName} rows={rows} />
            <MonthlyMixChart areaName={areaName} />
        </div>
    );
}
