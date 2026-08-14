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
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'API İsteği başarısız oldu.');
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

  // --- Competitors Management ---
  public static async getCompetitors(): Promise<Competitor[]> {
    const res = await this.request<{ status: string; competitors: Competitor[] }>('/competitors.php');
    return res.competitors || [];
  }

  public static async addCompetitor(data: string | { name: string; pageId: string; pageUrl?: string; category?: string }): Promise<Competitor> {
    const payload = typeof data === 'string'
      ? { pageId: data, name: data }
      : data;
    const res = await this.request<{ status: string; competitor: Competitor }>('/competitors.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.competitor;
  }

  public static async deleteCompetitor(id: string): Promise<void> {
    await this.request(`/competitors.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  // --- Saved Ads ---
  public static async getSavedAds(): Promise<SavedAdItem[]> {
    const res = await this.request<{ status: string; ads: SavedAdItem[] }>('/ads.php');
    return res.ads || [];
  }

  public static async saveAd(ad: AdItem, notes?: string, collectionName?: string): Promise<void> {
    await this.request('/ads.php', {
      method: 'POST',
      body: JSON.stringify({ ad, notes, collection_name: collectionName }),
    });
  }

  public static async deleteSavedAd(id: string | number): Promise<void> {
    await this.request(`/ads.php?id=${encodeURIComponent(String(id))}`, {
      method: 'DELETE',
    });
  }

  // --- Live Meta Ad Library Ingestion ---
  public static async fetchMetaAds(pageId?: string, country = 'TR'): Promise<AdItem[]> {
    const query = pageId ? `&page_id=${encodeURIComponent(pageId)}` : '';
    const res = await this.request<{ status: string; ads: AdItem[]; message?: string }>(`/ads.php?action=fetch_meta_ads&country=${country}${query}`);
    return res.ads || [];
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

  public static async getAuditLogs(): Promise<any[]> {
    const res = await this.request<{ status: string; logs: any[] }>('/settings.php?action=logs');
    return res.logs || [];
  }
}
