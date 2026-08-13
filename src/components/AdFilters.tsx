import React from 'react';
import { FilterState } from '../types/ad';
import { Search, Flame, History, Film, Image as ImageIcon, Layers, ArrowUpDown, Filter } from 'lucide-react';

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
    <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>

        {/* Search Bar */}
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '220px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Reklam metni veya başlıkta ara..."
            value={filters.searchKeyword}
            onChange={(e) => onFilterChange({ searchKeyword: e.target.value })}
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.3rem',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Status Filter Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(0, 0, 0, 0.3)', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
          <button
            onClick={() => onFilterChange({ status: 'ALL' })}
            style={{
              padding: '0.4rem 0.75rem',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: filters.status === 'ALL' ? 'var(--accent-purple)' : 'transparent',
              color: filters.status === 'ALL' ? 'white' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Tümü
          </button>
          <button
            onClick={() => onFilterChange({ status: 'ACTIVE' })}
            style={{
              padding: '0.4rem 0.75rem',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: filters.status === 'ACTIVE' ? 'var(--accent-emerald)' : 'transparent',
              color: filters.status === 'ACTIVE' ? 'white' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <Flame size={14} /> Aktif Reklamlar
          </button>
          <button
            onClick={() => onFilterChange({ status: 'INACTIVE' })}
            style={{
              padding: '0.4rem 0.75rem',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: filters.status === 'INACTIVE' ? 'var(--accent-indigo)' : 'transparent',
              color: filters.status === 'INACTIVE' ? 'white' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <History size={14} /> Geçmiş Reklamlar
          </button>
        </div>

        {/* Format Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Filter size={15} color="var(--text-muted)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginRight: '4px' }}>Format:</span>
          
          {(['ALL', 'IMAGE', 'VIDEO', 'CAROUSEL'] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => onFilterChange({ format: fmt })}
              className={filters.format === fmt ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
            >
              {fmt === 'ALL' && 'Tümü'}
              {fmt === 'IMAGE' && <><ImageIcon size={13} /> Görsel</>}
              {fmt === 'VIDEO' && <><Film size={13} /> Video</>}
              {fmt === 'CAROUSEL' && <><Layers size={13} /> Carousel</>}
            </button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowUpDown size={15} color="var(--text-muted)" />
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              padding: '0.45rem 0.75rem',
              fontSize: '0.8rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="NEWEST">📅 En Yeni Eklenenler</option>
            <option value="LONGEST_RUNNING">🔥 En Uzun Süre Yayında Kalanlar (Kazananlar)</option>
          </select>
        </div>

        {/* Results Counter */}
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {totalResultsCount} Reklam Bulundu
        </div>

      </div>
    </div>
  );
};
