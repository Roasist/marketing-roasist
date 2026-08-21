# STRICT PROJECT RULE: ZERO SEARCH VOLUME FABRICATION

## 1. ABSOLUTE SEARCH VOLUME PRINCIPLE
- **NO INVENTED OR ESTIMATED SEARCH VOLUMES**: Under NO circumstances should any search volume be fabricated, estimated, scaled, multiplied by market share ratio, or assigned an artificial minimum floor (such as `Math.max(10, ...)` or `Math.max(50, ...)` or `reach / 10000`).
- **PURE GOOGLE ADS API DATA ONLY**:
  - If Google Ads API returns a search volume of `0` for a keyword in a specific location or country, the displayed search volume **MUST BE `0`**.
  - If a keyword has no historical data for a specific location in Google Ads API, the volume **MUST BE `0`**.
  - Only the exact, official `avgMonthlySearches` numbers returned by Google Ads API (`generateKeywordHistoricalMetrics` / `generateKeywordIdeas`) may be displayed across all tables, breakdown cards, KPI summaries, and export reports.

## 2. STRICT IMPLEMENTATION RULES
1. **No Artificial Floors (`Math.max(10, ...)` / `Math.max(50, ...)`):**
   - Never place a `Math.max(10, ...)` floor on `monthlyVolume`, `effectiveLocVol`, or `geoVolumes`.
2. **No Extrapolation via Population / Market Share (`locShareRatio` / `reach`):**
   - Never extrapolate regional search volume by multiplying the total search volume with population reach or country share percentages.
3. **Pure Aggregation for 'ALL Locations':**
   - For 'Tüm Lokasyonlar' (ALL), the search volume is strictly the mathematical sum of the real Google Ads search volumes returned across the targeted locations.
