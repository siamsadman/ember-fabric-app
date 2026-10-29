import { useSemanticModelQuery } from "@/hooks/use-semantic-model-query";
import { formatOneDecimal, formatPercent, formatPoints, formatWhole } from "@/lib/format";
import { asNumber, toRecords } from "@/lib/table-records";
import { toDataTable } from "@/lib/to-data-table";
import { overviewKpis } from "@/queries";
import { queryFailure } from "./query-failure";
import { QueryErrorBanner, Skeleton } from "./query-state";

interface KpiCardProps {
    label: string;
    value: string;
    unit?: string;
    note: string;
}

function KpiCard({ label, value, unit, note }: KpiCardProps) {
    return (
        <div className="flex min-w-0 flex-col gap-2 rounded-3xl border bg-card p-4">
            <dt className="font-monospace text-200 uppercase tracking-wide text-muted-foreground">{label}</dt>
            {/* Two cards share a 390px row on phones; "31,923.2 TWh" (World demand) needs the smaller size and the wrap. */}
            <dd className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-numeric text-600 font-medium text-emphasis-foreground sm:text-hero-800">{value}</span>
                {unit && <span className="font-monospace text-300 text-muted-foreground">{unit}</span>}
            </dd>
            <dd className="text-200 text-muted-foreground">{note}</dd>
        </div>
    );
}

/** Four headline KPIs for the selected area in its latest year. */
export function KpiCards({ area }: { area: string }) {
    const config = overviewKpis({ area });
    const { data } = useSemanticModelQuery({ connection: config.connection, query: config.query });

    const failure = queryFailure(data);
    if (failure) return <QueryErrorBanner failure={failure} />;

    if (data?.status !== "success") {
        return (
            <div className="grid grid-cols-2 gap-grid lg:grid-cols-4" aria-label="Loading KPIs">
                {[0, 1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-36 rounded-3xl" />
                ))}
            </div>
        );
    }

    const [kpi] = toRecords(toDataTable(data.table, config.columnMetadata));
    if (!kpi) {
        return (
            <p className="rounded-3xl border bg-card p-4 text-300 text-muted-foreground">
                No yearly generation data for {area}.
            </p>
        );
    }

    const year = asNumber(kpi.Year);
    const gasYoY = asNumber(kpi.GasShareYoYPts);
    const importShare = asNumber(kpi.ImportShare);
    const cleanShare = asNumber(kpi.CleanShare);

    return (
        <dl className="grid grid-cols-2 gap-grid lg:grid-cols-4" aria-label={`${area} key figures, ${year}`}>
            <KpiCard
                label="Carbon intensity"
                value={formatWhole(asNumber(kpi.CarbonIntensity))}
                unit="gCO2/kWh"
                note={`Emissions per unit generated, ${year}`}
            />
            <KpiCard
                label="Gas share"
                value={formatPercent(asNumber(kpi.GasShare))}
                note={gasYoY === undefined ? `Of generation, ${year}` : `${formatPoints(gasYoY)} vs ${year! - 1}`}
            />
            <KpiCard
                label="Import share"
                value={formatPercent(importShare)}
                note={importShare === undefined ? `No net import data, ${year}` : `Net imports vs generation, ${year}`}
            />
            <KpiCard
                label="Total demand"
                value={formatOneDecimal(asNumber(kpi.DemandTWh))}
                unit="TWh"
                note={`Clean share ${formatPercent(cleanShare)}, ${year}`}
            />
        </dl>
    );
}
