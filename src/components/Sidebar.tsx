import React from 'react';
import { MarketingRoute, AdminTab } from '../types/suite';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Target, 
  PenTool, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight, 
  Sliders, 
  LogOut,
  ArrowLeft,
  Users,
  Key,
  SlidersHorizontal,
  Activity,
  LineChart,
  BookOpen
} from 'lucide-react';

import { Workspace } from '../types/workspace';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';

interface SidebarProps {
  currentRoute: MarketingRoute;
  onNavigate: (route: MarketingRoute) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  adminTab?: AdminTab;
  onSelectAdminTab?: (tab: AdminTab) => void;
  workspaces?: Workspace[];
  activeWorkspaceId?: string;
  onSelectWorkspace?: (id: string) => void;
  onOpenCreateWorkspaceModal?: () => void;
  onOpenEditWorkspaceModal?: (workspace: Workspace) => void;
  onDeleteWorkspace?: (id: string) => Promise<void>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  adminTab = 'users',
  onSelectAdminTab,
  workspaces = [],
  activeWorkspaceId = '',
  onSelectWorkspace,
  onOpenCreateWorkspaceModal,
  onOpenEditWorkspaceModal,
  onDeleteWorkspace,
}) => {
  const { user, logout, hasRole } = useAuth();
  const isAdminRoute = currentRoute === 'admin';

  // Marketing Workspace Menu Items
  const marketingMenuItems = [
    {
      id: 'dashboard' as MarketingRoute,
      name: 'Genel Bakış',
      icon: LayoutDashboard,
    },
    {
      id: 'competitors' as MarketingRoute,
      name: 'Rakip İstihbaratı',
      icon: Target,
    },
    {
      id: 'forecast' as MarketingRoute,
      name: 'Tahminleme (Forecast)',
      icon: LineChart,
      badge: 'Yeni',
    },
    {
      id: 'ai-copywriter' as MarketingRoute,
      name: 'AI Metin Yazarı',
      icon: PenTool,
      badge: 'Beta',
    },
    {
      id: 'roas-optimizer' as MarketingRoute,
      name: 'ROAS Simülatörü',
      icon: TrendingUp,
      badge: 'Beta',
    },
  ];

  // Admin Console Menu Items
  const adminMenuItems = [
    {
      id: 'users' as AdminTab,
      name: 'Kullanıcı Yönetimi',
      icon: Users,
    },
    {
      id: 'keys' as AdminTab,
      name: 'API Bağlantıları',
      icon: Key,
    },
    {
      id: 'flags' as AdminTab,
      name: 'Modül Ayarları',
      icon: SlidersHorizontal,
    },
    {
      id: 'logs' as AdminTab,
      name: 'Denetim Günlüğü',
      icon: Activity,
    },
    {
      id: 'guide' as AdminTab,
      name: 'Kullanım Kılavuzu',
      icon: BookOpen,
    },
  ];

  const handleAdminItemClick = (tab: AdminTab) => {
    if (onSelectAdminTab) {
      onSelectAdminTab(tab);
    }
    if (currentRoute !== 'admin') {
      onNavigate('admin');
    }
  };

  return (
    <aside style={{
      width: isCollapsed ? '64px' : '240px',
      transition: 'width 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-default)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 110,
      flexShrink: 0,
    }}>
      
      {/* Brand & Workspace Switcher Header */}
      <div style={{
        height: '60px',
        padding: isCollapsed ? '0 0.5rem' : '0 0.65rem',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        gap: '0.35rem',
      }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
          {workspaces.length > 0 && onSelectWorkspace && onOpenCreateWorkspaceModal && onOpenEditWorkspaceModal ? (
            <WorkspaceSwitcher
              workspaces={workspaces}
              activeWorkspaceId={activeWorkspaceId}
              onSelectWorkspace={onSelectWorkspace}
              onOpenCreateModal={onOpenCreateWorkspaceModal}
              onOpenEditModal={onOpenEditWorkspaceModal}
              onDeleteWorkspace={onDeleteWorkspace}
              isCollapsed={isCollapsed}
            />
          ) : (
            <div 
              onClick={() => onNavigate('dashboard')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', overflow: 'hidden' }}
            >
              <img
                src="/favicon.svg"
                alt="Roasist Logo"
                style={{ width: '24px', height: '24px', objectFit: 'contain', flexShrink: 0 }}
              />
              {!isCollapsed && (
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                  Roasist <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Suite</span>
                </div>
              )}
            </div>
          )}
        </div>

        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            title="Menüyü Daralt"
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              flexShrink: 0,
            }}
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Navigation Area */}
      <nav style={{ padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
        
        {/* CASE 1: In Dedicated Admin Console */}
        {isAdminRoute ? (
          <>
            {!isCollapsed && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="btn-ghost"
                style={{
                  padding: '0.5rem 0.65rem',
                  marginBottom: '0.5rem',
                  fontSize: '0.8rem',
                  color: 'var(--brand-primary)',
                  fontWeight: 600,
                  width: '100%',
                  justifyContent: 'flex-start',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                }}
              >
                <ArrowLeft size={14} /> Pazarlama Paneline Dön
              </button>
            )}

            {!isCollapsed && (
              <div style={{ padding: '0.35rem 0.5rem', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Yönetim Konsolu
              </div>
            )}

            {adminMenuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = adminTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleAdminItemClick(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    gap: '0.65rem',
                    padding: isCollapsed ? '0.6rem 0' : '0.5rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    border: isActive ? '1px solid var(--border-default)' : '1px solid transparent',
                    width: '100%',
                    transition: 'all var(--transition-fast)',
                  }}
                  title={isCollapsed ? item.name : undefined}
                >
                  <IconComponent 
                    size={16} 
                    color={isActive ? 'var(--brand-primary)' : 'var(--text-muted)'} 
                  />
                  {!isCollapsed && <span>{item.name}</span>}
                </button>
              );
            })}
          </>
        ) : (
          /* CASE 2: In Marketing Suite Tools */
          <>
            {!isCollapsed && (
              <div style={{ padding: '0.35rem 0.5rem', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Pazarlama Araçları
              </div>
            )}

            {marketingMenuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentRoute === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'space-between',
                    padding: isCollapsed ? '0.6rem 0' : '0.5rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'background var(--transition-fast), color var(--transition-fast)',
                    width: '100%',
                    position: 'relative',
                  }}
                  title={isCollapsed ? item.name : undefined}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <IconComponent 
                      size={17} 
                      color={isActive ? 'var(--text-primary)' : 'var(--text-muted)'} 
                    />
                    {!isCollapsed && <span>{item.name}</span>}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span className="badge badge-neutral" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Admin Console Switcher for Authorized Users */}
            {hasRole(['SUPER_ADMIN', 'ADMIN']) && (
              <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-default)' }}>
                <button
                  onClick={() => onNavigate('admin')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    gap: '0.65rem',
                    padding: isCollapsed ? '0.6rem 0' : '0.5rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    fontWeight: 500,
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                  title="Admin Yönetim Paneli"
                >
                  <Sliders size={15} color="var(--brand-primary)" />
                  {!isCollapsed && <span>Admin Konsolu</span>}
                </button>
              </div>
            )}
          </>
        )}

      </nav>

      {/* Collapse button when mini */}
      {isCollapsed && (
        <div style={{ padding: '0.5rem', textAlign: 'center', borderTop: '1px solid var(--border-default)' }}>
          <button
            onClick={onToggleCollapse}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Footer Profile */}
      <div style={{
        padding: isCollapsed ? '0.75rem 0.25rem' : '0.75rem 0.85rem',
        borderTop: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        backgroundColor: 'var(--bg-surface-elevated)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            backgroundColor: 'var(--brand-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            color: '#ffffff',
            fontSize: '0.75rem',
            flexShrink: 0,
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          
          {!isCollapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 500, fontSize: '0.8rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Kullanıcı'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {user?.role === 'SUPER_ADMIN' ? 'Süper Admin' : user?.role === 'ADMIN' ? 'Yönetici' : 'Pazarlamacı'}
              </div>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <button
            onClick={logout}
            title="Güvenli Çıkış"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
            }}
          >
            <LogOut size={15} />
          </button>
        )}
      </div>

    </aside>
  );
};
