export type MarketingRoute = 
  | 'dashboard'
  | 'competitors'
  | 'ai-copywriter'
  | 'roas-optimizer'
  | 'admin';

export type AdminTab = 'users' | 'keys' | 'flags' | 'logs';

export interface MarketingModuleInfo {
  id: MarketingRoute;
  name: string;
  description: string;
  iconName: string;
  path: string;
  badge?: string;
  isEnabled: boolean;
  isBeta?: boolean;
}

export interface AdminSettings {
  siteName: string;
  metaAccessToken: string;
  aiApiKey: string;
  maxMonthlyCredits: number;
  usedCredits: number;
  enabledModules: Record<MarketingRoute, boolean>;
  webhooksEnabled: boolean;
  systemEnvironment: 'Production' | 'Staging' | 'Development';
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  category: 'API' | 'SYSTEM' | 'SECURITY' | 'MODULE';
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
}
