import { useSyncExternalStore } from "react";

function mediaQueryList(query: string): MediaQueryList | undefined {
    return typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia(query)
        : undefined;
}

/**
 * Tracks whether a CSS media query currently matches, e.g. `"(min-width: 640px)"`.
 * Reports `false` where `matchMedia` is unavailable.
 */
export function useMediaQuery(query: string): boolean {
    return useSyncExternalStore(
        (onChange) => {
            const mql = mediaQueryList(query);
            mql?.addEventListener("change", onChange);
            return () => mql?.removeEventListener("change", onChange);
        },
        () => mediaQueryList(query)?.matches ?? false,
        () => false,
    );
}
