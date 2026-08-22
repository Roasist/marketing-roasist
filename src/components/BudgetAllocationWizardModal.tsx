import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  PieChart, 
  CheckCircle2, 
  AlertCircle, 
  Scale, 
  Globe, 
  Layers
} from 'lucide-react';
import { SubCampaignItem } from '../types/forecast';
import { GOOGLE_ADS_LANGUAGES } from '../pages/ForecastModule';

interface BudgetAllocationWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  masterMonthlyBudget: number;
  onApplyAllocation: (newMasterBudget: number, updatedSubCampaigns: SubCampaignItem[]) => void;
  subCampaigns: SubCampaignItem[];
}

export const BudgetAllocationWizardModal: React.FC<BudgetAllocationWizardModalProps> = ({
  isOpen,
  onClose,
  masterMonthlyBudget: initialMasterBudget,
  onApplyAllocation,
  subCampaigns
}) => {
  if (!isOpen) return null;

  // Level 0: Master Monthly Budget
  const [masterBudget, setMasterBudget] = useState<number>(initialMasterBudget || 100000);
  const dailyBudget = useMemo(() => Math.round((masterBudget || 0) / 30.4), [masterBudget]);

  // Working copy of sub-campaigns to adjust in modal before applying
  const [draftSubCampaigns, setDraftSubCampaigns] = useState<SubCampaignItem[]>(() => {
    return subCampaigns.map(c => ({ ...c }));
  });

  // Group sub-campaigns by language
  const languageGroups = useMemo(() => {
    const map = new Map<string, { code: string; name: string; flag: string; items: SubCampaignItem[] }>();
    
    draftSubCampaigns.forEach(sc => {
      const code = sc.languageCode || 'tr';
      if (!map.has(code)) {
        const langObj = GOOGLE_ADS_LANGUAGES.find(l => l.code === code) || {
          code,
          name: sc.languageName || 'Türkçe',
          flag: sc.languageFlag || '🇹🇷'
        };
        map.set(code, {
          code,
          name: langObj.name,
          flag: langObj.flag,
          items: []
        });
      }
      map.get(code)!.items.push(sc);
    });

    return Array.from(map.values());
  }, [draftSubCampaigns]);

  // Language Tier Allocations State: { [langCode]: { percentage: number, budget: number } }
  const [langAllocations, setLangAllocations] = useState<Record<string, { percentage: number; budget: number }>>({});

  // Initialize Language Allocations on load or master budget change
  useEffect(() => {
    if (languageGroups.length === 0) return;

    // Calculate sum of sub-campaign budgets per language
    const currentLangSums: Record<string, number> = {};
    let totalSum = 0;
    languageGroups.forEach(grp => {
      const sum = grp.items.reduce((s, item) => s + (item.monthlyBudget || 0), 0);
      currentLangSums[grp.code] = sum;
      totalSum += sum;
    });

    const activeMaster = masterBudget > 0 ? masterBudget : (totalSum > 0 ? totalSum : 100000);

    const initialAlloc: Record<string, { percentage: number; budget: number }> = {};
    languageGroups.forEach(grp => {
      const currentSum = currentLangSums[grp.code] || 0;
      let pct = totalSum > 0 ? Math.round((currentSum / totalSum) * 100) : Math.round(100 / languageGroups.length);
      if (isNaN(pct)) pct = 0;
      const bgt = Math.round((activeMaster * pct) / 100);
      initialAlloc[grp.code] = { percentage: pct, budget: bgt };
    });

    setLangAllocations(initialAlloc);
  }, [languageGroups.length]);

  // Total allocated percentage across languages
  const totalLangPercentage = useMemo(() => {
    return Object.values(langAllocations).reduce((sum, item) => sum + (item?.percentage || 0), 0);
  }, [langAllocations]);

  // Total allocated budget across languages
  const totalLangBudget = useMemo(() => {
    return Object.values(langAllocations).reduce((sum, item) => sum + (item?.budget || 0), 0);
  }, [langAllocations]);

  // Unallocated language budget
  const unallocatedLangBudget = useMemo(() => {
    return masterBudget - totalLangBudget;
  }, [masterBudget, totalLangBudget]);

  // Update Master Budget and scale all allocations proportionately
  const handleMasterBudgetChange = (newVal: number) => {
    const val = Math.max(0, newVal);
    setMasterBudget(val);
    setLangAllocations(prev => {
      const updated: Record<string, { percentage: number; budget: number }> = {};
      Object.keys(prev).forEach(code => {
        const pct = prev[code].percentage;
        updated[code] = {
          percentage: pct,
          budget: Math.round((val * pct) / 100)
        };
      });
      return updated;
    });
  };

  // Update Language Percentage (% -> ₺)
  const handleLangPercentageChange = (code: string, newPct: number) => {
    const pct = Math.min(100, Math.max(0, newPct));
    const newBgt = Math.round((masterBudget * pct) / 100);
    setLangAllocations(prev => ({
      ...prev,
      [code]: { percentage: pct, budget: newBgt }
    }));
  };

  // Update Language Budget Amount (₺ -> %)
  const handleLangBudgetChange = (code: string, newAmount: number) => {
    const bgt = Math.max(0, newAmount);
    const newPct = masterBudget > 0 ? Number(((bgt / masterBudget) * 100).toFixed(1)) : 0;
    setLangAllocations(prev => ({
      ...prev,
      [code]: { percentage: newPct, budget: bgt }
    }));
  };

  // Distribute Language Budget Equally
  const handleDistributeLanguagesEqually = () => {
    if (languageGroups.length === 0) return;
    const equalPct = Number((100 / languageGroups.length).toFixed(1));
    const equalBgt = Math.round(masterBudget / languageGroups.length);

    const updated: Record<string, { percentage: number; budget: number }> = {};
    languageGroups.forEach((grp, idx) => {
      if (idx === languageGroups.length - 1) {
        const usedPct = (languageGroups.length - 1) * equalPct;
        const remPct = Number((100 - usedPct).toFixed(1));
        const remBgt = masterBudget - ((languageGroups.length - 1) * equalBgt);
        updated[grp.code] = { percentage: remPct, budget: remBgt };
      } else {
        updated[grp.code] = { percentage: equalPct, budget: equalBgt };
      }
    });
    setLangAllocations(updated);
  };

  // Auto-fill unallocated language budget remainder into last or selected language
  const handleAutoFillLangRemainder = () => {
    if (languageGroups.length === 0) return;
    const codes = Object.keys(langAllocations);
    if (codes.length === 0) return;
    const lastCode = codes[codes.length - 1];
    const curPctSumWithoutLast = codes.filter(c => c !== lastCode).reduce((s, c) => s + (langAllocations[c]?.percentage || 0), 0);
    const remPct = Number(Math.max(0, 100 - curPctSumWithoutLast).toFixed(1));
    const remBgt = Math.round((masterBudget * remPct) / 100);

    setLangAllocations(prev => ({
      ...prev,
      [lastCode]: { percentage: remPct, budget: remBgt }
    }));
  };

  // Update Sub-Campaign Monthly Budget directly in draft
  const handleSubCampaignBudgetChange = (subId: string, newBudget: number) => {
    const val = Math.max(0, newBudget);
    setDraftSubCampaigns(prev => prev.map(sc => sc.id === subId ? { ...sc, monthlyBudget: val } : sc));
  };

  // Distribute Sub-Campaigns Equally under a Language Group
  const handleDistributeSubCampaignsEqually = (langCode: string) => {
    const grp = languageGroups.find(g => g.code === langCode);
    if (!grp || grp.items.length === 0) return;
    const langBudget = langAllocations[langCode]?.budget || 0;
    const equalSubBudget = Math.round(langBudget / grp.items.length);

    setDraftSubCampaigns(prev => prev.map(sc => {
      if ((sc.languageCode || 'tr') === langCode) {
        return { ...sc, monthlyBudget: equalSubBudget };
      }
      return sc;
    }));
  };

  // Apply Changes and Save
  const handleApply = () => {
    const finalSubCampaigns = draftSubCampaigns.map(sc => {
      const code = sc.languageCode || 'tr';
      const grp = languageGroups.find(g => g.code === code);
      if (!grp || grp.items.length === 0) return sc;

      const langBudget = langAllocations[code]?.budget || 0;
      const grpTotalBgt = grp.items.reduce((s, item) => s + (item.monthlyBudget || 0), 0);
      let calcSubBudget = sc.monthlyBudget;

      if (grpTotalBgt > 0) {
        const ratio = sc.monthlyBudget / grpTotalBgt;
        calcSubBudget = Math.round(langBudget * ratio);
      } else {
        calcSubBudget = Math.round(langBudget / grp.items.length);
      }

      return {
        ...sc,
        monthlyBudget: calcSubBudget
      };
    });

    onApplyAllocation(masterBudget, finalSubCampaigns);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(5px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.25rem'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '820px',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        backgroundColor: 'var(--bg-surface)',
        border: '1.5px solid var(--brand-primary)',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.45)'
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '10px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.12)', color: 'var(--brand-primary)' }}>
              <PieChart size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Hiyerarşik Çatı Bütçe Dağıtım Stüdyosu</span>
                <span className="badge badge-active" style={{ fontSize: '0.72rem' }}>
                  Top-Down Orchestrator
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Çatı kampanya bütçesini diller ve alt kampanyalar arasında çift yönlü senkronize olarak dağıtın.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: '6px', borderRadius: '50%', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Level 0: Master Monthly & Daily Budget Input */}
        <div style={{ padding: '1.1rem 1.25rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>👑 Çatı Kampanya Toplam Aylık Bütçesi:</span>
            </label>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Günlük ortalama: <strong style={{ color: 'var(--brand-primary)' }}>₺{dailyBudget.toLocaleString('tr-TR')}/gün</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brand-primary)' }}>₺</span>
            <input
              type="number"
              min={0}
              step={1000}
              value={masterBudget || ''}
              onChange={(e) => handleMasterBudgetChange(parseFloat(e.target.value) || 0)}
              style={{
                width: '180px',
                padding: '0.55rem 0.85rem',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--brand-primary)',
                backgroundColor: 'var(--bg-surface)',
                border: '1.5px solid var(--brand-primary)',
                borderRadius: 'var(--radius-xs)',
                textAlign: 'right'
              }}
            />
          </div>
        </div>

        {/* Level 1: Language Breakdown Tier */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Globe size={16} color="var(--brand-primary)" />
              <span>1. Seviye: Dil Bazlı Bütçe Dağılımı ({languageGroups.length} Hedef Dil)</span>
            </div>

            <button
              type="button"
              onClick={handleDistributeLanguagesEqually}
              className="btn-ghost"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', color: 'var(--brand-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Scale size={13} />
              <span>⚡ Dilleri Eşit Dağıt</span>
            </button>
          </div>

          {/* Languages Table / Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {languageGroups.map(grp => {
              const alloc = langAllocations[grp.code] || { percentage: 0, budget: 0 };
              const langDaily = Math.round(alloc.budget / 30.4);

              return (
                <div key={grp.code} style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>
                  
                  {/* Lang Name & Flag */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: '180px' }}>
                    <span style={{ fontSize: '1.4rem' }}>{grp.flag}</span>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {grp.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {grp.items.length} Alt Kampanya
                      </div>
                    </div>
                  </div>

                  {/* Percentage Slider & Input */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '220px', maxWidth: '380px' }}>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={alloc.percentage}
                      onChange={(e) => handleLangPercentageChange(grp.code, parseFloat(e.target.value) || 0)}
                      style={{ flex: 1, accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        value={alloc.percentage}
                        onChange={(e) => handleLangPercentageChange(grp.code, parseFloat(e.target.value) || 0)}
                        style={{ width: '55px', padding: '0.3rem 0.45rem', fontSize: '0.85rem', fontWeight: 700, textAlign: 'right', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}
                      />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>%</span>
                    </div>
                  </div>

                  {/* Budget Amount Input & Daily */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        ₺{langDaily.toLocaleString('tr-TR')}/gün
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-primary)' }}>₺</span>
                        <input
                          type="number"
                          min={0}
                          step={500}
                          value={alloc.budget || ''}
                          onChange={(e) => handleLangBudgetChange(grp.code, parseFloat(e.target.value) || 0)}
                          style={{ width: '110px', padding: '0.35rem 0.55rem', fontSize: '0.88rem', fontWeight: 700, textAlign: 'right', color: 'var(--brand-primary)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--brand-primary)', backgroundColor: 'var(--bg-surface)' }}
                        />
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Language Unallocated / Over-allocated Guard Bar */}
          <div style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-xs)', backgroundColor: totalLangPercentage === 100 ? 'rgba(16, 185, 129, 0.1)' : (totalLangPercentage > 100 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)'), border: `1px solid ${totalLangPercentage === 100 ? '#10b981' : (totalLangPercentage > 100 ? '#ef4444' : '#f59e0b')}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 600, color: totalLangPercentage === 100 ? '#10b981' : (totalLangPercentage > 100 ? '#ef4444' : '#b45309') }}>
              {totalLangPercentage === 100 ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              <span>
                {totalLangPercentage === 100 && '✓ Çatı bütçe diller arasında %100 oranında tam dağıtıldı.'}
                {totalLangPercentage > 100 && `⚠️ Bütçe aşımı! Diller toplamı %${totalLangPercentage} (₺${totalLangBudget.toLocaleString('tr-TR')}) yapıyor.`}
                {totalLangPercentage < 100 && `⚠️ Boşta kalan bütçe: ₺${unallocatedLangBudget.toLocaleString('tr-TR')} (%${(100 - totalLangPercentage).toFixed(1)})`}
              </span>
            </div>

            {totalLangPercentage !== 100 && (
              <button
                type="button"
                onClick={handleAutoFillLangRemainder}
                className="btn-ghost"
                style={{ fontSize: '0.72rem', padding: '2px 8px', fontWeight: 700, color: totalLangPercentage > 100 ? '#ef4444' : '#b45309', border: '1px solid currentColor', borderRadius: 'var(--radius-xs)' }}
              >
                Kalanı Son Dile Ekle (%100 Tamamla)
              </button>
            )}
          </div>
        </div>

        {/* Level 2: Sub-Campaigns Breakdown Tier per Language */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Layers size={16} color="var(--brand-primary)" />
            <span>2. Seviye: Diller Altındaki Kampanya Amacı / Kanal Dağılımı</span>
          </div>

          {languageGroups.map(grp => {
            const langBudget = langAllocations[grp.code]?.budget || 0;

            return (
              <div key={grp.code} className="card" style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    <span>{grp.flag} {grp.name} Bütçesi:</span>
                    <strong style={{ color: 'var(--brand-primary)' }}>₺{langBudget.toLocaleString('tr-TR')}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDistributeSubCampaignsEqually(grp.code)}
                    className="btn-ghost"
                    style={{ fontSize: '0.72rem', padding: '2px 6px', color: 'var(--brand-primary)', fontWeight: 600 }}
                  >
                    ⚡ Kanallara Eşit Böl
                  </button>
                </div>

                {/* Sub-Campaign items list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {grp.items.map(sc => {
                    const subPct = langBudget > 0 ? Math.round(((sc.monthlyBudget || 0) / langBudget) * 100) : 0;
                    const subDaily = Math.round((sc.monthlyBudget || 0) / 30.4);

                    return (
                      <div key={sc.id} style={{ padding: '0.6rem 0.75rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.65rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flex: 1, minWidth: '160px' }}>
                          <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>
                            {sc.platform}
                          </span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {sc.name}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                            %{subPct}
                          </span>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              ₺{subDaily.toLocaleString('tr-TR')}/gün
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-primary)' }}>₺</span>
                              <input
                                type="number"
                                min={0}
                                step={500}
                                value={sc.monthlyBudget || ''}
                                onChange={(e) => handleSubCampaignBudgetChange(sc.id, parseFloat(e.target.value) || 0)}
                                style={{ width: '95px', padding: '0.25rem 0.45rem', fontSize: '0.82rem', fontWeight: 700, textAlign: 'right', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-default)', paddingTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            💡 <em>Uygula butonuna bastığınızda tüm alt kampanyaların simülasyonları bu bütçelerle anında güncellenir.</em>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.55rem 1.15rem' }}
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="btn-primary"
              style={{ fontSize: '0.85rem', padding: '0.55rem 1.45rem', display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 600 }}
            >
              <CheckCircle2 size={16} />
              <span>Hiyerarşik Dağılımı Uygula & Senkronize Et</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
