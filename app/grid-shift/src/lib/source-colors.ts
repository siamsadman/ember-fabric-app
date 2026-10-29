import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { DataTable } from "@microsoft/fabric-visuals-core";
import { ensureContrast } from "./color-contrast";
import { asNumber, toRecords } from "./table-records";

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

interface FuelColor {
    fuel: string;
    color: string;
    sortOrder: number;
}

/**
 * Reads each fuel's `dim_source[color_hex]` and `dim_source[sort_order]` from a query result
 * (columns aliased `Fuel`, `ColorHex`, `SortOrder`), ordered by sort order. Fuels without a
 * valid hex color are skipped so the theme palette is used instead.
 */
export function fuelColors(table: DataTable): FuelColor[] {
    const byFuel = new Map<string, FuelColor>();
    for (const record of toRecords(table)) {
        const fuel = record.Fuel;
        const color = record.ColorHex;
        if (typeof fuel !== "string" || typeof color !== "string" || !HEX_COLOR.test(color)) continue;
        if (!byFuel.has(fuel)) {
            byFuel.set(fuel, { fuel, color, sortOrder: asNumber(record.SortOrder) ?? Number.MAX_SAFE_INTEGER });
        }
    }
    return [...byFuel.values()].sort((a, b) => a.sortOrder - b.sortOrder);
}

type EncodingHolder = { encoding?: Record<string, unknown>; layer?: EncodingHolder[] };

function applyScale(node: EncodingHolder, scale: { domain: string[]; range: string[] }): EncodingHolder {
    const next: EncodingHolder = { ...node };
    const color = node.encoding?.color as { field?: string; scale?: object } | undefined;
    if (color?.field === "Fuel") {
        next.encoding = { ...node.encoding, color: { ...color, scale: { ...color.scale, ...scale } } };
    }
    if (node.layer) {
        next.layer = node.layer.map((layer) => applyScale(layer, scale));
    }
    return next;
}

/**
 * Returns a copy of a spec whose `Fuel` color encodings (top level and layers) use the
 * model's own fuel colors and sort order. The spec is unchanged when no colors are found.
 *
 * When `surface` (the chart's card color) is given, any fuel color below 3:1 contrast
 * against it is shaded until it passes, e.g. solar `#ffd23f` on a white light-theme card.
 */
export function withFuelColors(spec: VisualizationSpec, table: DataTable, surface?: string): VisualizationSpec {
    const colors = fuelColors(table);
    if (colors.length === 0) return spec;
    const range = colors.map((c) => (surface ? ensureContrast(c.color, surface) : c.color));
    const scale = { domain: colors.map((c) => c.fuel), range };
    return applyScale(spec as EncodingHolder, scale) as VisualizationSpec;
}
