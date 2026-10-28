CREATE TABLE [mart].[fact_generation_monthly] (
    [area_key]            INT             NULL,
    [source_key]          INT             NULL,
    [month_date]          DATE            NULL,
    [generation_twh]      DECIMAL (18, 3) NULL,
    [share_pct]           DECIMAL (9, 3)  NULL,
    [emissions_mtco2e]    DECIMAL (18, 3) NULL,
    [intensity_g_per_kwh] DECIMAL (12, 3) NULL
);


GO