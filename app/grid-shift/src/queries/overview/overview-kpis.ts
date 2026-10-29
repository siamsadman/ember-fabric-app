import type { ColumnMetadataMap } from "@/lib/to-data-table";
import baseQuery from "./overview-kpis.dax?raw";
import { connection, DEFAULT_AREA, withArea } from "./area-param";

const columnMetadata: ColumnMetadataMap = {
    "dim_year[year]": { name: "Year", displayName: "Year", format: "0" },
    "[Carbon Intensity]": { name: "CarbonIntensity", displayName: "Carbon intensity (gCO2/kWh)", format: "#,0" },
    "[Gas Share]": { name: "GasShare", displayName: "Gas share", format: "0.0%" },
    "[Gas Share YoY pts]": { name: "GasShareYoYPts", displayName: "Gas share change (pts)", format: "+0.0;-0.0;0.0" },
    "[Import Share]": { name: "ImportShare", displayName: "Import share", format: "0.0%" },
    "[Demand TWh]": { name: "DemandTWh", displayName: "Demand (TWh)", format: "#,0.0" },
    "[Clean Share]": { name: "CleanShare", displayName: "Clean share", format: "0.0%" },
};

/** Headline KPIs for one area in its latest year with generation data. */
export function overviewKpis(params?: { area?: string }) {
    return {
        connection,
        query: withArea(baseQuery, params?.area ?? DEFAULT_AREA),
        columnMetadata,
    };
}
