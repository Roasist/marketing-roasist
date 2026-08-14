import React from 'react';
import { MarketingRoute } from '../types/suite';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ChevronRight, Sliders, LogOut, Sun, Moon, ArrowLeft } from 'lucide-react';

interface TopBarProps {
  currentRoute: MarketingRoute;
  onNavigate: (route: MarketingRoute) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentRoute,
  onNavigate,
}) => {
  const { user, logout, hasRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isAdminRoute = currentRoute === 'admin';

  const getRouteTitle = () => {
    switch (currentRoute) {
      case 'dashboard':
        return 'Genel Bakış';
      case 'competitors':
        return 'Rakip Reklam İstihbaratı';
      case 'ai-copywriter':
        return 'AI Reklam Metni Yazarı';
      case 'roas-optimizer':
        return 'ROAS & Bütçe Tahmin';
      case 'admin':
        return 'Admin Konsolu & Sistem Yönetimi';
      default:
        return 'Marketing Suite';
    }
  };

  return (
    <header style={{
      height: '56px',
      borderBottom: '1px solid var(--border-default)',
      backgroundColor: 'var(--bg-surface)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      
      {/* Left: Breadcrumbs / Mode */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}>
        {isAdminRoute ? (
          <button
            onClick={() => onNavigate('dashboard')}
            className="btn-ghost"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={13} /> Pazarlama Paneli
          </button>
        ) : (
          <span 
            onClick={() => onNavigate('dashboard')}
            style={{ color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 400 }}
          >
            Roasist Suite
          </span>
        )}
        <ChevronRight size={13} color="var(--text-muted)" />
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {getRouteTitle()}
        </span>
      </div>

      {/* Right: Actions, Theme Switcher & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        
        {/* Environment Status Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.75rem',
          padding: '0.25rem 0.6rem',
          borderRadius: 'var(--radius-xs)',
          backgroundColor: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-secondary)',
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
          <span>marketing.roasist.com</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Açık Moda Geç' : 'Karanlık Moda Geç'}
          className="btn-ghost"
          style={{
            padding: '0.35rem 0.55rem',
            border: '1px solid var(--border-default)',
            backgroundColor: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
          }}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Admin Quick Switcher Button */}
        {hasRole(['SUPER_ADMIN', 'ADMIN']) && (
          <button
            onClick={() => onNavigate(isAdminRoute ? 'dashboard' : 'admin')}
            title={isAdminRoute ? 'Pazarlama Paneline Dön' : 'Yönetici Konsoluna Git'}
            className="btn-ghost"
            style={{
              padding: '0.35rem 0.65rem',
              border: isAdminRoute ? '1px solid var(--brand-primary)' : '1px solid var(--border-default)',
              backgroundColor: isAdminRoute ? 'rgba(37, 99, 235, 0.1)' : 'var(--bg-surface-elevated)',
              color: isAdminRoute ? 'var(--brand-primary)' : 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Sliders size={13} />
            <span>{isAdminRoute ? 'Pazarlama' : 'Yönetim'}</span>
          </button>
        )}

        {/* User Avatar & Logout */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.25rem' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}>
              {user.name.substring(0, 2).toUpperCase()}
            </div>

            <button
              onClick={logout}
              title="Çıkış Yap"
              className="btn-ghost"
              style={{
                padding: '0.35rem 0.5rem',
                color: 'var(--text-muted)',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              <LogOut size={14} />
            </button>
          </div>
        )}

      </div>

    </header>
  );
};
