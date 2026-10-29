import { describe, expect, it } from "vitest";
import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { DataTable } from "@microsoft/fabric-visuals-core";
import { contrastRatio } from "./color-contrast";
import { fuelColors, withFuelColors } from "./source-colors";

// Same column shape as the latest-mix query after toDataTable.
const table: DataTable = {
    columns: [
        { name: "Year" },
        { name: "Fuel" },
        { name: "SortOrder" },
        { name: "ColorHex" },
        { name: "Share" },
    ],
    rows: [
        [2025, "Gas", 2, "#ff8a4c", 0.6],
        [2025, "Coal", 1, "#8a93a0", 0.2],
        [2024, "Gas", 2, "#ff8a4c", 0.62],
        [2025, "Bad", 3, "not-a-color", 0.1],
    ],
};

describe("fuelColors", () => {
    it("dedupes fuels, orders by sort order and drops invalid colors", () => {
        expect(fuelColors(table)).toEqual([
            { fuel: "Coal", color: "#8a93a0", sortOrder: 1 },
            { fuel: "Gas", color: "#ff8a4c", sortOrder: 2 },
        ]);
    });
});

describe("withFuelColors", () => {
    it("sets domain and range on Fuel color encodings in layers without mutating the spec", () => {
        const spec = {
            layer: [
                { mark: "bar", encoding: { color: { field: "Fuel", type: "nominal", legend: null } } },
                { mark: "text", encoding: { text: { field: "Share" } } },
            ],
        } as unknown as VisualizationSpec;

        const result = withFuelColors(spec, table) as unknown as {
            layer: { encoding: Record<string, { scale?: unknown }> }[];
        };

        expect(result.layer[0].encoding.color.scale).toEqual({
            domain: ["Coal", "Gas"],
            range: ["#8a93a0", "#ff8a4c"],
        });
        expect(result.layer[1].encoding.color).toBeUndefined();
        expect((spec as unknown as { layer: { encoding: { color?: { scale?: unknown } } }[] }).layer[0].encoding.color?.scale).toBeUndefined();
    });

    it("shades colors that fail 3:1 against the given surface and keeps passing ones", () => {
        const spec = { mark: "bar", encoding: { color: { field: "Fuel" } } } as unknown as VisualizationSpec;
        const range = (surface: string) =>
            (withFuelColors(spec, table, surface) as unknown as { encoding: { color: { scale: { range: string[] } } } })
                .encoding.color.scale.range;

        const onWhite = range("#ffffff");
        expect(onWhite).not.toContain("#ff8a4c");
        for (const color of onWhite) expect(contrastRatio(color, "#ffffff")!).toBeGreaterThanOrEqual(3);
        expect(range("#1a211d")).toEqual(["#8a93a0", "#ff8a4c"]);
    });

    it("returns the spec unchanged when the table has no colors", () => {
        const spec = { mark: "area" } as VisualizationSpec;
        expect(withFuelColors(spec, { columns: [{ name: "Fuel" }], rows: [] })).toBe(spec);
    });
});
