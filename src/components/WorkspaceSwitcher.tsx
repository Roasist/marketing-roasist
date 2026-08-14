import React, { useState, useRef, useEffect } from 'react';
import { Workspace } from '../types/workspace';
import { ChevronDown, Plus, Check, Settings, Building2 } from 'lucide-react';

interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (workspace: Workspace) => void;
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onOpenCreateModal,
  onOpenEditModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0] || {
    id: 'ws_default',
    name: 'Ana Çalışma Alanı',
    domain: 'roasist.com',
    industry: 'Genel',
    color: '#2563eb'
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredWorkspaces = workspaces.filter(w =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (w.domain && w.domain.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (w.industry && w.industry.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      
      {/* Switcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          backgroundColor: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.4rem 0.75rem',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          transition: 'all 0.15s ease',
          boxShadow: 'var(--shadow-sm)',
          maxWidth: '240px',
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-strong)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
      >
        {/* Favicon or Initial Icon */}
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '6px',
          backgroundColor: activeWorkspace.color ? `${activeWorkspace.color}20` : '#eff6ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${activeWorkspace.color || '#2563eb'}40`,
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          {activeWorkspace.domain ? (
            <img
              src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(activeWorkspace.domain)}&sz=64`}
              alt="favicon"
              style={{ width: '14px', height: '14px' }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: activeWorkspace.color || '#2563eb' }}>
              {activeWorkspace.name.substring(0, 1).toUpperCase()}
            </span>
          )}
        </div>

        {/* Name and Industry */}
        <div style={{ textAlign: 'left', minWidth: 0, flex: 1 }}>
          <div style={{
            fontSize: '0.825rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.2,
          }}>
            {activeWorkspace.name}
          </div>
          <div style={{
            fontSize: '0.68rem',
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {activeWorkspace.industry || 'Marka Alanı'}
          </div>
        </div>

        <ChevronDown size={14} color="var(--text-muted)" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          width: '290px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 9990,
          padding: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
          animation: 'fadeIn 0.12s ease-out',
        }}>
          
          {/* Header Label */}
          <div style={{
            padding: '0.35rem 0.5rem 0.2rem',
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span>Çalışma Alanları</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 500 }}>{workspaces.length} Marka</span>
          </div>

          {/* Search Input (if more than 3 workspaces) */}
          {workspaces.length > 3 && (
            <div style={{ padding: '0.2rem 0.4rem' }}>
              <input
                type="text"
                placeholder="Marka ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  fontSize: '0.75rem',
                  padding: '0.35rem 0.6rem',
                  borderRadius: 'var(--radius-xs)',
                }}
              />
            </div>
          )}

          {/* Workspace List */}
          <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {filteredWorkspaces.map((ws) => {
              const isSelected = ws.id === activeWorkspace.id;
              return (
                <div
                  key={ws.id}
                  onClick={() => {
                    onSelectWorkspace(ws.id);
                    setIsOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.65rem',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: isSelected ? 'var(--bg-surface-elevated)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.1s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', minWidth: 0 }}>
                    {/* Favicon or Initial */}
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '6px',
                      backgroundColor: ws.color ? `${ws.color}18` : '#eff6ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${ws.color || '#2563eb'}30`,
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}>
                      {ws.domain ? (
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(ws.domain)}&sz=64`}
                          alt="favicon"
                          style={{ width: '14px', height: '14px' }}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Building2 size={13} color={ws.color || '#2563eb'} />
                      )}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.8rem',
                        fontWeight: isSelected ? 600 : 500,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {ws.name}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        {ws.domain || ws.industry || 'Özel Marka'}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <Check size={14} color="var(--brand-primary)" style={{ flexShrink: 0, marginLeft: '0.5rem' }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons Divider */}
          <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '0.2rem 0' }} />

          {/* Edit Current Workspace Button */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenEditModal(activeWorkspace as Workspace);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.45rem 0.65rem',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <Settings size={13} />
            <span>Marka Ayarlarını Düzenle</span>
          </button>

          {/* Create New Workspace Button */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenCreateModal();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.45rem 0.65rem',
              fontSize: '0.78rem',
              color: 'var(--brand-primary)',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
              fontWeight: 500,
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Plus size={14} />
            <span>Yeni Çalışma Alanı Ekle</span>
          </button>

        </div>
      )}

    </div>
  );
};
