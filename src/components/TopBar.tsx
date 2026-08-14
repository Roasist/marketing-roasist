import React from 'react';
import { MarketingRoute } from '../types/suite';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ChevronRight, Sliders, LogOut, Sun, Moon } from 'lucide-react';

interface TopBarProps {
  currentRoute: MarketingRoute;
  onNavigate: (route: MarketingRoute) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ currentRoute, onNavigate }) => {
  const { user, logout, hasRole } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
        return 'Kullanıcı & Sistem Paneli';
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
      
      {/* Left: Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}>
        <span 
          onClick={() => onNavigate('dashboard')}
          style={{ color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 400 }}
        >
          Roasist OS
        </span>
        <ChevronRight size={13} color="var(--text-muted)" />
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {getRouteTitle()}
        </span>
      </div>

      {/* Right: Actions, Theme Switcher & User */}
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

        {/* Theme Toggle Button (Light / Dark) */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Açık Moda Geç' : 'Karanlık Moda Geç'}
          className="btn-ghost"
          style={{
            padding: '0.35rem 0.55rem',
            border: '1px solid var(--border-default)',
            backgroundColor: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
          }}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={14} color="#f59e0b" />
              <span>Açık Mod</span>
            </>
          ) : (
            <>
              <Moon size={14} color="var(--text-secondary)" />
              <span>Karanlık Mod</span>
            </>
          )}
        </button>

        {/* Admin Quick Button */}
        {hasRole(['SUPER_ADMIN', 'ADMIN']) && currentRoute !== 'admin' && (
          <button
            onClick={() => onNavigate('admin')}
            className="btn-secondary"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
          >
            <Sliders size={13} /> Admin
          </button>
        )}

        {/* User Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
        }}>
          <span>{user?.name}</span>
        </div>

        {/* Quick Logout */}
        <button
          onClick={logout}
          title="Çıkış"
          className="btn-ghost"
          style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
        >
          <LogOut size={13} />
        </button>

      </div>

    </header>
  );
};
