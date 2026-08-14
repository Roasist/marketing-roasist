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

  public static async updateUser(data: { id: number; name: string; role: string; status: string; password?: string }): Promise<void> {
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

  public static async addCompetitor(urlOrId: string): Promise<Competitor> {
    const res = await this.request<{ status: string; competitor: Competitor }>('/competitors.php', {
      method: 'POST',
      body: JSON.stringify({ urlOrId }),
    });
    return res.competitor;
  }

  public static async deleteCompetitor(id: string): Promise<void> {
    await this.request(`/competitors.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  // --- Saved Ads & Notes ---
  public static async getSavedAds(): Promise<SavedAdItem[]> {
    const res = await this.request<{ status: string; savedAds: SavedAdItem[] }>('/ads.php');
    return res.savedAds || [];
  }

  public static async saveAd(ad: AdItem, notes?: string, tags?: string): Promise<{ id: string }> {
    return this.request<{ status: string; id: string }>('/ads.php', {
      method: 'POST',
      body: JSON.stringify({
        ...ad,
        notes: notes || '',
        tags: tags || 'Favori',
      }),
    });
  }

  public static async deleteSavedAd(id: string): Promise<void> {
    await this.request(`/ads.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  // --- Settings & Logs ---
  public static async getSettings(): Promise<Record<string, string>> {
    const res = await this.request<{ status: string; settings: Record<string, string> }>('/settings.php');
    return res.settings || {};
  }

  public static async updateSettings(settings: Record<string, any>): Promise<void> {
    await this.request('/settings.php', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }

  public static async getAuditLogs(): Promise<any[]> {
    const res = await this.request<{ status: string; logs: any[] }>('/settings.php?action=logs');
    return res.logs || [];
  }
}
