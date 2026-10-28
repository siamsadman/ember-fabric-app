# Grid Shift — design spec for the app

Dark, calm energy dashboard. One screen first (Overview), then Compare, Monthly, Watchlist. Desktop first, must work at phone width.

## Tokens
Background #111513, card #1a211d, card border #2a3830, text #e9efe9, muted text #9db0a2, accent #ffd23f.
Fuel colors: coal #8a93a0, gas #ff8a4c, hydro #3d7bd9, wind #5ec8e5, solar #ffd23f, other #9db0a2 (these also live in mart.dim_source.color_hex).
Fonts: Sora (headings, body), Fira Code (numbers, labels). Radius 16px cards. Buttons and chips at least 44px tall. Text contrast at least 4.5:1.

## Overview (default country Bangladesh)
1. Header: logo, title "Grid Shift", subtitle, country chips (Bangladesh, India, Pakistan, World) plus a picker for any country.
2. Four KPI cards for the selected country and latest year: Carbon intensity, Gas share, Solar capacity or Import share, Total demand. Every value comes from a measure, none from constants.
3. Stacked area chart, share of generation by fuel, 2000 to latest year. Order by dim_source.sort_order, colors from color_hex.
4. "Mix in the latest year" horizontal bars.
5. Watchlist box (note per country, saved to the app database) once write-back is added.
6. Compare strip: carbon intensity for the selected country vs peers.
7. Footer: "Data: Ember, Electricity Data (CC BY 4.0)". Say that the live app needs Fabric sign-in.

## Data access rules
- All numbers come from sm_grid_shift through the Rayfin semantic-model connector (executeQuery, delegated auth).
- Use measures, not raw columns (raw value columns are hidden).
- Never show mock data when a query fails. Show an error state with the error category.
- Example query shape (mix over time):
  EVALUATE SUMMARIZECOLUMNS(dim_year[year], dim_source[source_name], dim_source[sort_order],
    TREATAS({"Bangladesh"}, dim_area[area_name]),
    TREATAS({"Coal","Gas","Other fossil","Hydro","Wind","Solar","Bioenergy","Other renewables","Nuclear","Net imports"}, dim_source[source_name]),
    "TWh", [Generation TWh])
- Aggregated sources (Total generation, Fossil, Clean, Renewables, Demand, ...) must not be stacked together with individual fuels.

## States
Loading skeletons, empty state for countries without monthly data (for example Nepal is yearly only), error state, keyboard focus rings, aria-labels on icon buttons, charts have text alternatives.

## Honesty
Do not claim a solar boom: Bangladesh solar is about 1.5% of generation in 2025. The story is gas losing share to coal and imports while clean power stays around 2%.
