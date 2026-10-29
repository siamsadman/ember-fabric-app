import type { DataTable } from "@microsoft/fabric-visuals-core";

/** One result row keyed by each column's Vega-safe `name`. */
export type TableRecord = Record<string, unknown>;

/** Converts a row-major `DataTable` into objects keyed by column `name`. */
export function toRecords(table: DataTable): TableRecord[] {
    return table.rows.map((row) => {
        const record: TableRecord = {};
        table.columns.forEach((column, index) => {
            record[column.name] = row[index] ?? null;
        });
        return record;
    });
}

/** Returns a finite number, or `undefined` for blanks and non-numeric values. */
export function asNumber(value: unknown): number | undefined {
    return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
