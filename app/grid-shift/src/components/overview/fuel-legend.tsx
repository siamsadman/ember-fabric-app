import type { FuelLegendItem } from "@/lib/source-colors";

/**
 * Wrapping legend row for fuel-colored charts. Replaces the Vega legend, which collapses
 * to "…N entries" when it runs out of width. Every fuel stays visible at any width.
 */
export function FuelLegend({ items, label = "Fuels" }: { items: FuelLegendItem[]; label?: string }) {
    if (items.length === 0) return null;
    return (
        <ul aria-label={label} className="flex shrink-0 flex-wrap gap-x-4 gap-y-1.5">
            {items.map((item) => (
                <li key={item.fuel} className="flex items-center gap-2 text-200 text-foreground">
                    {/* Data-driven color from dim_source[color_hex]; decorative next to the name. */}
                    <span
                        aria-hidden="true"
                        className="size-3 shrink-0 rounded-sm border border-border"
                        style={{ backgroundColor: item.color }}
                    />
                    {item.fuel}
                </li>
            ))}
        </ul>
    );
}
