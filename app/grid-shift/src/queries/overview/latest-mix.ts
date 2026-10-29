import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import baseQuery from "./latest-mix.dax?raw";
import spec from "./latest-mix.json";
import { connection, DEFAULT_AREA, withArea } from "./area-param";

const columnMetadata: ColumnMetadataMap = {
    "dim_year[year]": { name: "Year", displayName: "Year", format: "0" },
    "dim_source[source_name]": { name: "Fuel", displayName: "Fuel" },
    "dim_source[sort_order]": { name: "SortOrder", displayName: "Sort order" },
    "dim_source[color_hex]": { name: "ColorHex", displayName: "Color" },
    // No `format`: a column format overrides the spec's ".1%" bar labels (12.0% shows as 12%).
    "[Share]": { name: "Share", displayName: "Share of generation" },
    "[Generation TWh]": { name: "GenerationTWh", displayName: "Generation (TWh)", format: "#,0.0" },
};

/** Generation mix by individual fuel in the area's latest year with data. */
export function latestMix(params?: { area?: string }) {
    return {
        connection,
        query: withArea(baseQuery, params?.area ?? DEFAULT_AREA),
        columnMetadata,
        vegaLiteSpec: spec as VisualizationSpec,
    };
}
