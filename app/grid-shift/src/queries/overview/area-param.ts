/** Connector name declared in `rayfin/rayfin.yml`. */
export const connection: string = "gridmodel";

/** Area every overview query defaults to; each `.dax` file declares it on this exact line. */
export const DEFAULT_AREA = "Bangladesh";

const AREA_DECLARATION = `VAR _AreaName = "${DEFAULT_AREA}"`;

/** Escapes a value for use inside a DAX string literal. */
export function toDaxString(value: string): string {
    return `"${value.replace(/"/g, '""')}"`;
}

/**
 * Rebinds the `_AreaName` variable of an overview query to another `dim_area[area_name]`
 * value. Only the literal changes; the query's structure stays in its `.dax` file.
 */
export function withArea(query: string, area: string): string {
    if (!query.includes(AREA_DECLARATION)) {
        throw new Error(`Query does not declare ${AREA_DECLARATION}`);
    }
    return query.replace(AREA_DECLARATION, () => `VAR _AreaName = ${toDaxString(area)}`);
}
