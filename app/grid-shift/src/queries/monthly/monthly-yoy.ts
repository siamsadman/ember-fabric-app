import type { ColumnMetadataMap } from "@/lib/to-data-table";
import { connection, DEFAULT_AREA, withArea } from "../overview/area-param";
import baseQuery from "./monthly-yoy.dax?raw";

const columnMetadata: ColumnMetadataMap = {
    "dim_source[source_name]": { name: "Source", displayName: "Source" },
    "dim_source[sort_order]": { name: "SortOrder", displayName: "Sort order" },
    "[Latest Month]": { name: "LatestMonth", displayName: "Latest month" },
    "[Latest TWh]": { name: "LatestTWh", displayName: "Latest month (TWh)", format: "#,0.00" },
    "[Year Earlier Month]": { name: "YearEarlierMonth", displayName: "Same month a year earlier" },
    "[Year Earlier TWh]": { name: "YearEarlierTWh", displayName: "Year earlier (TWh)", format: "#,0.00" },
};

/** Gas, coal and total generation in the latest month vs the same month a year earlier. */
export function monthlyYoy(params?: { area?: string }) {
    return {
        connection,
        query: withArea(baseQuery, params?.area ?? DEFAULT_AREA),
        columnMetadata,
    };
}
