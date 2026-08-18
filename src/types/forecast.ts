export type SearchIntent = 'TRANSACTIONAL' | 'COMMERCIAL' | 'INFORMATIONAL';
export type CompetitionLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface KeywordMetric {
  id: string;
  keyword: string;
  monthlyVolume: number;
  lowCpc: number;
  highCpc: number;
  competition: CompetitionLevel;
  competitionIndex: number;
  intent: SearchIntent;
  trendChangePercent: number;
  opportunityScore: number;
  isSelected?: boolean;
  isAiStrategistPick?: boolean;
  strategistStrategy?: 'TRANSACTIONAL' | 'LOCAL_GEO' | 'CONSIDERATION' | 'LEAD_MAGNET';
  geoVolumes?: Record<string, number>;
  geoCpc?: Record<string, { lowCpc: number; highCpc: number }>;
}

export interface CountryOption {
  code: string;
  name: string;
  flag: string;
  region: string;
  cpcMultiplier: number;
  volumeMultiplier: number;
  currency: string;
}

export interface GeoTargetLocation {
  id: string; // e.g. "1012782" or "2792"
  resourceName: string; // e.g. "geoTargetConstants/1012782"
  name: string; // e.g. "Alanya"
  canonicalName: string; // e.g. "Alanya, Antalya, Turkey"
  countryCode: string; // e.g. "TR"
  targetType: string; // e.g. "City", "District", "Country", "State", "Province"
  reach?: number; // e.g. 115000
  flag?: string;
  cpcMultiplier?: number;
  volumeMultiplier?: number;
  monthlyVolume?: number; // Official Google Ads monthly search volume for this geo
  avgCpc?: number; // Official Google Ads average CPC for this geo
  lowCpc?: number;
  highCpc?: number;
  sharePercent?: number;
}

export interface SavedLocationPreset {
  id: string;
  name: string;
  locations: GeoTargetLocation[];
  createdAt: number;
}

export type GrowthScenario = 'CONSERVATIVE' | 'REALISTIC' | 'AGGRESSIVE';

export interface CountryMetric {
  id?: string;
  code: string;
  name: string;
  canonicalName?: string;
  flag: string;
  sharePercent: number;
  monthlyVolume: number;
  avgCpc: number;
  estClicks: number;
  estConversions: number;
}

export type BusinessModel = 'LEAD_GEN' | 'ECOMMERCE' | 'BRAND_REACH';

export interface ForecastSimulation {
  businessModel: BusinessModel;
  monthlyBudget: number;
  dailyBudget: number;
  actualSpend: number;
  marketCapacitySpend: number;
  isMarketSaturated: boolean;
  targetImpressionShare: number; // e.g. 70 (%)
  estImpressions: number;
  estClicks: number;
  avgCpc: number;
  avgCtr: number; // e.g. 7.5 (%)
  conversionRate: number; // e.g. 3.0 (%)
  estConversions: number; // or estLeads
  cpa: number; // CPA or CPL
  // Lead Generation specific
  leadCloseRate?: number; // e.g. 10 (%)
  estDeals?: number;
  cac?: number;
  // E-Commerce specific
  avgOrderValue: number;
  estRevenue: number;
  projectedRoas: number;
  targetCountries?: string[];
  countryBreakdown?: CountryMetric[];
}

export interface NegativeCategory {
  category: string;
  words: string[];
}

export type CampaignPlatform = 'GOOGLE' | 'META' | 'TIKTOK' | 'YOUTUBE' | 'YANDEX' | 'BING' | 'VK';

export type CampaignObjective = 
  // Meta
  | 'META_LEADS' 
  | 'META_SALES' 
  | 'META_TRAFFIC' 
  | 'META_AWARENESS' 
  | 'META_APP'
  // Google
  | 'GOOGLE_SEARCH' 
  | 'GOOGLE_PMAX' 
  | 'GOOGLE_GDN' 
  | 'GOOGLE_DEMAND_GEN' 
  | 'GOOGLE_YOUTUBE'
  // TikTok
  | 'TIKTOK_LEADS' 
  | 'TIKTOK_VIEWS' 
  | 'TIKTOK_SALES'
  // Yandex
  | 'YANDEX_SEARCH' 
  | 'YANDEX_RSYA'
  // General / Omnichannel
  | 'OMNICHANNEL';

export interface SubCampaignItem {
  id: string;
  name: string;
  platform: CampaignPlatform;
  objective: CampaignObjective;
  languageCode: string; // e.g. "en", "ru", "tr", "de"
  languageName: string; // e.g. "İngilizce", "Rusça"
  languageFlag: string; // e.g. "🇬🇧", "🇷🇺"
  targetLocations: GeoTargetLocation[];
  monthlyBudget: number;
  
  // Keyword and Negative data
  targetUrl?: string;
  seedKeywords?: string;
  discoveredKeywords?: KeywordMetric[];
  selectedKeywords: KeywordMetric[];
  negativeCategories: NegativeCategory[];
  
