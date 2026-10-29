import { describe, expect, it } from "vitest";
import { toDaxString, withArea } from "./area-param";
import { latestMix, mixOverTime, overviewKpis, peerIntensity } from ".";

describe("toDaxString", () => {
    it("doubles embedded quotes", () => {
        expect(toDaxString('Côte d"Ivoire')).toBe('"Côte d""Ivoire"');
    });
});

describe("withArea", () => {
    it("rebinds only the area declaration", () => {
        const query = 'VAR _AreaName = "Bangladesh"\nEVALUATE ROW("x", "Bangladesh")';
        expect(withArea(query, "India")).toBe('VAR _AreaName = "India"\nEVALUATE ROW("x", "Bangladesh")');
    });

    it("keeps $ patterns in area names literal", () => {
        expect(withArea('VAR _AreaName = "Bangladesh"', "A$&B")).toBe('VAR _AreaName = "A$&B"');
    });

    it("throws when the query has no area declaration", () => {
        expect(() => withArea("EVALUATE dim_area", "India")).toThrow();
    });
});

describe("overview factories", () => {
    it.each([
        ["overviewKpis", overviewKpis],
        ["mixOverTime", mixOverTime],
        ["latestMix", latestMix],
        ["peerIntensity", peerIntensity],
    ])("%s defaults to Bangladesh and accepts another area", (_name, factory) => {
        expect(factory().query).toContain('VAR _AreaName = "Bangladesh"');
        const india = factory({ area: "India" });
        expect(india.query).toContain('VAR _AreaName = "India"');
        expect(india.query).not.toContain('VAR _AreaName = "Bangladesh"');
        expect(india.connection).toBe("gridmodel");
    });

    it("aliases every column to a bracket-free name", () => {
        for (const factory of [overviewKpis, mixOverTime, latestMix, peerIntensity]) {
            for (const column of Object.values(factory().columnMetadata)) {
                expect(column.name).toMatch(/^[A-Za-z]+$/);
            }
        }
    });
});
