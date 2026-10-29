import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import baseQuery from "./mix-over-time.dax?raw";
import spec from "./mix-over-time.json";
import { connection, DEFAULT_AREA, withArea } from "./area-param";

const columnMetadata: ColumnMetadataMap = {
    "dim_year[year]": { name: "Year", displayName: "Year", format: "0" },
    "dim_source[source_name]": { name: "Fuel", displayName: "Fuel" },
    "dim_source[sort_order]": { name: "SortOrder", displayName: "Sort order" },
    "dim_source[color_hex]": { name: "ColorHex", displayName: "Color" },
    "[Share]": { name: "Share", displayName: "Share of generation", format: "0.0%" },
};

/** Share of generation by individual fuel per year, 2000 onward, for one area. */
export function mixOverTime(params?: { area?: string }) {
    return {
        connection,
        query: withArea(baseQuery, params?.area ?? DEFAULT_AREA),
        columnMetadata,
        vegaLiteSpec: spec as VisualizationSpec,
    };
}
