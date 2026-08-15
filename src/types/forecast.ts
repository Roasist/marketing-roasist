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

export interface ForecastSimulation {
  monthlyBudget: number;
  dailyBudget: number;
  estClicks: number;
  estImpressions: number;
  avgCpc: number;
  avgCtr: number;
  conversionRate: number;
  estConversions: number;
  cpa: number;
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
  suggestedCountries?: CountryOption[];
  timestamp: string;
}
