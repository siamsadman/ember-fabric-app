-- Give every individual source its own color (run once on the live warehouse).
UPDATE mart.dim_source SET color_hex = '#c9a27a' WHERE source_name = 'Other fossil';
UPDATE mart.dim_source SET color_hex = '#7bc96f' WHERE source_name = 'Bioenergy';
UPDATE mart.dim_source SET color_hex = '#b48cff' WHERE source_name = 'Other renewables';
UPDATE mart.dim_source SET color_hex = '#e86fb0' WHERE source_name = 'Nuclear';
UPDATE mart.dim_source SET color_hex = '#e9efe9' WHERE source_name = 'Net imports';
SELECT source_name, color_hex FROM mart.dim_source ORDER BY sort_order, source_name;
