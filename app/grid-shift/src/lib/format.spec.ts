import { describe, expect, it } from "vitest";
import { formatOneDecimal, formatPercent, formatPoints, formatWhole, NO_VALUE } from "./format";

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

    it("shows a placeholder for blank measures", () => {
        for (const format of [formatPercent, formatPoints, formatWhole, formatOneDecimal]) {
            expect(format(undefined)).toBe(NO_VALUE);
        }
    });
});
