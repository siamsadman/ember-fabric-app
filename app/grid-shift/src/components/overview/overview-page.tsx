import { useState } from "react";
import { Moon, Sun, Zap } from "lucide-react";
import { useThemeContext } from "@/hooks/theme.context";
import { DEFAULT_AREA } from "@/queries";
import { AreaPicker } from "./area-picker";
import { KpiCards } from "./kpi-cards";
import { LatestMixChart, MixOverTimeChart, PeerIntensityChart } from "./overview-charts";

export function OverviewPage() {
    const { isDark, toggleTheme } = useThemeContext();
    const [area, setArea] = useState<string>(DEFAULT_AREA);

    return (
        <div className="min-h-full bg-background">
            <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:py-10">
                <header className="flex flex-col gap-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand text-on-brand">
                                <Zap aria-hidden="true" className="icon-size-400" />
                            </span>
                            <div className="min-w-0">
                                <h1 className="font-page-title text-page-title font-bold text-emphasis-foreground">Grid Shift</h1>
                                <p className="font-page-subtitle text-page-subtitle text-muted-foreground">
                                    How {area}'s electricity is generated, and how it compares with South Asia and the world.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={toggleTheme}
                            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
                            className="flex size-11 shrink-0 items-center justify-center rounded-full border bg-card text-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        >
                            {isDark ? <Sun aria-hidden="true" className="icon-size-300" /> : <Moon aria-hidden="true" className="icon-size-300" />}
                        </button>
                    </div>
                    <AreaPicker area={area} onChange={setArea} />
                </header>

                <main className="flex flex-col gap-grid">
                    <KpiCards area={area} />
                    <div className="grid grid-cols-1 gap-grid lg:grid-cols-12">
                        <MixOverTimeChart area={area} className="lg:col-span-8" heightClassName="h-104" />
                        <LatestMixChart area={area} className="lg:col-span-4" heightClassName="h-104" />
                        <PeerIntensityChart
                            area={area}
                            className="lg:col-span-12"
                            heightClassName="h-80 sm:h-72"
                            onSelectArea={setArea}
                        />
                    </div>
                </main>

                <footer className="flex flex-col gap-1 border-t pt-4 text-200 text-muted-foreground sm:flex-row sm:justify-between">
                    <p>
                        Data:{" "}
                        <a
                            href="https://ember-energy.org/data/"
                            className="underline underline-offset-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                        >
                            Ember, Electricity Data (CC BY 4.0)
                        </a>
                    </p>
                    <p>Live figures come from the sm_grid_shift semantic model and need a Fabric sign-in.</p>
                </footer>
            </div>
        </div>
    );
}
