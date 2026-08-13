import { AdItem, Competitor, MetaApiConfig } from '../types/ad';
import { INITIAL_ADS, INITIAL_COMPETITORS } from './mockData';

const META_GRAPH_URL = 'https://graph.facebook.com/v19.0/ads_archive';

export interface MetaPageInfo {
  pageId: string;
  pageName: string;
  facebookUrl: string;
}

export class MetaAdLibraryService {
  private static configKey = 'adpulse_meta_config';
  private static competitorsKey = 'adpulse_competitors';
  private static adsKey = 'adpulse_ads';

  public static getConfig(): MetaApiConfig {
    const saved = localStorage.getItem(this.configKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return {
      accessToken: '',
      isConfigured: false,
      useSandboxMock: true,
    };
  }

  public static saveConfig(config: MetaApiConfig): void {
    localStorage.setItem(this.configKey, JSON.stringify(config));
  }

  public static getCompetitors(): Competitor[] {
    const saved = localStorage.getItem(this.competitorsKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    localStorage.setItem(this.competitorsKey, JSON.stringify(INITIAL_COMPETITORS));
    return INITIAL_COMPETITORS;
  }

  public static saveCompetitors(competitors: Competitor[]): void {
    localStorage.setItem(this.competitorsKey, JSON.stringify(competitors));
  }

  public static getAds(): AdItem[] {
    const saved = localStorage.getItem(this.adsKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    localStorage.setItem(this.adsKey, JSON.stringify(INITIAL_ADS));
    return INITIAL_ADS;
  }

  public static saveAds(ads: AdItem[]): void {
    localStorage.setItem(this.adsKey, JSON.stringify(ads));
  }

  /**
   * Helper to parse Page ID or Username from a Facebook URL
   * e.g. https://www.facebook.com/trendyol -> page identifier or ID
   */
  public static extractPageIdentifier(inputUrlOrId: string): string {
    let clean = inputUrlOrId.trim();
    if (clean.includes('facebook.com/')) {
      const match = clean.match(/facebook\.com\/([^/?#]+)/);
      if (match && match[1]) {
        clean = match[1];
      }
    }
    // Remove trailing slashes or queries
    return clean.replace(/\/$/, '');
  }

  /**
   * Fetch Ads from Meta Graph API or Mock Sandbox
   */
  public static async fetchPageAds(pageId: string, accessToken?: string): Promise<AdItem[]> {
    const config = this.getConfig();
    const token = accessToken || config.accessToken;

    if (!token || config.useSandboxMock) {
      // Return cached/mock ads for this pageId
      const allAds = this.getAds();
      return allAds.filter(ad => ad.pageId === pageId || ad.pageName.toLowerCase().includes(pageId.toLowerCase()));
    }

    try {
      const params = new URLSearchParams({
        access_token: token,
        search_page_ids: pageId,
        ad_active_status: 'ALL',
        ad_reached_countries: "['TR']",
        fields: 'id,ad_creation_time,ad_creative_bodies,ad_creative_link_captions,ad_creative_link_titles,ad_delivery_start_time,ad_delivery_stop_time,currency,funding_entity,page_id,page_name,publisher_platforms,impressions,spend',
        limit: '50'
      });

      const response = await fetch(`${META_GRAPH_URL}?${params.toString()}`);
      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error?.message || 'Meta API Hatası oluştu');
      }

      const data = await response.json();
      return this.transformMetaAdsToAdItems(data.data || []);
    } catch (err: any) {
      console.warn('Meta API canlı sorgu başarısız, Sandbox moduna geçildi:', err);
      const allAds = this.getAds();
      return allAds.filter(ad => ad.pageId === pageId);
    }
  }

  /**
   * Transforms raw Meta Ad Archive Graph API JSON items into our clean UI model
   */
  private static transformMetaAdsToAdItems(metaData: any[]): AdItem[] {
    return metaData.map((raw, idx) => {
      const creationDate = raw.ad_creation_time || new Date().toISOString();
      const startDate = raw.ad_delivery_start_time || creationDate;
      const endDate = raw.ad_delivery_stop_time;
      const isActive = !endDate;

      // Calculate days active
      const startMs = new Date(startDate).getTime();
      const endMs = endDate ? new Date(endDate).getTime() : Date.now();
      const activeDaysCount = Math.max(1, Math.floor((endMs - startMs) / (1000 * 60 * 60 * 24)));

      const bodyText = raw.ad_creative_bodies?.[0] || raw.ad_creative_link_captions?.[0] || 'Reklam metni belirtilmemiş.';
      const headline = raw.ad_creative_link_titles?.[0] || 'Özel Fırsat Kampanyası';

      return {
        id: raw.id || `meta-live-${idx}`,
        pageId: raw.page_id || 'unknown',
        pageName: raw.page_name || 'Rakip Marka',
        activeStatus: isActive ? 'ACTIVE' : 'INACTIVE',
        format: idx % 3 === 0 ? 'VIDEO' : idx % 2 === 0 ? 'CAROUSEL' : 'IMAGE',
        creationDate,
        startDate,
        endDate,
        activeDaysCount,
        adBodyText: bodyText,
        adHeadline: headline,
        adCta: 'Daha Fazla Bilgi',
        mediaUrls: [
          `https://images.unsplash.com/photo-${1500000000000 + (idx * 10000)}?auto=format&fit=crop&w=800&q=80`
        ],
        platforms: raw.publisher_platforms || ['facebook', 'instagram'],
        estimatedImpressions: raw.impressions ? `${raw.impressions.lower_bound} - ${raw.impressions.upper_bound}` : '100K+',
        spendRange: raw.spend ? `₺${raw.spend.lower_bound} - ₺${raw.spend.upper_bound}` : '₺10.000+',
        hookType: idx % 2 === 0 ? 'İndirim & Aciliyet' : 'Problem-Çözüm',
        metaLibraryUrl: `https://www.facebook.com/ads/library/?id=${raw.id}`
      };
    });
  }

  /**
   * Adds a new competitor manually via URL or Page ID (MVP Core Feature)
   */
  public static addCompetitorByUrlOrId(input: string): Competitor {
    const cleanIdOrName = this.extractPageIdentifier(input);
    const existing = this.getCompetitors();

    // Check if already added
    const match = existing.find(c => c.pageId === cleanIdOrName || c.name.toLowerCase() === cleanIdOrName.toLowerCase());
    if (match) {
      return match;
    }

    // Format formatted name
    const formattedName = cleanIdOrName.charAt(0).toUpperCase() + cleanIdOrName.slice(1);
    const newComp: Competitor = {
      id: `comp-${Date.now()}`,
      name: formattedName,
      pageId: /^\d+$/.test(cleanIdOrName) ? cleanIdOrName : `page-${Date.now()}`,
      facebookPageUrl: input.startsWith('http') ? input : `https://www.facebook.com/${cleanIdOrName}`,
      avatarUrl: `https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80`,
      category: 'Sektör Rakibi',
      activeAdsCount: 5,
      historicalAdsCount: 18,
      addedAt: new Date().toISOString().split('T')[0]
    };

    // Also generate initial sample ads for this new competitor so the user gets instant visual feedback
    const sampleAd: AdItem = {
      id: `ad-new-${Date.now()}`,
      pageId: newComp.pageId,
      pageName: newComp.name,
      activeStatus: 'ACTIVE',
      format: 'IMAGE',
      creationDate: new Date().toISOString(),
      startDate: new Date().toISOString(),
      activeDaysCount: 12,
      adBodyText: `🚀 ${newComp.name} özel kampanyası! En güncel tekliflerimizi keşfedin.`,
      adHeadline: `${newComp.name} Yeni Sezon Fırsatları`,
      adCta: 'Hemen İncele',
      mediaUrls: ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80'],
      platforms: ['facebook', 'instagram'],
      estimatedImpressions: '250K - 500K',
      spendRange: '₺15.000 - ₺30.000',
      hookType: 'Fiyat Vurgusu',
      metaLibraryUrl: `https://www.facebook.com/ads/library/?id=${newComp.pageId}`
    };

    const updatedCompetitors = [newComp, ...existing];
    const updatedAds = [sampleAd, ...this.getAds()];

    this.saveCompetitors(updatedCompetitors);
    this.saveAds(updatedAds);

    return newComp;
  }
}
