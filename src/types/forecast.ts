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
  monthlyBudget: number;
  selectedKeywords: KeywordMetric[];
  simulationResult: ForecastSimulation;
  negativeKeywords: NegativeCategory[];
  createdAt?: string;
}

export interface ForecastDiscoveryResult {
  query: string;
  mode: 'URL' | 'KEYWORDS';
  sector: string;
  country: string;
  language: string;
  totalCount: number;
  keywords: KeywordMetric[];
  timestamp: string;
}
