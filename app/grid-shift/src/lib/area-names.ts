/**
 * Possessive form of an area name for running text: "the world's" for the World aggregate,
 * otherwise "<name>'s" ("Bangladesh's", "India's").
 */
export function areaPossessive(areaName: string): string {
    return areaName === "World" ? "the world's" : `${areaName}'s`;
}
