import React, { useState, useRef, useEffect } from 'react';
import { Workspace } from '../types/workspace';
import { ChevronDown, Plus, Check, Pencil, Trash2, Building2 } from 'lucide-react';

interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (workspace: Workspace) => void;
  onDeleteWorkspace?: (id: string) => Promise<void>;
  isCollapsed?: boolean;
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onOpenCreateModal,
  onOpenEditModal,
  onDeleteWorkspace,
  isCollapsed = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0] || {
    id: 'ws_default',
    name: 'Ana Marka',
    domain: 'roasist.com'
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
    (w.domain && w.domain.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (e: React.MouseEvent, ws: Workspace) => {
    e.stopPropagation();
    if (!onDeleteWorkspace) return;
    if (workspaces.length <= 1) {
      alert('Son kalan çalışma alanı silinemez.');
      return;
    }
    if (window.confirm(`"${ws.name}" çalışma alanını ve tüm rakip verilerini silmek istediğinize emin misiniz?`)) {
      await onDeleteWorkspace(ws.id);
    }
  };

  const handleEdit = (e: React.MouseEvent, ws: Workspace) => {
    e.stopPropagation();
    setIsOpen(false);
    onOpenEditModal(ws);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: isCollapsed ? 'auto' : '100%' }}>
      
      {/* Active Workspace Header Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={isCollapsed ? `${activeWorkspace.name} - Çalışma Alanı Değiştir` : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isCollapsed ? '0' : '0.6rem',
          backgroundColor: isOpen ? 'var(--bg-surface-elevated)' : 'transparent',
          border: '1px solid',
          borderColor: isOpen ? 'var(--border-strong)' : 'transparent',
          borderRadius: 'var(--radius-sm)',
          padding: isCollapsed ? '6px' : '0.4rem 0.5rem',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          transition: 'all 0.15s ease',
          width: '100%',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
            e.currentTarget.style.borderColor = 'var(--border-default)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }
        }}
      >
        {/* Brand Favicon or Initial */}
        <div style={{
          width: '26px',
          height: '26px',
          borderRadius: '6px',
          backgroundColor: 'rgba(37, 99, 235, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(37, 99, 235, 0.25)',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          {activeWorkspace.domain ? (
            <img
              src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(activeWorkspace.domain)}&sz=64`}
              alt="favicon"
              style={{ width: '16px', height: '16px' }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
              {activeWorkspace.name.substring(0, 1).toUpperCase()}
            </span>
          )}
        </div>

        {/* Brand Name & Domain (when expanded) */}
        {!isCollapsed && (
          <>
            <div style={{ textAlign: 'left', minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize: '0.85rem',
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
                {activeWorkspace.domain || 'Çalışma Alanı'}
              </div>
            </div>

            <ChevronDown size={14} color="var(--text-muted)" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease', flexShrink: 0 }} />
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: isCollapsed ? '0' : 'calc(100% + 6px)',
          left: isCollapsed ? 'calc(100% + 8px)' : 0,
          width: '280px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 9999,
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

          {/* Workspace List with Direct Edit & Delete Icons */}
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
                  className="workspace-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.6rem',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: isSelected ? 'var(--bg-surface-elevated)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.1s ease',
                    gap: '0.4rem',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', minWidth: 0, flex: 1 }}>
                    {/* Favicon or Initial */}
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(37, 99, 235, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(37, 99, 235, 0.2)',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}>
                      {ws.domain ? (
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(ws.domain)}&sz=64`}
                          alt="favicon"
                          style={{ width: '15px', height: '15px' }}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Building2 size={13} color="var(--brand-primary)" />
                      )}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
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
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ws.domain || 'Özel Alan'}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Edit & Delete Icons & Active Checkmark */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    
                    {/* Edit Icon Button */}
                    <button
                      type="button"
                      title="Çalışma Alanını Düzenle"
                      onClick={(e) => handleEdit(e, ws)}
                      style={{
                        padding: '4px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-app)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--text-muted)';
                      }}
                    >
                      <Pencil size={12} />
                    </button>

                    {/* Delete Icon Button (if more than 1 workspace) */}
                    {workspaces.length > 1 && onDeleteWorkspace && (
                      <button
                        type="button"
                        title="Çalışma Alanını Sil"
                        onClick={(e) => handleDelete(e, ws)}
                        style={{
                          padding: '4px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                          e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}

                    {isSelected && (
                      <Check size={14} color="var(--brand-primary)" style={{ marginLeft: '2px' }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons Divider */}
          <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '0.2rem 0' }} />

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
