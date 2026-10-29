const percent = new Intl.NumberFormat("en-US", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });
const oneDecimal = new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** Placeholder for a blank measure. Never a number. */
export const NO_VALUE = "n/a";

export function formatPercent(value: number | undefined): string {
    return value === undefined ? NO_VALUE : percent.format(value);
}

export function formatOneDecimal(value: number | undefined): string {
    return value === undefined ? NO_VALUE : oneDecimal.format(value);
}

export function formatWhole(value: number | undefined): string {
    return value === undefined ? NO_VALUE : whole.format(value);
}

/** Signed percentage-point change, e.g. "+1.2 pts" or "−1.6 pts". */
export function formatPoints(value: number | undefined): string {
    if (value === undefined) return NO_VALUE;
    const sign = value > 0 ? "+" : value < 0 ? "−" : "";
    return `${sign}${oneDecimal.format(Math.abs(value))} pts`;
}
