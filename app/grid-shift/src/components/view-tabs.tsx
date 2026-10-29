import { useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { panelId, tabId, VIEWS, type AppView } from "./views";

/**
 * Overview / Monthly switch following the WAI-ARIA tabs pattern: one tab stop,
 * arrow keys and Home/End move between tabs and select them.
 */
export function ViewTabs({ view, onChange }: { view: AppView; onChange: (view: AppView) => void }) {
    const refs = useRef<Record<AppView, HTMLButtonElement | null>>({ overview: null, monthly: null });

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const index = VIEWS.findIndex((v) => v.id === view);
        const next =
            event.key === "ArrowRight" ? (index + 1) % VIEWS.length
            : event.key === "ArrowLeft" ? (index - 1 + VIEWS.length) % VIEWS.length
            : event.key === "Home" ? 0
            : event.key === "End" ? VIEWS.length - 1
            : undefined;
        if (next === undefined) return;
        event.preventDefault();
        const target = VIEWS[next].id;
        onChange(target);
        refs.current[target]?.focus();
    };

    return (
        <div role="tablist" aria-label="Views" onKeyDown={handleKeyDown} className="flex gap-1 self-start rounded-full border bg-card p-1">
            {VIEWS.map(({ id, label }) => {
                const selected = id === view;
                return (
                    <button
                        key={id}
                        ref={(el) => {
                            refs.current[id] = el;
                        }}
                        id={tabId(id)}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        aria-controls={panelId(id)}
                        tabIndex={selected ? 0 : -1}
                        onClick={() => onChange(id)}
                        className={cn(
                            "h-11 rounded-full px-5 text-300 font-semibold transition-colors",
                            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                            selected ? "bg-brand text-on-brand" : "text-foreground hover:bg-accent",
                        )}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
}
