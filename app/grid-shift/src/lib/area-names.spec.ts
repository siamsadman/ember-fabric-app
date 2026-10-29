import { describe, expect, it } from "vitest";
import { areaPossessive } from "./area-names";

describe("areaPossessive", () => {
    it("uses \"the world's\" for World only", () => {
        expect(areaPossessive("World")).toBe("the world's");
    });

    it("adds 's to country names", () => {
        expect(areaPossessive("Bangladesh")).toBe("Bangladesh's");
        expect(areaPossessive("India")).toBe("India's");
        expect(areaPossessive("Pakistan")).toBe("Pakistan's");
    });
});
