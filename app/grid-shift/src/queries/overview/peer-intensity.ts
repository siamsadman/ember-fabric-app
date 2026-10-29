import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import baseQuery from "./peer-intensity.dax?raw";
import spec from "./peer-intensity.json";
import { connection, DEFAULT_AREA, withArea } from "./area-param";

const columnMetadata: ColumnMetadataMap = {
    "dim_year[year]": { name: "Year", displayName: "Year", format: "0" },
    "dim_area[area_name]": { name: "Area", displayName: "Area" },
    // No `format`: a column format overrides the spec's ",.0f" bar labels (696 shows as 696.1).
    "[Carbon Intensity]": { name: "CarbonIntensity", displayName: "Carbon intensity (gCO2/kWh)" },
    "[Is Selected]": { name: "IsSelected", displayName: "Selected area" },
};

/** Carbon intensity of the selected area vs South Asia peers and the World. */
export function peerIntensity(params?: { area?: string }) {
    return {
        connection,
        query: withArea(baseQuery, params?.area ?? DEFAULT_AREA),
        columnMetadata,
        vegaLiteSpec: spec as VisualizationSpec,
    };
}
