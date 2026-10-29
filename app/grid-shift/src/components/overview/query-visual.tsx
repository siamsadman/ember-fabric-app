import { VegaVisual, type VisualizationSpec } from "@microsoft/fabric-visuals";
import type { DataTable, InteractionEventCallback } from "@microsoft/fabric-visuals-core";
import { VisualContainer } from "@microsoft/fabric-visuals-extensibility";
import { useThemeContext } from "@/hooks/theme.context";
import { useSemanticModelQuery } from "@/hooks/use-semantic-model-query";
import { fuelLegendItems, withFuelColors } from "@/lib/source-colors";
import { toRecords, type TableRecord } from "@/lib/table-records";
import { toDataTable, type ColumnMetadataMap } from "@/lib/to-data-table";
import { cn } from "@/lib/utils";
import { FuelLegend } from "./fuel-legend";
import { queryFailure } from "./query-failure";
import { PanelFrame, QueryErrorBanner, Skeleton } from "./query-state";

interface VisualConfig {
    connection: string;
    query: string;
    columnMetadata: ColumnMetadataMap;
    vegaLiteSpec: VisualizationSpec;
}

interface QueryVisualProps {
    config: VisualConfig;
    title: string;
    /** Subtitle derived from the result, e.g. the year it covers. */
    subtitle: (records: TableRecord[]) => string;
    /** Plain-text alternative for the chart, read by screen readers. */
    describe: (records: TableRecord[]) => string;
    emptyMessage: string;
    /** Color `Fuel` encodings with `dim_source[color_hex]` from the result, at 3:1 contrast on the card. */
    fuelColors?: boolean;
    /** Render a wrapping fuel legend row under the chart (needs `fuelColors`; the spec's own legend should be off). */
    fuelLegend?: boolean;
    /** Display-only spec changes that depend on the result, e.g. axis headroom for labels. */
    adjustSpec?: (spec: VisualizationSpec, table: DataTable) => VisualizationSpec;
    /** Visible one-line takeaway under the chart, computed from the result. */
    takeaway?: (records: TableRecord[]) => string | undefined;
    /** Grid placement of the panel. */
    className: string;
    /** Height of the chart card. */
    heightClassName: string;
    onInteraction?: InteractionEventCallback;
}

/** Runs one overview query and renders its Vega-Lite visual with loading, empty and error states. */
export function QueryVisual({
    config,
    title,
    subtitle,
    describe,
    emptyMessage,
    fuelColors = false,
    fuelLegend = false,
    adjustSpec,
    takeaway,
    className,
    heightClassName,
    onInteraction,
}: QueryVisualProps) {
    const { theme } = useThemeContext();
    const { data, isLoading } = useSemanticModelQuery({ connection: config.connection, query: config.query });
    const frameClassName = cn(className, heightClassName);

    const failure = queryFailure(data);
    if (failure) {
        return (
            <PanelFrame title={title} className={frameClassName}>
                <QueryErrorBanner failure={failure} />
            </PanelFrame>
        );
    }

    if (data?.status !== "success") {
        return (
            <PanelFrame title={title} subtitle={isLoading ? "Loading" : undefined} className={frameClassName}>
                <Skeleton className="h-full min-h-40 w-full" />
            </PanelFrame>
        );
    }

    const table: DataTable = toDataTable(data.table, config.columnMetadata);
    const records = toRecords(table);

    if (records.length === 0) {
        return (
            <PanelFrame title={title} className={frameClassName}>
                <p className="text-center text-300 text-muted-foreground">{emptyMessage}</p>
            </PanelFrame>
        );
    }

    let spec = fuelColors ? withFuelColors(config.vegaLiteSpec, table, theme.background) : config.vegaLiteSpec;
    if (adjustSpec) spec = adjustSpec(spec, table);
    const takeawayText = takeaway?.(records);
    const legendItems = fuelColors && fuelLegend ? fuelLegendItems(table, theme.background) : [];

    // Hand-authored container: the built-in structured header truncates the subtitle to one
    // line, and the takeaway has to sit inside the card body under the chart.
    return (
        <figure className={cn("min-w-0", className)} aria-busy={isLoading}>
            <VisualContainer
                header={
                    <div className="min-w-0">
                        <h2 className="font-visual-title text-visual-title font-semibold text-emphasis-foreground">{title}</h2>
                        <p className="mt-0.5 text-visual-subtitle text-muted-foreground">{subtitle(records)}</p>
                    </div>
                }
                builtInActionIds={["copyVisual"]}
                rootClassName={cn("min-w-0", heightClassName)}
                className="rounded-3xl"
            >
                <div className="flex h-full min-h-0 flex-col gap-3">
                    <div className="min-h-0 flex-1">
                        <VegaVisual
                            spec={spec}
                            data={table}
                            theme={theme}
                            chromeless
                            className="h-full w-full"
                            onInteraction={onInteraction}
                        />
                    </div>
                    <FuelLegend items={legendItems} />
                    {takeawayText && (
                        <p className="shrink-0 border-l-2 border-brand pl-3 text-400 font-medium text-foreground">
                            {takeawayText}
                        </p>
                    )}
                </div>
            </VisualContainer>
            <figcaption className="sr-only">{describe(records)}</figcaption>
        </figure>
    );
}
