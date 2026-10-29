-- Grid Shift: build the mart star schema from the Dataflow Gen2 staging tables.
-- Warehouse: wh_grid_shift. Staging tables dbo.stg_yearly and dbo.stg_monthly are loaded by df_ember_load.
-- Run each numbered block separately, in order. Validated Oct 28 2026.

-- 1. Schema (must be the only statement in its batch)
CREATE SCHEMA mart;

-- 2. dim_source
CREATE TABLE mart.dim_source AS
SELECT CAST(ROW_NUMBER() OVER (ORDER BY sort_order, source_name) AS int) AS source_key,
       source_name, is_aggregated, source_group, color_hex, sort_order
FROM (
  SELECT DISTINCT
    CAST(source_name AS varchar(60)) AS source_name,
    CAST(is_aggregated AS bit) AS is_aggregated,
    CAST(CASE WHEN source_name IN ('Coal','Gas','Other fossil') THEN 'Fossil'
              WHEN source_name IN ('Solar','Wind','Hydro','Bioenergy','Other renewables','Nuclear') THEN 'Clean'
              WHEN source_name = 'Net imports' THEN 'Imports'
              ELSE 'Aggregate' END AS varchar(20)) AS source_group,
    CAST(CASE source_name WHEN 'Coal' THEN '#8a93a0' WHEN 'Gas' THEN '#ff8a4c' WHEN 'Hydro' THEN '#3d7bd9'
              WHEN 'Wind' THEN '#5ec8e5' WHEN 'Solar' THEN '#ffd23f'
              WHEN 'Other fossil' THEN '#c9a27a' WHEN 'Bioenergy' THEN '#7bc96f' WHEN 'Other renewables' THEN '#b48cff'
              WHEN 'Nuclear' THEN '#e86fb0' WHEN 'Net imports' THEN '#e9efe9' ELSE '#9db0a2' END AS varchar(7)) AS color_hex,
    CAST(CASE source_name WHEN 'Coal' THEN 1 WHEN 'Gas' THEN 2 WHEN 'Other fossil' THEN 3 WHEN 'Hydro' THEN 4
              WHEN 'Wind' THEN 5 WHEN 'Solar' THEN 6 WHEN 'Bioenergy' THEN 7 WHEN 'Other renewables' THEN 8
              WHEN 'Nuclear' THEN 9 WHEN 'Net imports' THEN 10 ELSE 20 END AS int) AS sort_order
  FROM dbo.stg_yearly
) s;

-- 3. dim_area
CREATE TABLE mart.dim_area AS
SELECT CAST(ROW_NUMBER() OVER (ORDER BY a.area_name) AS int) AS area_key,
       a.area_name, a.iso3, a.area_type, a.continent, a.ember_region,
       CAST(a.is_g20 AS bit) AS is_g20, CAST(a.is_oecd AS bit) AS is_oecd, CAST(a.is_asean AS bit) AS is_asean,
       CAST(CASE WHEN a.area_name IN ('Bangladesh','India','Pakistan','Sri Lanka','Nepal') THEN 1 ELSE 0 END AS bit) AS is_south_asia_peer,
       CAST(CASE WHEN a.area_name = 'Bangladesh' THEN 1 ELSE 0 END AS bit) AS is_focus_country
FROM (
  SELECT CAST(area_name AS varchar(100)) AS area_name,
         MAX(CAST(iso3 AS varchar(3))) AS iso3,
         MAX(CAST(area_type AS varchar(30))) AS area_type,
         MAX(CAST(continent AS varchar(30))) AS continent,
         MAX(CAST(ember_region AS varchar(60))) AS ember_region,
         MAX(CAST(is_g20 AS int)) AS is_g20, MAX(CAST(is_oecd AS int)) AS is_oecd, MAX(CAST(is_asean AS int)) AS is_asean
  FROM dbo.stg_yearly GROUP BY area_name
) a;

-- 4. Date tables (yearly and monthly grains)
CREATE TABLE mart.dim_year AS
SELECT DISTINCT CAST([year] AS int) AS [year] FROM dbo.stg_yearly;

CREATE TABLE mart.dim_date AS
SELECT DISTINCT CAST(month_date AS date) AS month_date,
       CAST(YEAR(month_date) AS int) AS [year],
       CAST(MONTH(month_date) AS int) AS month_num,
       CAST(DATENAME(month, month_date) AS varchar(12)) AS month_name
FROM dbo.stg_monthly;

-- 5. Facts
CREATE TABLE mart.fact_generation_yearly AS
SELECT a.area_key, s.source_key, CAST(y.[year] AS int) AS [year],
       CAST(y.generation_twh AS decimal(18,3)) AS generation_twh,
       CAST(y.share_pct AS decimal(9,3)) AS share_pct,
       CAST(y.capacity_gw AS decimal(18,3)) AS capacity_gw,
       CAST(y.emissions_mtco2e AS decimal(18,3)) AS emissions_mtco2e,
       CAST(y.intensity_g_per_kwh AS decimal(12,3)) AS intensity_g_per_kwh
FROM dbo.stg_yearly y
JOIN mart.dim_area a ON a.area_name = y.area_name
JOIN mart.dim_source s ON s.source_name = y.source_name;

CREATE TABLE mart.fact_generation_monthly AS
SELECT a.area_key, s.source_key, CAST(m.month_date AS date) AS month_date,
       CAST(m.generation_twh AS decimal(18,3)) AS generation_twh,
       CAST(m.share_pct AS decimal(9,3)) AS share_pct,
       CAST(m.emissions_mtco2e AS decimal(18,3)) AS emissions_mtco2e,
       CAST(m.intensity_g_per_kwh AS decimal(12,3)) AS intensity_g_per_kwh
FROM dbo.stg_monthly m
JOIN mart.dim_area a ON a.area_name = m.area_name
JOIN mart.dim_source s ON s.source_name = m.source_name;

-- 6. Validation (expect 104241, 181459, 224, 17)
SELECT (SELECT COUNT(*) FROM mart.fact_generation_yearly) AS yearly_rows,
       (SELECT COUNT(*) FROM mart.fact_generation_monthly) AS monthly_rows,
       (SELECT COUNT(*) FROM mart.dim_area) AS areas,
       (SELECT COUNT(*) FROM mart.dim_source) AS sources;

-- Duplicate check on the yearly fact grain (expect no rows)
SELECT area_key, source_key, [year], COUNT(*) AS n
FROM mart.fact_generation_yearly GROUP BY area_key, source_key, [year] HAVING COUNT(*) > 1;
