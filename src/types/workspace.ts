export interface Workspace {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  industry?: string;
  color?: string;
  logo_url?: string;
  currency?: string;
  is_default?: number | boolean;
  competitor_count?: number;
  saved_ads_count?: number;
  created_at?: string;
}

export interface WorkspaceMember {
  id: number;
  workspace_id: string;
  user_id: number;
  user_name: string;
  user_email: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
}

export interface CreateWorkspacePayload {
  name: string;
  domain?: string;
  industry?: string;
  color?: string;
  currency?: string;
  logoUrl?: string;
}
