//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { useCssTheme } from "@microsoft/fabric-visuals";
import App from "@/App";
import { ThemeContext } from "@/hooks/theme.context";

// The overview reads the theme from context, as it does under `main.tsx`.
function WithTheme() {
    const theme = useCssTheme();
    return (
        <ThemeContext.Provider value={{ isDark: true, toggleTheme: () => {}, theme }}>
            <App />
        </ThemeContext.Provider>
    );
}

describe("App", () => {
    it("renders without throwing", () => {
        expect(() => render(<WithTheme />)).not.toThrow();
    });

    it("mounts content into the document", () => {
        render(<WithTheme />);
        expect(document.body).not.toBeEmptyDOMElement();
    });
});
