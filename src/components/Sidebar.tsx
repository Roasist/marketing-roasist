import React from 'react';
import { MarketingRoute } from '../types/suite';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Target, 
  PenTool, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight, 
  Sliders,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  currentRoute: MarketingRoute;
  onNavigate: (route: MarketingRoute) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { user, logout, hasRole } = useAuth();

  const menuItems = [
    {
      id: 'dashboard' as MarketingRoute,
      name: 'Genel Bakış',
      icon: LayoutDashboard,
    },
    {
      id: 'competitors' as MarketingRoute,
      name: 'Rakip Reklam İstihbaratı',
      icon: Target,
    },
    {
      id: 'ai-copywriter' as MarketingRoute,
      name: 'AI Reklam Metni Yazarı',
      icon: PenTool,
      badge: 'Beta',
    },
    {
      id: 'roas-optimizer' as MarketingRoute,
      name: 'ROAS & Bütçe Tahmin',
      icon: TrendingUp,
      badge: 'Beta',
    },
    ...(hasRole(['SUPER_ADMIN', 'ADMIN']) ? [
      {
        id: 'admin' as MarketingRoute,
        name: 'Kullanıcı & Sistem Paneli',
        icon: Sliders,
      }
    ] : []),
  ];

  return (
    <aside style={{
      width: isCollapsed ? '64px' : '240px',
      transition: 'width 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 110,
      flexShrink: 0,
    }}>
      
      {/* Brand Header */}
      <div style={{
        height: '56px',
        padding: isCollapsed ? '0' : '0 1rem',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
      }}>
        <div 
          onClick={() => onNavigate('dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', overflow: 'hidden' }}
        >
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            backgroundColor: '#ffffff',
            color: '#090b10',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.85rem',
            flexShrink: 0,
          }}>
            R
          </div>

          {!isCollapsed && (
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
              Roasist <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Suite</span>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
            }}
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1 }}>
        
        {!isCollapsed && (
          <div style={{ padding: '0.35rem 0.5rem', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Platform Araçları
          </div>
        )}

        {menuItems.map((item) => {
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
              }}
              title={isCollapsed ? item.name : undefined}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <IconComponent 
                  size={17} 
                  color={isActive ? '#ffffff' : 'var(--text-muted)'} 
                />
                {!isCollapsed && <span>{item.name}</span>}
              </div>

              {!isCollapsed && item.badge && (
                <span className="badge badge-neutral" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse button when mini */}
      {isCollapsed && (
        <div style={{ padding: '0.5rem', textAlign: 'center', borderTop: '1px solid var(--border-subtle)' }}>
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
        borderTop: '1px solid var(--border-subtle)',
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
