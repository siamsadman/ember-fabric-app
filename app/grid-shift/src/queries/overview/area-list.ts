import type { ColumnMetadataMap } from "@/lib/to-data-table";
import query from "./area-list.dax?raw";
import { connection } from "./area-param";

const columnMetadata: ColumnMetadataMap = {
    "dim_area[area_name]": { name: "Area", displayName: "Area" },
    "dim_area[area_type]": { name: "AreaType", displayName: "Area type" },
    "[Latest Year]": { name: "LatestYear", displayName: "Latest year", format: "0" },
};

/** Areas that have yearly generation data, for the country picker. */
export function areaList() {
    return { connection, query, columnMetadata };
}
