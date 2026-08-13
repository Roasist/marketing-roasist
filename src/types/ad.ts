export type AdFormat = 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'TEXT';
export type AdStatus = 'ACTIVE' | 'INACTIVE';
export type PlatformType = 'facebook' | 'instagram' | 'messenger' | 'audience_network';
export type HookType = 'İndirim & Aciliyet' | 'Sosyal Kanıt' | 'Problem-Çözüm' | 'Yaşam Tarzı' | 'Fiyat Vurgusu' | 'Ürün Özelliği';

export interface Competitor {
  id: string;
  name: string;
  pageId: string;
  facebookPageUrl: string;
  avatarUrl: string;
  category: string;
  activeAdsCount: number;
  historicalAdsCount: number;
  addedAt: string;
}

export interface AdItem {
  id: string;
  pageId: string;
  pageName: string;
  activeStatus: AdStatus;
  format: AdFormat;
  creationDate: string; // ISO String
  startDate: string;    // ISO String
  endDate?: string;     // ISO String if INACTIVE
  activeDaysCount: number; // e.g. 42 days running
  adBodyText: string;
  adHeadline: string;
  adCta: string;
  mediaUrls: string[];
  videoThumbnail?: string;
  platforms: PlatformType[];
  estimatedImpressions?: string;
  spendRange?: string;
  targetDemographics?: {
    ageRange: string;
    genderRatio: string;
    topLocations: string[];
  };
  hookType: HookType;
  metaLibraryUrl: string;
}

export interface FilterState {
  competitorId: string; // 'ALL' or specific pageId
  searchKeyword: string;
  status: 'ALL' | 'ACTIVE' | 'INACTIVE';
  format: 'ALL' | AdFormat;
  platform: 'ALL' | PlatformType;
  sortBy: 'NEWEST' | 'LONGEST_RUNNING' | 'MOST_IMPRESSIONS';
}

export interface MetaApiConfig {
  accessToken: string;
  isConfigured: boolean;
  useSandboxMock: boolean;
  lastSyncedAt?: string;
}

export interface WebhookConfig {
  githubRepo: string;
  subdomainUrl: string; // marketing.roasist.com
  serverIp: string; // Veridyen server IP
  webhookEndpoint: string;
  lastDeployedAt?: string;
  autoDeployEnabled: boolean;
}
