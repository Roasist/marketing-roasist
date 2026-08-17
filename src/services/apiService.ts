import { User, SavedAdItem } from '../types/auth';
import { Competitor, AdItem } from '../types/ad';

const API_BASE = '/api';

export class ApiService {
  private static getToken(): string | null {
    return localStorage.getItem('roasist_auth_token');
  }

  public static setToken(token: string) {
    localStorage.setItem('roasist_auth_token', token);
  }

  public static removeToken() {
    localStorage.removeItem('roasist_auth_token');
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['X-Auth-Token'] = token;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      const text = await response.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { status: response.ok ? 'success' : 'error', message: text };
      }

      if (!response.ok) {
        throw new Error(data.message || `API Hatası (HTTP ${response.status})`);
      }

      return data as T;
    } catch (err: any) {
      console.warn(`API Error [${endpoint}]:`, err.message);
      throw err;
    }
  }

  // --- Auth Endpoints ---
  public static async login(email: string, password: string): Promise<{ token: string; user: User }> {
    return this.request<{ token: string; user: User }>('/auth.php?action=login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  public static async verifyToken(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth.php?action=verify');
  }

  public static async logout(): Promise<void> {
    try {
      await this.request('/auth.php?action=logout', { method: 'POST' });
    } finally {
      this.removeToken();
    }
  }

  // --- User Management (Admin) ---
  public static async getUsers(): Promise<User[]> {
    const res = await this.request<{ status: string; users: User[] }>('/users.php');
    return res.users || [];
  }

  public static async createUser(data: { name: string; email: string; password: string; role: string; status?: string }): Promise<User> {
    const res = await this.request<{ status: string; user: User }>('/users.php', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.user;
  }

  public static async updateUser(data: { id: number; name: string; email: string; role: string; status: string; password?: string }): Promise<void> {
    await this.request('/users.php', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public static async deleteUser(id: number): Promise<void> {
    await this.request(`/users.php?id=${id}`, {
      method: 'DELETE',
    });
  }

  // --- Workspaces (Çalışma Alanları) ---
  public static async getWorkspaces(activeId?: string): Promise<{ activeWorkspaceId: string; workspaces: any[] }> {
    const params = activeId ? `?active_id=${encodeURIComponent(activeId)}` : '';
    const res = await this.request<{ status: string; activeWorkspaceId: string; workspaces: any[] }>(`/workspaces.php${params}`);
    return {
      activeWorkspaceId: res.activeWorkspaceId,
      workspaces: res.workspaces || []
    };
  }

  public static async createWorkspace(payload: { name: string; domain?: string; industry?: string; color?: string; currency?: string }): Promise<any> {
    const res = await this.request<{ status: string; message: string; workspace: any }>('/workspaces.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.workspace;
  }

  public static async updateWorkspace(id: string, payload: { name?: string; domain?: string; industry?: string; color?: string; currency?: string }): Promise<void> {
    await this.request(`/workspaces.php?id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public static async deleteWorkspace(id: string): Promise<void> {
    await this.request(`/workspaces.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  // --- Competitors Management ---
  public static async getCompetitors(workspaceId?: string): Promise<Competitor[]> {
    const param = workspaceId ? `?workspace_id=${encodeURIComponent(workspaceId)}` : '';
    const res = await this.request<{ status: string; competitors: Competitor[] }>(`/competitors.php${param}`);
    return res.competitors || [];
  }

  public static async addCompetitor(data: string | { name: string; pageId: string; pageUrl?: string; category?: string; workspace_id?: string }, workspaceId?: string): Promise<Competitor> {
    const payload = typeof data === 'string'
      ? { urlOrId: data, pageId: data, name: data, workspace_id: workspaceId }
      : { urlOrId: data.pageUrl || data.pageId, ...data, workspace_id: workspaceId || (data as any).workspace_id };
    const res = await this.request<{ status: string; competitor: Competitor }>('/competitors.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.competitor;
  }

  public static async searchAdvertisers(query: string): Promise<any[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      const res = await this.request<{ status: string; advertisers: any[] }>(`/competitors.php?action=search_advertisers&q=${encodeURIComponent(query.trim())}`);
      return res.advertisers || [];
    } catch {
      return [];
    }
  }

  public static async deleteCompetitor(id: string): Promise<void> {
    await this.request(`/competitors.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  // --- Saved Ads ---
  public static async getSavedAds(workspaceId?: string): Promise<SavedAdItem[]> {
    const param = workspaceId ? `?workspace_id=${encodeURIComponent(workspaceId)}` : '';
    const res = await this.request<{ status: string; ads: SavedAdItem[] }>(`/ads.php${param}`);
    return res.ads || [];
  }

  public static async saveAd(ad: AdItem, notes?: string, collectionName?: string, workspaceId?: string): Promise<void> {
    await this.request('/ads.php', {
      method: 'POST',
      body: JSON.stringify({ ad, notes, collection_name: collectionName, workspace_id: workspaceId }),
    });
  }

  public static async deleteSavedAd(id: string | number): Promise<void> {
    await this.request(`/ads.php?id=${encodeURIComponent(String(id))}`, {
      method: 'DELETE',
    });
  }

  // --- Live Meta Ad Library Ingestion ---
  public static async fetchMetaAds(options: { pageId?: string; query?: string; country?: string; status?: string; mediaType?: string; limit?: number } | string = {}): Promise<AdItem[]> {
    const opts = typeof options === 'string' ? { pageId: options } : options;
    const params = new URLSearchParams({ action: 'fetch_meta_ads' });
    if (opts.pageId && opts.pageId !== 'ALL') params.set('page_id', opts.pageId);
    if (opts.query) params.set('q', opts.query);
    if (opts.country) params.set('country', opts.country);
    if (opts.status) params.set('status', opts.status);
    if (opts.mediaType && opts.mediaType !== 'ALL') params.set('media_type', opts.mediaType);
    if (opts.limit) params.set('limit', String(opts.limit));

    const res = await this.request<{ status: string; ads: AdItem[]; message?: string }>(`/ads.php?${params.toString()}`);
    return res.ads || [];
  }

  // --- Google Ads Transparency Center Ingestion ---
  public static async fetchGoogleAds(query: string, region = 'ALL', format = 'ALL'): Promise<AdItem[]> {
    if (!query) return [];
    try {
      const res = await this.request<{ status: string; ads: AdItem[] }>(`/google_ads.php?action=fetch_google_ads&domain=${encodeURIComponent(query)}&region=${encodeURIComponent(region)}&format=${encodeURIComponent(format)}`);
      return res.ads || [];
    } catch {
      return [];
    }
  }

  public static async searchGoogleAdvertisers(query: string, region = 'ALL'): Promise<any[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      const res = await this.request<{ status: string; advertisers: any[] }>(`/google_ads.php?action=search_advertisers&q=${encodeURIComponent(query.trim())}&region=${encodeURIComponent(region)}`);
      return res.advertisers || [];
    } catch {
      return [];
    }
  }

  // --- App Settings & Audit Logs ---
  public static async getSettings(): Promise<any> {
    const res = await this.request<{ status: string; settings: any }>('/settings.php');
    return res.settings || {};
  }

  public static async updateSettings(settings: any): Promise<void> {
    await this.request('/settings.php', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }

  public static async testMetaToken(): Promise<{ status: string; message: string }> {
    return await this.request<{ status: string; message: string }>('/settings.php?action=test_meta');
  }

  public static async testGoogleApiKey(): Promise<{ status: string; message: string }> {
    return await this.request<{ status: string; message: string }>('/settings.php?action=test_google');
  }

  public static async testGoogleAdsConnection(): Promise<{ status: string; message: string; accessibleCustomers?: string[] }> {
    return await this.request<{ status: string; message: string; accessibleCustomers?: string[] }>('/settings.php?action=test_google_ads');
  }

  public static async getAuditLogs(): Promise<any[]> {
    const res = await this.request<{ status: string; logs: any[] }>('/settings.php?action=logs');
    return res.logs || [];
  }

  // --- Google Ads Forecast & Keyword Budget Planner ---
  public static async discoverKeywords(payload: {
    query: string;
    mode: 'URL' | 'KEYWORDS';
    country?: string;
    countryCode?: string;
    language?: string;
    geoTargetConstants?: string[];
  }): Promise<any> {
    const res = await this.request<{ status: string; data?: any; message?: string }>('/forecast.php?action=discover', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res && res.status === 'error') {
      throw new Error(res.message || 'Anahtar kelime analizi yapılamadı.');
    }
    return res?.data;
  }

  public static async generateNegativeKeywords(payload: {
    sector: string;
    keywords: string[];
    language?: string;
  }): Promise<any[]> {
    const res = await this.request<{ status: string; categories: any[] }>('/forecast.php?action=negative_keywords', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.categories || [];
  }

  public static async searchLocations(query: string, locale: string = 'tr'): Promise<any[]> {
    const res = await this.request<{ status: string; locations: any[] }>(
      `/forecast.php?action=search_locations&q=${encodeURIComponent(query)}&locale=${encodeURIComponent(locale)}`
    );
    return res.locations || [];
  }

  public static async getForecastPlans(workspaceId?: string): Promise<any[]> {
    const res = await this.request<{ status: string; plans: any[] }>(`/forecast.php?action=plans&workspace_id=${encodeURIComponent(workspaceId || '')}`);
    return res.plans || [];
  }

  public static async saveForecastPlan(plan: any): Promise<any> {
    return await this.request('/forecast.php?action=plans', {
      method: 'POST',
      body: JSON.stringify(plan),
    });
  }

  public static async deleteForecastPlan(id: string): Promise<void> {
    await this.request(`/forecast.php?action=plans&id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }
}
