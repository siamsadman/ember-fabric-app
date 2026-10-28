# Grid Shift — build brief

## One-line pitch
An interactive Fabric App showing how Bangladesh's electricity mix has changed since 2000, compared with India, Pakistan, Sri Lanka, Nepal and the world. Built on Ember open data via Dataflow Gen2 and a Fabric Warehouse.

## Verified data facts (checked on the downloaded CSVs, Oct 28 2026)
Yearly file release_generation_yearly_global.csv: 104,241 rows, 224 areas (209 with ISO3 code; the rest are regions), 2000-2025, 17 source values. Has Capacity (GW).
Monthly file release_generation_monthly_global.csv: 181,459 rows, 99 areas (88 with ISO3), Jan 2019 - Aug 2026. No capacity column. Nepal is not in the monthly file. It does include India, Pakistan, Sri Lanka, World, Bangladesh.
Grain: one row per area x period x electricity source. Columns: Area, ISO 3 code, Year/Date, Area type (Country or economy / Region), Electricity source, Is aggregated source, Generation TWh (+YoY), Share of generation %, Emissions MtCO2e, Emissions intensity gCO2e/kWh, Continent, Ember region, membership flags (EU, OECD, G20, G7, ASEAN).
Aggregated sources (Is aggregated = True): Clean, Fossil, Renewables, Wind and solar, Hydro bioenergy and other renewables, Total generation, Demand. Do NOT sum these with individual fuels.
Bangladesh yearly, 2025: total generation 103.4 TWh; gas 66.5 (64.3%), coal 22.3 (21.5%), other fossil 12.5 (12.0%), solar 1.57 (1.5%), hydro 0.64 (0.6%), net imports 14.7 TWh, demand 118.0 TWh; capacity total 29.7 GW; carbon intensity 696 gCO2e/kWh.
Bangladesh yearly, 2015: gas 47.8 TWh (80.7%), coal 1.0 (1.7%). So gas share fell ~16 points while coal and imports grew. This is the real story: gas losing ground to coal and imports; clean share about 2%, not a solar boom.
Monthly Bangladesh: 92 months, 1,233 rows. Nepal is yearly only.
Data quirks to handle: blank cells for YoY and intensity where generation is 0; wind has capacity but ~0 generation in 2025; regions have no ISO3.

## Architecture
Ember CSV (Web/CSV source) -> Dataflow Gen2 (clean, split, model) -> Fabric Warehouse (star schema) -> semantic model (DAX) -> Fabric App (React, SSO). App's own database holds the watchlist notes (write-back).
Source note: Ember's file host was blocked from my sandbox. Check the Dataflow Gen2 Web connector can reach files.ember-energy.org/public-downloads/generation/outputs/. Fallback: upload the CSVs to a Lakehouse Files folder and read from there.

## Warehouse model
dim_area (area_key, area_name, iso3, area_type, continent, ember_region, is_g20, is_oecd, is_asean, is_south_asia_peer)
dim_source (source_key, source_name, is_aggregated, source_group: Fossil/Clean/Other, sort_order, color_hex)
dim_date (date_key, date, year, month, month_name, is_month_start)
fact_generation_yearly (area_key, source_key, year, generation_twh, share_pct, capacity_gw, emissions_mtco2e, intensity_g_per_kwh)
fact_generation_monthly (area_key, source_key, date_key, generation_twh, share_pct, emissions_mtco2e, intensity_g_per_kwh)
Keep aggregated rows in the fact tables but flag them in dim_source so measures can filter. Validate: row counts equal the CSVs, no duplicate keys, Bangladesh 2025 totals match the facts above.

## Dataflow Gen2 steps (showcase these in README)
1. Two queries (yearly, monthly) with typed columns and trimmed names.
2. Reference queries for dim_area and dim_source (distinct, add keys, source_group, color).
3. Date dimension generated in the dataflow.
4. Merge to attach keys, replace blanks with null, keep numeric types.
5. Destinations: Warehouse tables, replace on refresh. Note CI/CD + Git enabled by default for new dataflows.

## Semantic model measures (DAX)
Generation TWh, Share % (of total generation, excluding aggregates), YoY change, Coal share, Gas share, Clean share, Import share (net imports / total generation), Carbon intensity (weighted), Capacity GW, Peer rank, Years since gas peak. Use time intelligence on year/date. Add RLS only if time allows (not core).

## App screens (see Design canvas "Grid Shift")
1. Overview: country chips (Bangladesh default), four KPI cards, stacked area of generation mix 2000-2025, latest-year mix bars.
2. Compare: carbon intensity and mix vs India, Pakistan, Sri Lanka, Nepal (yearly), World.
3. Monthly view: seasonal pattern 2019-2026 for the chosen country.
4. Watchlist: notes per country, saved in the app database (create/read/update/delete).
Design: dark charcoal #111513, fuel colors coal #8a93a0, gas #ff8a4c, hydro #3d7bd9, wind #5ec8e5, solar #ffd23f, fonts Sora and Fira Code. Contrast >= 4.5:1, buttons >= 44px.

## Evidence for the portfolio (recruiters cannot open a Fabric App)
Repo with dataflow/warehouse/semantic-model/app code, README with architecture diagram, 60-90s screen recording, 5-6 screenshots, optionally a static snapshot page. Be explicit that the live app needs Fabric sign-in.

## Open risks
- App (preview) item may not appear in the tenant/region -> fallback: same semantic model plus a Power BI report, and a static snapshot site.
- Trial capacity size unknown (throttling if small).
- Rayfin is preview: commands may differ from this brief.
