CREATE TABLE [dbo].[stg_monthly] (
    [area_name]           VARCHAR (8000) NULL,
    [iso3]                VARCHAR (8000) NULL,
    [month_date]          DATE           NULL,
    [area_type]           VARCHAR (8000) NULL,
    [source_name]         VARCHAR (8000) NULL,
    [is_aggregated]       BIT            NULL,
    [generation_twh]      FLOAT (53)     NULL,
    [share_pct]           FLOAT (53)     NULL,
    [emissions_mtco2e]    FLOAT (53)     NULL,
    [intensity_g_per_kwh] FLOAT (53)     NULL,
    [continent]           VARCHAR (8000) NULL,
    [ember_region]        VARCHAR (8000) NULL
);


GO