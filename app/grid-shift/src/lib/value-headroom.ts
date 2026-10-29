import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { DataTable } from "@microsoft/fabric-visuals-core";
import { asNumber, toRecords } from "./table-records";

type XEncoding = { field?: string; scale?: Record<string, unknown> };
type SpecWithX = { encoding?: { x?: XEncoding } & Record<string, unknown> };

/**
 * Upper end of an x domain: the largest value times `factor`, rounded up to a multiple of
 * `roundTo` when given. Never below `max * factor`, so the longest bar keeps that headroom.
 */
export function headroomMax(max: number, factor: number, roundTo?: number): number {
    const target = max * factor;
    return roundTo && roundTo > 0 ? Math.ceil(target / roundTo) * roundTo : target;
}

/**
 * Returns a copy of a horizontal-bar spec whose top-level `x` scale runs from 0 to
 * {@link headroomMax} of the largest `field` value, so the value label after the longest bar
 * has room instead of being clipped at the plot edge. Rounding to `roundTo` gives a tidy
 * axis end, e.g. 696 gCO2/kWh with factor 1.12 and roundTo 100 ends the axis at 800, while
 * 850 would end it at 1,000. Display only: the data is not changed.
 */
export function withValueHeadroom(
    spec: VisualizationSpec,
    table: DataTable,
    field: string,
    factor = 1.25,
    roundTo?: number,
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
        encoding: {
            ...node.encoding,
            x: { ...x, scale: { ...x.scale, domain: [0, headroomMax(max, factor, roundTo)], nice: false } },
        },
    } as VisualizationSpec;
}
