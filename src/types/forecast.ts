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

export interface CountryMetric {
  code: string;
  name: string;
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

export interface ForecastPlan {
  id: string;
  workspaceId?: string;
  name: string;
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
  createdAt?: string;
}

export type ChannelType = 'OMNICHANNEL' | 'GOOGLE_SEARCH' | 'META_ADS' | 'YOUTUBE' | 'GDN';

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
