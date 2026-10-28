[StagingDefinition = [Kind = "FastCopy"]]
section Section1;
[DataDestinations = {[Definition = [Kind = "Reference", QueryName = "Query1_DataDestination", IsNewTarget = true], Settings = [Kind = "Manual", AllowCreation = true, ColumnSettings = [Mappings = {[SourceColumnName = "area_name", DestinationColumnName = "area_name"], [SourceColumnName = "iso3", DestinationColumnName = "iso3"], [SourceColumnName = "year", DestinationColumnName = "year"], [SourceColumnName = "area_type", DestinationColumnName = "area_type"], [SourceColumnName = "source_name", DestinationColumnName = "source_name"], [SourceColumnName = "is_aggregated", DestinationColumnName = "is_aggregated"], [SourceColumnName = "generation_twh", DestinationColumnName = "generation_twh"], [SourceColumnName = "share_pct", DestinationColumnName = "share_pct"], [SourceColumnName = "capacity_gw", DestinationColumnName = "capacity_gw"], [SourceColumnName = "emissions_mtco2e", DestinationColumnName = "emissions_mtco2e"], [SourceColumnName = "intensity_g_per_kwh", DestinationColumnName = "intensity_g_per_kwh"], [SourceColumnName = "continent", DestinationColumnName = "continent"], [SourceColumnName = "ember_region", DestinationColumnName = "ember_region"], [SourceColumnName = "is_g20", DestinationColumnName = "is_g20"], [SourceColumnName = "is_oecd", DestinationColumnName = "is_oecd"], [SourceColumnName = "is_asean", DestinationColumnName = "is_asean"]}], DynamicSchema = true, UpdateMethod = [Kind = "Replace"], TypeSettings = [Kind = "Table"]]]}]
shared stg_yearly = let
  Source = Csv.Document(Web.Contents("https://files.ember-energy.org/public-downloads/generation/outputs/release_generation_yearly_global.csv"), [Delimiter = ",", Columns = 24, Encoding = 65001, QuoteStyle = QuoteStyle.Csv]),
  Headers = Table.PromoteHeaders(Source, [PromoteAllScalars = true]),
  Kept = Table.SelectColumns(Headers, {"Area","ISO 3 code","Year","Area type","Electricity source","Is aggregated source","Generation (TWh)","Share of generation (%)","Capacity (GW)","Emissions (MtCO2e)","Emissions intensity (gCO2e/kWh)","Continent","Ember region","G20 member","OECD member","ASEAN member"}),
  Renamed = Table.RenameColumns(Kept, {{"Area","area_name"},{"ISO 3 code","iso3"},{"Year","year"},{"Area type","area_type"},{"Electricity source","source_name"},{"Is aggregated source","is_aggregated"},{"Generation (TWh)","generation_twh"},{"Share of generation (%)","share_pct"},{"Capacity (GW)","capacity_gw"},{"Emissions (MtCO2e)","emissions_mtco2e"},{"Emissions intensity (gCO2e/kWh)","intensity_g_per_kwh"},{"Continent","continent"},{"Ember region","ember_region"},{"G20 member","is_g20"},{"OECD member","is_oecd"},{"ASEAN member","is_asean"}}),
  Typed = Table.TransformColumnTypes(Renamed, {{"year", Int64.Type},{"generation_twh", type number},{"share_pct", type number},{"capacity_gw", type number},{"emissions_mtco2e", type number},{"intensity_g_per_kwh", type number},{"is_aggregated", type logical},{"is_g20", type logical},{"is_oecd", type logical},{"is_asean", type logical}}, "en-US")
in
  Typed;
shared Query1_DataDestination = let
  Pattern = Fabric.Warehouse([HierarchicalNavigation = true, CreateNavigationProperties = false]),
  Navigation_1 = Pattern{[workspaceId = "92812767-e767-4230-99ea-6bf953d662a5"]}[Data],
  Navigation_2 = Navigation_1{[warehouseId = "b3ba16a4-012e-4713-ab0a-a5efe2b85721"]}[Data],
  Navigation_3 = Navigation_2{[Schema = "dbo"]}[Data],
  TableNavigation = Navigation_3{[Name = "stg_yearly"]}?[Data]?
in
  TableNavigation;
[DataDestinations = {[Definition = [Kind = "Reference", QueryName = "stg_monthly_DataDestination", IsNewTarget = true], Settings = [Kind = "Manual", AllowCreation = true, ColumnSettings = [Mappings = {[SourceColumnName = "area_name", DestinationColumnName = "area_name"], [SourceColumnName = "iso3", DestinationColumnName = "iso3"], [SourceColumnName = "month_date", DestinationColumnName = "month_date"], [SourceColumnName = "area_type", DestinationColumnName = "area_type"], [SourceColumnName = "source_name", DestinationColumnName = "source_name"], [SourceColumnName = "is_aggregated", DestinationColumnName = "is_aggregated"], [SourceColumnName = "generation_twh", DestinationColumnName = "generation_twh"], [SourceColumnName = "share_pct", DestinationColumnName = "share_pct"], [SourceColumnName = "emissions_mtco2e", DestinationColumnName = "emissions_mtco2e"], [SourceColumnName = "intensity_g_per_kwh", DestinationColumnName = "intensity_g_per_kwh"], [SourceColumnName = "continent", DestinationColumnName = "continent"], [SourceColumnName = "ember_region", DestinationColumnName = "ember_region"]}], DynamicSchema = true, UpdateMethod = [Kind = "Replace"], TypeSettings = [Kind = "Table"]]]}]
shared stg_monthly = let
  Source = Csv.Document(Web.Contents("https://files.ember-energy.org/public-downloads/generation/outputs/release_generation_monthly_global.csv"), [Delimiter = ",", Columns = 23, Encoding = 65001, QuoteStyle = QuoteStyle.Csv]),
  Headers = Table.PromoteHeaders(Source, [PromoteAllScalars = true]),
  Kept = Table.SelectColumns(Headers, {"Area","ISO 3 code","Date","Area type","Electricity source","Is aggregated source","Generation (TWh)","Share of generation (%)","Emissions (MtCO2e)","Emissions intensity (gCO2e/kWh)","Continent","Ember region"}),
  Renamed = Table.RenameColumns(Kept, {{"Area","area_name"},{"ISO 3 code","iso3"},{"Date","month_date"},{"Area type","area_type"},{"Electricity source","source_name"},{"Is aggregated source","is_aggregated"},{"Generation (TWh)","generation_twh"},{"Share of generation (%)","share_pct"},{"Emissions (MtCO2e)","emissions_mtco2e"},{"Emissions intensity (gCO2e/kWh)","intensity_g_per_kwh"},{"Continent","continent"},{"Ember region","ember_region"}}),
  Typed = Table.TransformColumnTypes(Renamed, {{"month_date", type date},{"generation_twh", type number},{"share_pct", type number},{"emissions_mtco2e", type number},{"intensity_g_per_kwh", type number},{"is_aggregated", type logical}}, "en-US")
in
  Typed;
shared stg_monthly_DataDestination = let
  Pattern = Fabric.Warehouse([CreateNavigationProperties = false, HierarchicalNavigation = true]),
  Navigation_1 = Pattern{[workspaceId = "92812767-e767-4230-99ea-6bf953d662a5"]}[Data],
  Navigation_2 = Navigation_1{[warehouseId = "b3ba16a4-012e-4713-ab0a-a5efe2b85721"]}[Data],
  Navigation_3 = Navigation_2{[Schema = "dbo"]}[Data],
  TableNavigation = Navigation_3{[Name = "stg_monthly"]}?[Data]?
in
  TableNavigation;
