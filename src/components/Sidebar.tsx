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
  Sparkles, 
  Building,
  Sliders,
  LogOut,
  ShieldCheck
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
      path: '/',
    },
    {
      id: 'competitors' as MarketingRoute,
      name: 'Rakip Reklam İstihbaratı',
      icon: Target,
      path: '/competitors',
      badge: 'Aktif Modül',
    },
    {
      id: 'ai-copywriter' as MarketingRoute,
      name: 'AI Reklam Metni & Kanca',
      icon: PenTool,
      path: '/ai-copywriter',
      isBeta: true,
    },
    {
      id: 'roas-optimizer' as MarketingRoute,
      name: 'ROAS & Bütçe Simülatörü',
      icon: TrendingUp,
      path: '/roas-optimizer',
      isBeta: true,
    },
    ...(hasRole(['SUPER_ADMIN', 'ADMIN']) ? [
      {
        id: 'admin' as MarketingRoute,
        name: 'Admin & Kullanıcı Yönetimi',
        icon: Sliders,
        path: '/admin',
        badge: 'Admin',
      }
    ] : []),
  ];

  return (
    <aside style={{
      width: isCollapsed ? '78px' : '260px',
      transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      background: 'rgba(17, 24, 39, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid var(--border-glass)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 110,
    }}>
      
      {/* Brand Header */}
      <div style={{
        padding: isCollapsed ? '1.25rem 0.75rem' : '1.25rem 1.5rem',
        borderBottom: '1px solid var(--border-glass)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
      }}>
        <div 
          onClick={() => onNavigate('dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', overflow: 'hidden' }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(124, 58, 237, 0.4)',
            flexShrink: 0,
          }}>
            <Sparkles size={22} color="white" />
          </div>

          {!isCollapsed && (
            <div>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 800 }} className="gradient-text">
                Roasist AI
              </h1>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                Marketing Suite
              </div>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '8px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
            }}
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Workspace Switcher */}
      {!isCollapsed && (
        <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-glass)' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.5rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
          }}>
            <Building size={16} color="var(--accent-purple)" />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Roasist Main Workspace
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--accent-emerald)' }}>
                ● Veritabanı: Aktif (SQLite)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
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
                padding: isCollapsed ? '0.75rem' : '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                background: isActive ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.25), rgba(6, 182, 212, 0.15))' : 'transparent',
                border: isActive ? '1px solid rgba(124, 58, 237, 0.4)' : '1px solid transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title={isCollapsed ? item.name : undefined}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <IconComponent 
                  size={19} 
                  color={isActive ? 'var(--accent-purple)' : 'var(--text-muted)'} 
                />
                {!isCollapsed && <span>{item.name}</span>}
              </div>

              {!isCollapsed && (
                <div>
                  {item.badge && (
                    <span className="badge badge-active" style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem' }}>
                      {item.badge}
                    </span>
                  )}
                  {item.isBeta && (
                    <span className="badge badge-carousel" style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem' }}>
                      Yakında
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle for Compact mode */}
      {isCollapsed && (
        <div style={{ padding: '0.75rem', textAlign: 'center', borderTop: '1px solid var(--border-glass)' }}>
          <button
            onClick={onToggleCollapse}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '8px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Footer Profile & Logout */}
      <div style={{
        padding: isCollapsed ? '0.75rem' : '1rem 1.25rem',
        borderTop: '1px solid var(--border-glass)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.8rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            color: 'white',
            flexShrink: 0,
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'R'}
          </div>
          
          {!isCollapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Kullanıcı'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <ShieldCheck size={12} color="#34d399" />
                {user?.role === 'SUPER_ADMIN' ? 'Süper Admin' : user?.role === 'ADMIN' ? 'Yönetici' : 'Pazarlamacı'}
              </div>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <button
            onClick={logout}
            title="Güvenli Çıkış Yap"
            style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '8px',
              color: '#fb7185',
              cursor: 'pointer',
              padding: '6px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogOut size={15} />
          </button>
        )}
      </div>

    </aside>
  );
};
