import React from 'react';
import { MarketingRoute } from '../types/suite';
import { ChevronRight, Sliders, Bell, Globe } from 'lucide-react';

interface TopBarProps {
  currentRoute: MarketingRoute;
  onNavigate: (route: MarketingRoute) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ currentRoute, onNavigate }) => {
  const getRouteTitle = () => {
    switch (currentRoute) {
      case 'dashboard': return 'Genel Bakış & Metrikler';
      case 'competitors': return 'Rakip Reklam İstihbaratı (/competitors)';
      case 'ai-copywriter': return 'AI Reklam Metni & Kanca Üretici';
      case 'roas-optimizer': return 'ROAS & Bütçe Simülatörü';
      case 'admin': return 'Admin Yönetim Paneli (/admin)';
      default: return 'Marketing Suite';
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
      
      {/* Breadcrumb Path */}
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

      {/* Right Utility Bar */}
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

        {/* Notifications Icon */}
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
        }}>
          <Bell size={16} color="var(--text-secondary)" />
          <span style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-purple)',
          }} />
        </div>

        {/* Admin Panel Quick Trigger Button */}
        {currentRoute !== 'admin' && (
          <button
            onClick={() => onNavigate('admin')}
            className="btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            <Sliders size={14} /> Admin Panel
          </button>
        )}

      </div>

    </header>
  );
};
