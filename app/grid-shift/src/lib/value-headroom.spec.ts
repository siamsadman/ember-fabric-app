import { describe, expect, it } from "vitest";
import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { DataTable } from "@microsoft/fabric-visuals-core";
import { withValueHeadroom } from "./value-headroom";

// Same column shape as the peer-intensity query after toDataTable.
const table: DataTable = {
    columns: [{ name: "Year" }, { name: "Area" }, { name: "CarbonIntensity" }, { name: "IsSelected" }],
    rows: [
        [2025, "Bangladesh", 696.09540482247, 1],
        [2025, "World", 460.1046180203658, 0],
        [2025, "Nowhere", null, 0],
    ],
};

const spec = {
    encoding: { x: { field: "CarbonIntensity", type: "quantitative", scale: { zero: true } } },
    layer: [{ mark: "bar" }],
} as unknown as VisualizationSpec;

describe("withValueHeadroom", () => {
    it("extends the x domain past the largest value without mutating the spec", () => {
        const result = withValueHeadroom(spec, table, "CarbonIntensity", 1.2) as unknown as {
            encoding: { x: { scale: { domain: number[]; nice: boolean; zero: boolean } } };
        };
        expect(result.encoding.x.scale.domain[0]).toBe(0);
        expect(result.encoding.x.scale.domain[1]).toBeCloseTo(696.09540482247 * 1.2, 6);
        expect(result.encoding.x.scale.nice).toBe(false);
        expect(result.encoding.x.scale.zero).toBe(true);
        expect((spec as unknown as { encoding: { x: { scale: object } } }).encoding.x.scale).toEqual({ zero: true });
    });

    it("leaves the spec alone when x is another field or there are no values", () => {
        expect(withValueHeadroom(spec, table, "Share")).toBe(spec);
        expect(withValueHeadroom(spec, { columns: table.columns, rows: [] }, "CarbonIntensity")).toBe(spec);
    });
});
