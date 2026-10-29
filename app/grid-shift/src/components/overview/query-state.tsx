import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QueryErrorCategory, QueryFailure } from "./query-failure";

const CATEGORY_HINTS: Record<QueryErrorCategory, string> = {
    query: "The semantic model rejected the DAX query.",
    overflow: "A value in the result is too large to display.",
    network: "No response from Fabric. Check your connection and retry.",
    api: "Fabric returned an error. Check that you are signed in and have access to sm_grid_shift.",
    unknown: "Unexpected error while loading data.",
};

export function Skeleton({ className }: { className?: string }) {
    return <div aria-hidden="true" className={cn("animate-pulse rounded-2xl bg-muted", className)} />;
}

export function QueryErrorBanner({ failure, className }: { failure: QueryFailure; className?: string }) {
    return (
        <div
            role="alert"
            className={cn(
                "flex items-start gap-3 rounded-2xl border border-destructive p-4 text-300 text-foreground",
                className,
            )}
        >
            <TriangleAlert aria-hidden="true" className="icon-size-300 shrink-0 text-destructive" />
            <div className="min-w-0">
                <p className="font-semibold">
                    <span className="font-numeric uppercase text-destructive">{failure.category}</span>{" "}
                    {CATEGORY_HINTS[failure.category]}
                </p>
                <p className="mt-1 break-words font-numeric text-200 text-muted-foreground">{failure.message}</p>
            </div>
        </div>
    );
}

/** Card chrome for a panel that is loading, empty or failed, matching the visual's size. */
export function PanelFrame({
    title,
    subtitle,
    className,
    children,
}: {
    title: string;
    subtitle?: string;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <section aria-label={title} className={cn("flex flex-col gap-3 rounded-3xl border bg-card p-4", className)}>
            <header>
                <h2 className="font-visual-title text-visual-title font-semibold text-emphasis-foreground">{title}</h2>
                {subtitle && <p className="text-visual-subtitle text-muted-foreground">{subtitle}</p>}
            </header>
            <div className="flex min-h-0 flex-1 flex-col justify-center">{children}</div>
        </section>
    );
}
