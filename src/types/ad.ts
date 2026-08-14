export type AdNetwork = 'META' | 'GOOGLE';
export type AdFormat = 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'SEARCH' | 'DISPLAY' | 'TEXT';
export type AdStatus = 'ACTIVE' | 'INACTIVE';
export type PlatformType = 'facebook' | 'instagram' | 'messenger' | 'audience_network' | 'google_search' | 'youtube' | 'google_display';
export type HookType = 'İndirim & Aciliyet' | 'Sosyal Kanıt' | 'Problem-Çözüm' | 'Yaşam Tarzı' | 'Fiyat Vurgusu' | 'Ürün Özelliği' | 'Arama Niyeti & SEO';

export interface Competitor {
  id: string;
  name: string;
  pageId: string;
  domain?: string;
  facebookPageUrl?: string;
  googleAdvertiserId?: string;
  avatarUrl: string;
  category: string;
  activeAdsCount: number;
  historicalAdsCount: number;
  addedAt: string;
}

export interface AdItem {
  id: string;
  network?: AdNetwork; // 'META' | 'GOOGLE'
  pageId: string;
  pageName: string;
  domain?: string;
  targetUrl?: string;
  activeStatus: AdStatus;
  format: AdFormat;
  creationDate: string; // ISO String
  startDate: string;    // ISO String
  lastSeenDate?: string; // ISO String (Google Ads Transparency)
  endDate?: string;     // ISO String if INACTIVE
  activeDaysCount: number; // e.g. 42 days running
  adBodyText: string;
  adHeadline: string;
  adCta: string;
  mediaUrls: string[];
  videoThumbnail?: string;
  platforms: PlatformType[];
  sitelinks?: string[];
  estimatedImpressions?: string;
  spendRange?: string;
  targetDemographics?: {
    ageRange: string;
    genderRatio: string;
    topLocations: string[];
  };
  hookType: HookType;
  metaLibraryUrl?: string;
  googleTransparencyUrl?: string;
}

export interface FilterState {
  competitorId: string; // 'ALL' or specific pageId
  network: 'ALL' | 'META' | 'GOOGLE';
  searchKeyword: string;
  country?: string; // 'TR', 'US', 'DE', 'GB', 'AE', 'FR', 'ALL'
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
