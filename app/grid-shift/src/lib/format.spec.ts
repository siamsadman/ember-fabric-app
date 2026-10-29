import { describe, expect, it } from "vitest";
import {
    formatOneDecimal,
    formatPercent,
    formatPercentChange,
    formatPoints,
    formatTwh,
    formatWhole,
    NO_VALUE,
} from "./format";

describe("format", () => {
    it("formats shares as one-decimal percentages", () => {
        expect(formatPercent(0.6428992852375932)).toBe("64.3%");
    });

    it("signs percentage-point changes with a true minus", () => {
        expect(formatPoints(-1.5936964025233702)).toBe("−1.6 pts");
        expect(formatPoints(0.25)).toBe("+0.3 pts");
        expect(formatPoints(0)).toBe("0.0 pts");
    });

    it("formats plain numbers", () => {
        expect(formatWhole(696.09540482247)).toBe("696");
        expect(formatOneDecimal(31923.181)).toBe("31,923.2");
    });

    it("formats monthly TWh with two decimals and signed relative changes", () => {
        expect(formatTwh(3.854)).toBe("3.85");
        expect(formatTwh(12.5)).toBe("12.50");
        expect(formatPercentChange((3.854 - 3.145) / 3.145)).toBe("+22.5%");
        expect(formatPercentChange((3.461 - 4.29) / 4.29)).toBe("−19.3%");
        expect(formatPercentChange(0)).toBe("0.0%");
    });

    it("shows a placeholder for blank measures", () => {
        for (const format of [formatPercent, formatPoints, formatWhole, formatOneDecimal, formatTwh, formatPercentChange]) {
            expect(format(undefined)).toBe(NO_VALUE);
        }
    });
});
