import React from 'react';
import { MarketingRoute } from '../types/suite';
import { useAuth } from '../contexts/AuthContext';
import { Globe, ChevronRight, Sliders, LogOut } from 'lucide-react';

interface TopBarProps {
  currentRoute: MarketingRoute;
  onNavigate: (route: MarketingRoute) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ currentRoute, onNavigate }) => {
  const { user, logout, hasRole } = useAuth();

  const getRouteTitle = () => {
    switch (currentRoute) {
      case 'dashboard':
        return 'Genel Bakış & Metrikler';
      case 'competitors':
        return 'Rakip Reklam İstihbaratı (/competitors)';
      case 'ai-copywriter':
        return 'AI Reklam Metni & Kanca Üretici';
      case 'roas-optimizer':
        return 'ROAS & Bütçe Simülatörü';
      case 'admin':
        return 'Admin & Kullanıcı Yönetim Paneli (/admin)';
      default:
        return 'Marketing Suite';
    }
  };

  return (
    <header style={{
      height: '64px',
      borderBottom: '1px solid var(--border-glass)',
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      
      {/* Left: Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
        <span 
          onClick={() => onNavigate('dashboard')}
          style={{ color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500 }}
        >
          Roasist Suite
        </span>
        <ChevronRight size={14} color="var(--text-muted)" />
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          {getRouteTitle()}
        </span>
      </div>

      {/* Right: User & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        
        {/* Domain Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.75rem',
          padding: '0.35rem 0.75rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(6, 182, 212, 0.1)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          color: '#38bdf8',
        }}>
          <Globe size={13} />
          <span>marketing.roasist.com</span>
        </div>

        {/* User Info Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-glass)',
          padding: '0.3rem 0.75rem',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8rem',
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#34d399' }} />
          <span style={{ fontWeight: 600 }}>{user?.name || 'Kullanıcı'}</span>
          <span style={{ color: 'var(--accent-purple)', fontSize: '0.7rem' }}>({user?.role})</span>
        </div>

        {/* Admin Direct Button */}
        {hasRole(['SUPER_ADMIN', 'ADMIN']) && currentRoute !== 'admin' && (
          <button
            onClick={() => onNavigate('admin')}
            className="btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            <Sliders size={14} /> Admin Panel
          </button>
        )}

        {/* Logout Quick Button */}
        <button
          onClick={logout}
          title="Çıkış Yap"
          style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '8px',
            color: '#fb7185',
            cursor: 'pointer',
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          <LogOut size={14} /> Çıkış
        </button>

      </div>

    </header>
  );
};
