import { VegaVisual, type VisualizationSpec } from "@microsoft/fabric-visuals";
import type { DataTable, InteractionEventCallback } from "@microsoft/fabric-visuals-core";
import { useThemeContext } from "@/hooks/theme.context";
import { useSemanticModelQuery } from "@/hooks/use-semantic-model-query";
import { withFuelColors } from "@/lib/source-colors";
import { toRecords, type TableRecord } from "@/lib/table-records";
import { toDataTable, type ColumnMetadataMap } from "@/lib/to-data-table";
import { cn } from "@/lib/utils";
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

    return (
        <figure className={cn("flex min-w-0 flex-col gap-2", className)} aria-busy={isLoading}>
            <VegaVisual
                spec={spec}
                data={table}
                theme={theme}
                header={{ title, subtitle: subtitle(records) }}
                containerRootClassName={cn("min-w-0", heightClassName)}
                containerClassName="rounded-3xl"
                onInteraction={onInteraction}
            />
            {takeawayText && <p className="px-2 text-300 text-foreground">{takeawayText}</p>}
            <figcaption className="sr-only">{describe(records)}</figcaption>
        </figure>
    );
}
