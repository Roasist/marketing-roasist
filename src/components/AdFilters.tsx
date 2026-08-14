import React from 'react';
import { FilterState } from '../types/ad';
import { Search, Flame, History, ArrowUpDown, Layers } from 'lucide-react';

interface AdFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  totalResultsCount: number;
}

// Meta Brand SVG Icon
const MetaIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <path d="M12 7.5C9.7 3.5 5.5 2 2.5 4.5C-0.5 7 -0.5 13 2.5 16.5C5.5 20 9.2 16.5 12 12.5C14.8 16.5 18.5 20 21.5 16.5C24.5 13 24.5 7 21.5 4.5C18.5 2 14.3 3.5 12 7.5Z" fill="#0081FB" />
  </svg>
);

// Google Brand "G" 4-color SVG Icon
const GoogleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

export const AdFilters: React.FC<AdFiltersProps> = ({
  filters,
  onFilterChange,
  totalResultsCount,
}) => {
  return (
    <div className="card" style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>

        {/* Search Bar */}
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: '180px' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Reklam metni, marka veya kreatif ID ara..."
            value={filters.searchKeyword}
            onChange={(e) => onFilterChange({ searchKeyword: e.target.value })}
            style={{
              width: '100%',
              paddingLeft: '2.1rem',
            }}
          />
        </div>

        {/* Network / Channel Filter Toggle with Brand Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', backgroundColor: 'var(--bg-surface-elevated)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
          <button
            onClick={() => onFilterChange({ network: 'ALL' })}
            style={{
              padding: '0.35rem 0.65rem',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: filters.network === 'ALL' ? 'var(--bg-surface)' : 'transparent',
              color: filters.network === 'ALL' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: filters.network === 'ALL' ? 600 : 400,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: filters.network === 'ALL' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <Layers size={13} color={filters.network === 'ALL' ? 'var(--brand-primary)' : 'var(--text-muted)'} />
            <span>Tümü</span>
          </button>
          
          <button
            onClick={() => onFilterChange({ network: 'META' })}
            style={{
              padding: '0.35rem 0.65rem',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: filters.network === 'META' ? 'var(--bg-surface)' : 'transparent',
              color: filters.network === 'META' ? '#0081FB' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: filters.network === 'META' ? 600 : 400,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: filters.network === 'META' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <MetaIcon />
            <span>Meta</span>
          </button>

          <button
            onClick={() => onFilterChange({ network: 'GOOGLE' })}
            style={{
              padding: '0.35rem 0.65rem',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: filters.network === 'GOOGLE' ? 'var(--bg-surface)' : 'transparent',
              color: filters.network === 'GOOGLE' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: filters.network === 'GOOGLE' ? 600 : 400,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: filters.network === 'GOOGLE' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <GoogleIcon />
            <span>Google</span>
          </button>
        </div>

        {/* Status Filter Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', backgroundColor: 'var(--bg-surface-elevated)', padding: '2px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
          <button
            onClick={() => onFilterChange({ status: 'ALL' })}
            style={{
              padding: '0.35rem 0.65rem',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: filters.status === 'ALL' ? 'var(--bg-surface)' : 'transparent',
              color: filters.status === 'ALL' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: filters.status === 'ALL' ? 600 : 400,
              cursor: 'pointer',
              boxShadow: filters.status === 'ALL' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            Tümü
          </button>
          <button
            onClick={() => onFilterChange({ status: 'ACTIVE' })}
            style={{
              padding: '0.35rem 0.65rem',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: filters.status === 'ACTIVE' ? 'var(--bg-surface)' : 'transparent',
              color: filters.status === 'ACTIVE' ? 'var(--success-text)' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: filters.status === 'ACTIVE' ? 600 : 400,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: filters.status === 'ACTIVE' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <Flame size={12} /> Aktif
          </button>
          <button
            onClick={() => onFilterChange({ status: 'INACTIVE' })}
            style={{
              padding: '0.35rem 0.65rem',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: filters.status === 'INACTIVE' ? 'var(--bg-surface)' : 'transparent',
              color: filters.status === 'INACTIVE' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: filters.status === 'INACTIVE' ? 600 : 400,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: filters.status === 'INACTIVE' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <History size={12} /> Geçmiş
          </button>
        </div>

        {/* Country Filter Selector */}
        <select
          value={filters.country || 'TR'}
          onChange={(e) => onFilterChange({ country: e.target.value })}
          style={{ fontSize: '0.78rem', padding: '0.4rem 0.65rem', minWidth: '120px' }}
        >
          <option value="TR">🇹🇷 Türkiye (TR)</option>
          <option value="ALL">🌐 Tüm Ülkeler (Global)</option>
          <option value="DE">🇩🇪 Almanya (DE)</option>
          <option value="US">🇺🇸 ABD (US)</option>
          <option value="GB">🇬🇧 Birleşik Krallık (GB)</option>
          <option value="AE">🇦🇪 BAE / Dubai (AE)</option>
          <option value="FR">🇫🇷 Fransa (FR)</option>
        </select>

        {/* Format Selector */}
        <select
          value={filters.format}
          onChange={(e) => onFilterChange({ format: e.target.value as any })}
          style={{ fontSize: '0.78rem', padding: '0.4rem 0.65rem' }}
        >
          <option value="ALL">Tüm Formatlar</option>
          <option value="SEARCH">Arama (Search)</option>
          <option value="IMAGE">Görsel / Display</option>
          <option value="VIDEO">Video</option>
          <option value="CAROUSEL">Carousel</option>
        </select>

        {/* Results Count Tag */}
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          <strong>{totalResultsCount}</strong> reklam listeleniyor
        </div>

      </div>

      {/* Sorting Row */}
      <div style={{
        marginTop: '0.65rem',
        paddingTop: '0.65rem',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ArrowUpDown size={12} />
          <span>Sıralama:</span>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'transparent', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)' }}
          >
            <option value="NEWEST">⚡ Akıllı Sıralama (Aktifler & En Günceller Önce)</option>
            <option value="LONGEST_RUNNING">⏱️ En Uzun Süre Yayında Kalanlar</option>
          </select>
        </div>

        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          * Aktif reklamlar en başta, son görülme tarihine göre sıralanır.
        </span>
      </div>

    </div>
  );
};
