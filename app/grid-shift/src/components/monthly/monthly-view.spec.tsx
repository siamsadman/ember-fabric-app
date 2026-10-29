import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { useCssTheme } from "@microsoft/fabric-visuals";
import { ThemeContext } from "@/hooks/theme.context";
import { useSemanticModelQuery } from "@/hooks/use-semantic-model-query";
import { MonthlyView } from "./monthly-view";

vi.mock("@/hooks/use-semantic-model-query", () => ({ useSemanticModelQuery: vi.fn() }));

type HookResult = ReturnType<typeof useSemanticModelQuery>;

/** A successful hook result with the given raw query columns and rows. */
function success(columns: string[], rows: unknown[][]): HookResult {
    return {
        data: { status: "success", table: { columns: columns.map((name) => ({ name, dataType: "unknown" })), rows } },
        isLoading: false,
        error: undefined,
        refetch: async () => {},
    } as unknown as HookResult;
}

const yoyColumns = [
    "dim_source[source_name]",
    "dim_source[sort_order]",
    "[Latest Month]",
    "[Latest TWh]",
    "[Year Earlier Month]",
    "[Year Earlier TWh]",
];
const mixColumns = ["dim_date[month_date]", "dim_source[source_name]", "dim_source[sort_order]", "dim_source[color_hex]", "[TWh]"];

/** Routes the two monthly queries to their own fixture by query text. */
function mockQueries(yoyRows: unknown[][]) {
    vi.mocked(useSemanticModelQuery).mockImplementation(({ query }) =>
        query.includes("Year Earlier TWh") ? success(yoyColumns, yoyRows) : success(mixColumns, []),
    );
}

function WithTheme({ children }: { children: React.ReactNode }) {
    const theme = useCssTheme();
    return <ThemeContext.Provider value={{ isDark: false, toggleTheme: () => {}, theme }}>{children}</ThemeContext.Provider>;
}

describe("MonthlyView", () => {
    it("shows one clear empty state, and no numbers, for an area without monthly rows", () => {
        mockQueries([]);
        render(<MonthlyView areaName="Nepal" />, { wrapper: WithTheme });

        expect(screen.getByRole("heading", { name: "Monthly data is not available for Nepal" })).toBeInTheDocument();
        expect(screen.queryByText(/TWh/)).not.toBeInTheDocument();
        expect(screen.queryByText("Monthly generation by source")).not.toBeInTheDocument();
    });

    it("shows latest month vs the same month a year earlier from the query rows", () => {
        // Shape of the monthly-yoy result; values are fixture input for the formatting.
        mockQueries([
            ["Coal", 1, "2026-08-01T00:00:00.000", 3.854, "2025-08-01T00:00:00.000", 3.145],
            ["Gas", 2, "2026-08-01T00:00:00.000", 3.461, "2025-08-01T00:00:00.000", 4.29],
            ["Total generation", 20, "2026-08-01T00:00:00.000", 9.149, "2025-08-01T00:00:00.000", null],
        ]);
        render(<MonthlyView areaName="Bangladesh" />, { wrapper: WithTheme });

        const cards = within(screen.getByLabelText(/latest month compared/)).getAllByRole("term");
        expect(cards.map((c) => c.textContent)).toEqual(["Coal, Aug 2026", "Gas, Aug 2026", "Total generation, Aug 2026"]);
        expect(screen.getByText("vs 3.15 TWh in Aug 2025 (+22.5%)")).toBeInTheDocument();
        expect(screen.getByText("vs 4.29 TWh in Aug 2025 (−19.3%)")).toBeInTheDocument();
        expect(screen.getByText("No value for Aug 2025")).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: /not available/ })).not.toBeInTheDocument();
    });
});
