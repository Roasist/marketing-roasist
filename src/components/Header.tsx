import React from 'react';
import { Sparkles, BarChart2, ShieldCheck, Download, Settings, Flame, History, Cpu } from 'lucide-react';
import { MetaApiConfig } from '../types/ad';

interface HeaderProps {
  activeTab: 'feed' | 'timeline' | 'analytics' | 'ai-strategy' | 'settings';
  setActiveTab: (tab: 'feed' | 'timeline' | 'analytics' | 'ai-strategy' | 'settings') => void;
  metaConfig: MetaApiConfig;
  onExportCsv: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  metaConfig,
  onExportCsv,
}) => {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-glass)',
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0.85rem 1.5rem',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('feed')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.4)',
          }}>
            <Sparkles size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }} className="gradient-text">
                AdPulse AI
              </h1>
              <span className="badge badge-active" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                MVP v1.0
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Rakip Meta Reklam Kütüphanesi & İstihbarat Paneli
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button
            onClick={() => setActiveTab('feed')}
            className={activeTab === 'feed' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
          >
            <Flame size={16} /> Reklam Akışı
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={activeTab === 'timeline' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
          >
            <History size={16} /> Geçmiş Analizi
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
          >
            <BarChart2 size={16} /> Metrikler
          </button>

          <button
            onClick={() => setActiveTab('ai-strategy')}
            className={activeTab === 'ai-strategy' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', position: 'relative' }}
          >
            <Cpu size={16} /> AI Strateji
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-purple)',
              boxShadow: '0 0 8px var(--accent-purple)'
            }} />
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={activeTab === 'settings' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
          >
            <Settings size={16} /> Meta API & Sunucu
          </button>
        </nav>

        {/* Quick Action Buttons & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: metaConfig.accessToken ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            border: `1px solid ${metaConfig.accessToken ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            fontSize: '0.75rem',
            color: metaConfig.accessToken ? '#34d399' : '#fbbf24',
          }}>
            <ShieldCheck size={14} />
            <span>{metaConfig.accessToken ? 'Meta API Aktif' : 'Sandbox Test Modu'}</span>
          </div>

          <button
            onClick={onExportCsv}
            className="btn-secondary"
            title="Tüm reklam verilerini CSV olarak indir"
            style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem' }}
          >
            <Download size={15} /> CSV Aktar
          </button>
        </div>

      </div>
    </header>
  );
};
