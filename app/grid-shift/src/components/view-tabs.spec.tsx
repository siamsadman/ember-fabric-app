import { useState } from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ViewTabs } from "./view-tabs";
import type { AppView } from "./views";

function Harness() {
    const [view, setView] = useState<AppView>("overview");
    return <ViewTabs view={view} onChange={setView} />;
}

describe("ViewTabs", () => {
    it("selects a tab on click and keeps a single tab stop", () => {
        render(<Harness />);
        const overview = screen.getByRole("tab", { name: "Overview" });
        const monthly = screen.getByRole("tab", { name: "Monthly" });
        expect(overview).toHaveAttribute("aria-selected", "true");
        expect(monthly).toHaveAttribute("tabindex", "-1");

        fireEvent.click(monthly);
        expect(monthly).toHaveAttribute("aria-selected", "true");
        expect(monthly).toHaveAttribute("tabindex", "0");
        expect(overview).toHaveAttribute("tabindex", "-1");
    });

    it("moves selection and focus with the arrow keys", () => {
        render(<Harness />);
        const overview = screen.getByRole("tab", { name: "Overview" });
        overview.focus();

        fireEvent.keyDown(overview, { key: "ArrowRight" });
        const monthly = screen.getByRole("tab", { name: "Monthly" });
        expect(monthly).toHaveAttribute("aria-selected", "true");
        expect(monthly).toHaveFocus();

        fireEvent.keyDown(monthly, { key: "ArrowRight" });
        expect(overview).toHaveAttribute("aria-selected", "true");
        expect(overview).toHaveFocus();
    });
});
