type Rgb = [number, number, number];

/** Parses `#rrggbb`, `#rgb` or `rgb(r, g, b)`; returns `undefined` for anything else. */
export function parseColor(color: string): Rgb | undefined {
    const value = color.trim();
    const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
    if (hex) {
        const digits = hex[1].length === 3 ? [...hex[1]].map((d) => d + d).join("") : hex[1];
        return [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16)) as Rgb;
    }
    const rgb = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i.exec(value);
    return rgb ? [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])] : undefined;
}

function toHex([r, g, b]: Rgb): string {
    return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;
}

/** WCAG 2.1 relative luminance. */
function luminance(rgb: Rgb): number {
    const [r, g, b] = rgb.map((c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.1 contrast ratio between two colors, or `undefined` if either cannot be parsed. */
export function contrastRatio(a: string, b: string): number | undefined {
    const ca = parseColor(a);
    const cb = parseColor(b);
    if (!ca || !cb) return undefined;
    const [hi, lo] = [luminance(ca), luminance(cb)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
}

/**
 * Returns `color` unchanged when it already reaches `minRatio` against `surface`; otherwise
 * mixes it toward black (light surfaces) or white (dark surfaces) in small steps until it
 * does. Keeps the hue family recognizable while meeting the non-text contrast minimum.
 */
export function ensureContrast(color: string, surface: string, minRatio = 3): string {
    const rgb = parseColor(color);
    const bg = parseColor(surface);
    if (!rgb || !bg) return color;
    if ((contrastRatio(color, surface) ?? 0) >= minRatio) return color;

    const target: Rgb = luminance(bg) > 0.5 ? [0, 0, 0] : [255, 255, 255];
    for (let step = 1; step <= 20; step++) {
        const t = step / 20;
        const mixed = toHex(rgb.map((c, i) => c + (target[i] - c) * t) as Rgb);
        if ((contrastRatio(mixed, surface) ?? 0) >= minRatio) return mixed;
    }
    return toHex(target);
}
