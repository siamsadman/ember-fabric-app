CREATE TABLE [mart].[dim_source] (
    [source_key]    INT          NULL,
    [source_name]   VARCHAR (60) NULL,
    [is_aggregated] BIT          NULL,
    [source_group]  VARCHAR (20) NULL,
    [color_hex]     VARCHAR (7)  NULL,
    [sort_order]    INT          NULL
);


GO