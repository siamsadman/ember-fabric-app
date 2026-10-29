import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import { connection, DEFAULT_AREA, withArea } from "../overview/area-param";
import baseQuery from "./monthly-mix.dax?raw";
import spec from "./monthly-mix.json";

// No `format` on TWh: the spec's tooltip format applies (a column format would override it).
const columnMetadata: ColumnMetadataMap = {
    "dim_date[month_date]": { name: "Month", displayName: "Month" },
    "dim_source[source_name]": { name: "Fuel", displayName: "Fuel" },
    "dim_source[sort_order]": { name: "SortOrder", displayName: "Sort order" },
    "dim_source[color_hex]": { name: "ColorHex", displayName: "Color" },
    "[TWh]": { name: "TWh", displayName: "Generation (TWh)" },
};

/** Monthly generation by individual fuel, January 2019 to the latest month, for one area. */
export function monthlyMix(params?: { area?: string }) {
    return {
        connection,
        query: withArea(baseQuery, params?.area ?? DEFAULT_AREA),
        columnMetadata,
        vegaLiteSpec: spec as VisualizationSpec,
    };
}
