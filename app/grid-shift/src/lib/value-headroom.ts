import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { DataTable } from "@microsoft/fabric-visuals-core";
import { asNumber, toRecords } from "./table-records";

type XEncoding = { field?: string; scale?: Record<string, unknown> };
type SpecWithX = { encoding?: { x?: XEncoding } & Record<string, unknown> };

/**
 * Returns a copy of a horizontal-bar spec whose top-level `x` scale runs from 0 to the
 * largest `field` value times `factor`, so the value label after the longest bar has room
 * instead of being clipped at the plot edge. Display only: the data is not changed.
 */
export function withValueHeadroom(
    spec: VisualizationSpec,
    table: DataTable,
    field: string,
    factor = 1.25,
): VisualizationSpec {
    const node = spec as SpecWithX;
    const x = node.encoding?.x;
    if (!x || x.field !== field) return spec;

    const values = toRecords(table)
        .map((r) => asNumber(r[field]))
        .filter((v): v is number => v !== undefined);
    const max = Math.max(0, ...values);
    if (max === 0) return spec;

    return {
        ...node,
        encoding: { ...node.encoding, x: { ...x, scale: { ...x.scale, domain: [0, max * factor], nice: false } } },
    } as VisualizationSpec;
}
