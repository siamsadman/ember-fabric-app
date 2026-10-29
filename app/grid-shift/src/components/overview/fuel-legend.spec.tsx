import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { DataTable } from "@microsoft/fabric-visuals-core";
import { fuelLegendItems } from "@/lib/source-colors";
import { FuelLegend } from "./fuel-legend";

// Same column shape as the mix-over-time query after toDataTable; nine fuels, more than
// the Vega legend could show before it collapsed to "…N entries".
const fuels = ["Coal", "Gas", "Other fossil", "Hydro", "Wind", "Solar", "Bioenergy", "Other renewables", "Nuclear"];
const table: DataTable = {
    columns: [{ name: "Year" }, { name: "Fuel" }, { name: "SortOrder" }, { name: "ColorHex" }, { name: "Share" }],
    rows: fuels.map((fuel, i) => [2025, fuel, i + 1, "#ffd23f", 0.1]),
};

describe("FuelLegend", () => {
    it("lists every fuel by name, in sort order, as a labelled list", () => {
        render(<FuelLegend items={fuelLegendItems(table)} />);
        const list = screen.getByRole("list", { name: "Fuels" });
        const items = within(list).getAllByRole("listitem");
        expect(items.map((li) => li.textContent)).toEqual(fuels);
    });

    it("draws each swatch in the chart's color and hides it from assistive tech", () => {
        const [first] = fuelLegendItems(table, "#ffffff");
        render(<FuelLegend items={[first]} />);
        const swatch = screen.getByRole("listitem").querySelector("span");
        expect(swatch).toHaveAttribute("aria-hidden", "true");
        // Solar yellow is shaded for the white light-theme card, exactly as in the chart.
        expect(first.color).not.toBe("#ffd23f");
        expect(swatch).toHaveStyle({ backgroundColor: first.color });
    });

    it("renders nothing without fuels", () => {
        const { container } = render(<FuelLegend items={[]} />);
        expect(container).toBeEmptyDOMElement();
    });
});
