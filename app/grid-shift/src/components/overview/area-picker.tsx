import { ChevronDown } from "lucide-react";
import { useSemanticModelQuery } from "@/hooks/use-semantic-model-query";
import { toRecords } from "@/lib/table-records";
import { toDataTable } from "@/lib/to-data-table";
import { cn } from "@/lib/utils";
import { areaList } from "@/queries";
import { queryFailure } from "./query-failure";

/** Shortcut chips from the design spec; any other area comes from the picker. */
const QUICK_AREAS = ["Bangladesh", "India", "Pakistan", "World"] as const;

interface AreaPickerProps {
    area: string;
    onChange: (area: string) => void;
}

export function AreaPicker({ area, onChange }: AreaPickerProps) {
    const config = areaList();
    const { data } = useSemanticModelQuery({ connection: config.connection, query: config.query });
    const failure = queryFailure(data);

    const records = data?.status === "success" ? toRecords(toDataTable(data.table, config.columnMetadata)) : [];
    const names = (type: string) =>
        records.filter((r) => r.AreaType === type && typeof r.Area === "string").map((r) => r.Area as string);
    const countries = names("Country or economy");
    const regions = names("Region");

    return (
        <div className="flex flex-wrap items-center gap-2">
            <div role="group" aria-label="Quick country selection" className="flex flex-wrap gap-2">
                {QUICK_AREAS.map((name) => (
                    <button
                        key={name}
                        type="button"
                        aria-pressed={area === name}
                        onClick={() => onChange(name)}
                        className={cn(
                            "h-11 rounded-full border px-4 text-300 font-semibold transition-colors",
                            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                            area === name
                                ? "border-brand bg-brand text-on-brand"
                                : "bg-card text-foreground hover:bg-accent",
                        )}
                    >
                        {name}
                    </button>
                ))}
            </div>
            {/* A native select is as wide as its longest option, so cap it to the row on phones. */}
            <label className="relative flex w-full min-w-0 items-center sm:w-auto">
                <span className="sr-only">Choose any country or region</span>
                <select
                    value={records.length > 0 ? area : ""}
                    onChange={(event) => onChange(event.target.value)}
                    disabled={records.length === 0}
                    title={failure ? `Area list failed: ${failure.category}` : undefined}
                    className={cn(
                        "h-11 w-full min-w-0 appearance-none truncate rounded-full border bg-card pl-4 pr-10 text-300 text-foreground sm:max-w-72",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                        "disabled:cursor-not-allowed disabled:text-muted-foreground",
                    )}
                >
                    {records.length === 0 && (
                        <option value="">{failure ? `Area list unavailable (${failure.category})` : "Loading areas"}</option>
                    )}
                    {countries.length > 0 && (
                        <optgroup label="Countries and economies">
                            {countries.map((name) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </optgroup>
                    )}
                    {regions.length > 0 && (
                        <optgroup label="Regions">
                            {regions.map((name) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </optgroup>
                    )}
                </select>
                <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-4 icon-size-200 text-muted-foreground" />
            </label>
        </div>
    );
}
