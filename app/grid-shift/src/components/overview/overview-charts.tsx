import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { DataTable, InteractionEvent } from "@microsoft/fabric-visuals-core";
import { useMediaQuery } from "@/hooks/use-media-query";
import { formatPercent, formatWhole } from "@/lib/format";
import { mixTakeaway } from "@/lib/mix-takeaway";
import { asNumber, type TableRecord } from "@/lib/table-records";
import { withValueHeadroom } from "@/lib/value-headroom";
import { latestMix, mixOverTime, peerIntensity } from "@/queries";
import { QueryVisual } from "./query-visual";

function yearOf(records: TableRecord[]): number | undefined {
    return asNumber(records[0]?.Year);
}

/** "Gas 64.3%, Coal 21.5%" for the fuels with a non-zero share, largest first. */
function describeMix(records: TableRecord[]): string {
    return records
        .filter((r) => (asNumber(r.Share) ?? 0) > 0)
        .sort((a, b) => (asNumber(b.Share) ?? 0) - (asNumber(a.Share) ?? 0))
        .map((r) => `${String(r.Fuel)} ${formatPercent(asNumber(r.Share))}`)
        .join(", ");
}

/** Sets the column count of the spec's top-level color legend. */
function withLegendColumns(spec: VisualizationSpec, columns: number): VisualizationSpec {
    const node = spec as { encoding?: { color?: { legend?: object } } & Record<string, unknown> };
    const color = node.encoding?.color;
    if (!color?.legend) return spec;
    return {
        ...node,
        encoding: { ...node.encoding, color: { ...color, legend: { ...color.legend, columns } } },
    } as VisualizationSpec;
}

interface ChartProps {
    area: string;
    className: string;
    heightClassName: string;
}

export function MixOverTimeChart({ area, className, heightClassName }: ChartProps) {
    // Five legend columns overflow a phone-width plot; two fit "Other renewables".
    const wide = useMediaQuery("(min-width: 640px)");

    return (
        <QueryVisual
            config={mixOverTime({ area })}
            title="Share of generation by fuel"
            subtitle={(records) => {
                const years = records.map((r) => asNumber(r.Year)).filter((y) => y !== undefined);
                return `${area}, ${Math.min(...years)} to ${Math.max(...years)}`;
            }}
            describe={(records) => {
                const years = records.map((r) => asNumber(r.Year)).filter((y) => y !== undefined);
                const first = Math.min(...years);
                const last = Math.max(...years);
                const inYear = (year: number) => records.filter((r) => r.Year === year);
                return `Stacked area chart of ${area}'s generation mix. ${first}: ${describeMix(inYear(first))}. ${last}: ${describeMix(inYear(last))}.`;
            }}
            takeaway={mixTakeaway}
            emptyMessage={`No yearly generation mix for ${area} since 2000.`}
            fuelColors
            adjustSpec={(spec) => withLegendColumns(spec, wide ? 5 : 2)}
            className={className}
            heightClassName={heightClassName}
        />
    );
}

export function LatestMixChart({ area, className, heightClassName }: ChartProps) {
    return (
        <QueryVisual
            config={latestMix({ area })}
            title="Mix in the latest year"
            subtitle={(records) => {
                const zero = records.filter((r) => (asNumber(r.Share) ?? 0) <= 0).map((r) => String(r.Fuel));
                const base = `${area}, ${yearOf(records)}`;
                return zero.length > 0 ? `${base}. No generation from ${zero.join(", ")}.` : base;
            }}
            describe={(records) => `Bar chart of ${area}'s generation mix in ${yearOf(records)}: ${describeMix(records)}.`}
            emptyMessage={`No generation mix for ${area}.`}
            fuelColors
            adjustSpec={(spec: VisualizationSpec, table: DataTable) => withValueHeadroom(spec, table, "Share", 1.3)}
            className={className}
            heightClassName={heightClassName}
        />
    );
}

interface PeerIntensityChartProps extends ChartProps {
    onSelectArea: (area: string) => void;
}

export function PeerIntensityChart({ area, className, heightClassName, onSelectArea }: PeerIntensityChartProps) {
    // Axis end = largest value plus headroom, rounded up to 100 (696 -> 800 on wide screens).
    // A narrow plot needs more room for the value label after the longest bar.
    const wide = useMediaQuery("(min-width: 640px)");
    const headroom = wide ? 1.12 : 1.25;

    const handleInteraction = (events: InteractionEvent[]) => {
        for (const event of events) {
            if (event.action !== "select") continue;
            for (const predicate of event.selections[0]?.predicates ?? []) {
                if (predicate.type === "set" && predicate.name === "Area" && typeof predicate.values[0] === "string") {
                    onSelectArea(predicate.values[0]);
                }
            }
        }
    };

    return (
        <QueryVisual
            config={peerIntensity({ area })}
            title="Carbon intensity vs South Asia peers"
            subtitle={(records) =>
                `gCO2 per kWh in ${yearOf(records)}. Peers without data for that year are not shown. Select a bar to switch country.`
            }
            describe={(records) =>
                `Bar chart of carbon intensity in ${yearOf(records)}: ` +
                records.map((r) => `${String(r.Area)} ${formatWhole(asNumber(r.CarbonIntensity))}`).join(", ") +
                " gCO2 per kWh."
            }
            emptyMessage={`No carbon intensity data for ${area} or its peers.`}
            adjustSpec={(spec, table) => withValueHeadroom(spec, table, "CarbonIntensity", headroom, 100)}
            className={className}
            heightClassName={heightClassName}
            onInteraction={handleInteraction}
        />
    );
}
