import React from 'react';
import { FilterState } from '../types/ad';
import { Search, Flame, History, ArrowUpDown } from 'lucide-react';

interface AdFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  totalResultsCount: number;
}

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
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Reklam metni veya kancada ara..."
            value={filters.searchKeyword}
            onChange={(e) => onFilterChange({ searchKeyword: e.target.value })}
            style={{
              width: '100%',
              paddingLeft: '2.1rem',
            }}
          />
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
              color: filters.status === 'ACTIVE' ? 'var(--success)' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: filters.status === 'ACTIVE' ? 600 : 400,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
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
              gap: '0.3rem',
              boxShadow: filters.status === 'INACTIVE' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <History size={12} /> Geçmiş
          </button>
        </div>

        {/* Country Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <select
            value={filters.country || 'TR'}
            onChange={(e) => onFilterChange({ country: e.target.value })}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.65rem' }}
          >
            <option value="TR">🇹🇷 Türkiye (TR)</option>
            <option value="US">🇺🇸 ABD (US)</option>
            <option value="DE">🇩🇪 Almanya (DE)</option>
            <option value="GB">🇬🇧 İngiltere (GB)</option>
            <option value="AE">🇦🇪 BAE / Dubai (AE)</option>
            <option value="FR">🇫🇷 Fransa (FR)</option>
          </select>
        </div>

        {/* Format Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <select
            value={filters.format}
            onChange={(e) => onFilterChange({ format: e.target.value as any })}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.65rem' }}
          >
            <option value="ALL">Tüm Formatlar</option>
            <option value="VIDEO">Video Reklamlar</option>
            <option value="IMAGE">Görsel Reklamlar</option>
            <option value="CAROUSEL">Carousel Reklamlar</option>
          </select>
        </div>

        {/* Sort Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ArrowUpDown size={14} color="var(--text-muted)" />
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.65rem' }}
          >
            <option value="NEWEST">En Yeniler İlk</option>
            <option value="LONGEST_RUNNING">En Uzun Yayında Olanlar (Winner)</option>
          </select>
        </div>

        {/* Count Pill */}
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          <strong>{totalResultsCount}</strong> reklam listeleniyor
        </div>

      </div>
    </div>
  );
};
