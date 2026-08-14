export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MARKETER' | 'VIEWER';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  lastLoginAt?: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface SavedAdItem {
  id: string;
  adId: string;
  competitorId?: string;
  pageName: string;
  format: 'IMAGE' | 'VIDEO' | 'CAROUSEL';
  headline: string;
  bodyText: string;
  mediaUrls: string[];
  hookType: string;
  notes?: string;
  tags?: string;
  isWinner: boolean;
  createdAt: string;
}
