export type AppView = "overview" | "monthly";

export const VIEWS: readonly { id: AppView; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "monthly", label: "Monthly" },
];

export const tabId = (view: AppView) => `view-tab-${view}`;
export const panelId = (view: AppView) => `view-panel-${view}`;
