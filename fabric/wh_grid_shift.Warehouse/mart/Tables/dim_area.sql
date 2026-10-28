CREATE TABLE [mart].[dim_area] (
    [area_key]           INT           NULL,
    [area_name]          VARCHAR (100) NULL,
    [iso3]               VARCHAR (3)   NULL,
    [area_type]          VARCHAR (30)  NULL,
    [continent]          VARCHAR (30)  NULL,
    [ember_region]       VARCHAR (60)  NULL,
    [is_g20]             BIT           NULL,
    [is_oecd]            BIT           NULL,
    [is_asean]           BIT           NULL,
    [is_south_asia_peer] BIT           NULL,
    [is_focus_country]   BIT           NULL
);


GO