  // Model specific parameters snapshot
  businessModel?: BusinessModel;
  parameters: {
    // Growth & Model settings
    growthScenario?: GrowthScenario;
    budgetMode?: 'BY_BUDGET' | 'BY_IMPRESSION_SHARE';
    avgDealValue?: number;

    // Omnichannel allocation percentages
    allocGoogleSearch?: number;
    allocMetaAds?: number;
    allocYouTube?: number;
    allocGdn?: number;

    // Search specific
    targetImpressionShare?: number;
    expectedCtr?: number;
    searchLeadCr?: number;
    searchHealthyLeadRate?: number;
    searchCloseRate?: number;
    searchEcommerceCr?: number;
    searchAov?: number;
    
    // Meta specific
    metaCpm?: number;
    metaCtr?: number;
    metaLeadCr?: number;
    metaHealthyLeadRate?: number;
    metaCloseRate?: number;
    metaEcommerceCr?: number;
    metaAov?: number;
    
    // YouTube specific
    youtubeCpv?: number;
    youtubeVtr?: number;
    youtubeActionRate?: number;
    
    // GDN specific
    gdnCpm?: number;
    gdnCtr?: number;
    gdnAssistedCr?: number;

    // TikTok specific
    tiktokCpm?: number;
    tiktokCtr?: number;
    tiktokLeadCr?: number;

    // Yandex specific
    yandexCpc?: number;
    yandexCtr?: number;
    yandexCr?: number;
  };

  // Output snapshot
  simulationResult?: ForecastSimulation;
  metaSimulationResult?: MetaSimulation;
  youtubeSimulationResult?: YouTubeSimulation;
  gdnSimulationResult?: GdnSimulation;
  createdAt?: string;
}

export interface MasterMediaPlan {
  id: string;
  workspaceId?: string;
  name: string; // e.g. "Temmuz 2026 Global Kampanyası"
  clientName: string; // e.g. "Acme Sağlık Turizmi"
  startDate?: string; // e.g. "2026-07-01"
  endDate?: string; // e.g. "2026-07-31"
  period: string; // e.g. "01.07.2026 — 31.07.2026"
  tags: string[]; // e.g. ["#Temmuz2026", "#SağlıkTurizmi"]
  totalBudget: number;
  subCampaigns: SubCampaignItem[];
  consolidatedMix?: OmnichannelMediaMix;
  createdAt?: string;
  updatedAt?: string;
}

export interface ForecastPlan {
  id: string;
  workspaceId?: string;
  name: string;
  clientName?: string;
  startDate?: string;
  endDate?: string;
  period?: string;
  tags?: string[];
  targetUrl?: string;
  seedKeywords?: string;
  detectedLanguage?: string;
  detectedLanguageName?: string;
  targetCountries?: string[];
  monthlyBudget: number;
  selectedKeywords: KeywordMetric[];
  simulationResult: ForecastSimulation;
  negativeKeywords: NegativeCategory[];
  countryBreakdown?: CountryMetric[];
  subCampaigns?: SubCampaignItem[];
  createdAt?: string;
}

export type ChannelType = 'OMNICHANNEL' | 'GOOGLE_SEARCH' | 'META_ADS' | 'YOUTUBE' | 'GDN' | 'NEGATIVES' | 'SAVED_PLANS';

export interface MetaSimulation {
  budget: number;
  cpm: number;
  impressions: number;
  ctr: number;
  clicks: number;
  cpc: number;
  leadConversionRate: number; // Form or Landing Page CR %
  grossLeads: number;
  cpl: number; // Cost Per Gross Lead
  healthyLeadRate: number; // % of qualified / high-intent leads (e.g. 50%)
  healthyLeads: number; // Net qualified leads (MQL/SQL)
  cpql: number; // Cost Per Qualified Lead
  closeRate: number; // Sales Close Rate %
  deals: number; // Net sales/customers
  cac: number; // Customer Acquisition Cost
  revenue: number;
  roas: number;
}

export interface GdnSimulation {
  budget: number;
  cpm: number;
  impressions: number;
  ctr: number;
  clicks: number;
  cpc: number;
  assistedConversionRate: number; // %
  assistedConversions: number;
}

export interface YouTubeSimulation {
  budget: number;
  cpv: number; // Cost Per View
  videoViews: number;
  vtr: number; // View Through Rate %
  impressions: number;
  actionRate: number; // Click / Lead action %
  actions: number;
}

export interface OmnichannelMediaMix {
  totalBudget: number;
  allocations: {
    googleSearch: number; // % (e.g. 50)
    metaAds: number; // % (e.g. 30)
    youtube: number; // % (e.g. 10)
    gdn: number; // % (e.g. 10)
  };
  googleSearchSpend: number;
  metaAdsSpend: number;
  youtubeSpend: number;
  gdnSpend: number;

  totalImpressions: number;
  totalClicks: number;
  blendedCtr: number;
  totalGrossLeads: number;
  totalHealthyLeads: number;
  blendedCpql: number;
  totalDeals: number;
  blendedCac: number;
  totalRevenue: number;
  blendedRoas: number;
}

export interface ForecastDiscoveryResult {
  query: string;
  mode: 'URL' | 'KEYWORDS';
  sector: string;
  detectedLanguage: string;
  detectedLanguageName: string;
  pageTitle?: string;
  pageSummary?: string;
  totalCount: number;
  keywords: KeywordMetric[];
  suggestedCountries: CountryOption[];
  timestamp: string;
}
