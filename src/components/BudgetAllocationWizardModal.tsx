import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  PieChart, 
  CheckCircle2, 
  AlertCircle, 
  Scale, 
  Globe, 
  Layers,
  Sparkles,
  Plus,
  Trash2
} from 'lucide-react';
import { SubCampaignItem, CampaignPlatform, CampaignObjective } from '../types/forecast';
import { GOOGLE_ADS_LANGUAGES, DEFAULT_LOCATIONS } from '../pages/ForecastModule';

interface BudgetAllocationWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  masterMonthlyBudget: number;
  onApplyAllocation: (newMasterBudget: number, updatedSubCampaigns: SubCampaignItem[]) => void;
  subCampaigns: SubCampaignItem[];
  onOpenLanguageModal?: () => void;
  onOpenAddSubCampaignModal?: (langCode?: string) => void;
}

const POPULAR_DRAFT_LANGUAGES = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'İngilizce', flag: '🇬🇧' },
  { code: 'de', name: 'Almanca', flag: '🇩🇪' },
  { code: 'ru', name: 'Rusça', flag: '🇷🇺' },
  { code: 'ar', name: 'Arapça', flag: '🇸🇦' },
  { code: 'fr', name: 'Fransızca', flag: '🇫🇷' },
  { code: 'es', name: 'İspanyolca', flag: '🇪🇸' },
];

const POPULAR_DRAFT_MODELS = [
  { id: 'GOOGLE_SEARCH', label: '🔍 Google Search (Arama Ağı)', platform: 'GOOGLE' as CampaignPlatform, objective: 'GOOGLE_SEARCH' as CampaignObjective },
  { id: 'META_LEADS', label: '📱 Meta Leads (Potansiyel Müşteriler)', platform: 'META' as CampaignPlatform, objective: 'META_LEADS' as CampaignObjective },
  { id: 'META_SALES', label: '🛒 Meta Sales (E-Ticaret Satışları)', platform: 'META' as CampaignPlatform, objective: 'META_SALES' as CampaignObjective },
  { id: 'GOOGLE_PMAX', label: '⚡ Google Performance Max (PMax)', platform: 'GOOGLE' as CampaignPlatform, objective: 'GOOGLE_PMAX' as CampaignObjective },
  { id: 'GOOGLE_YOUTUBE', label: '🎬 YouTube Video Actions', platform: 'YOUTUBE' as CampaignPlatform, objective: 'GOOGLE_YOUTUBE' as CampaignObjective },
  { id: 'TIKTOK_LEADS', label: '🎯 TikTok Lead Generation', platform: 'TIKTOK' as CampaignPlatform, objective: 'TIKTOK_LEADS' as CampaignObjective }
];

export const BudgetAllocationWizardModal: React.FC<BudgetAllocationWizardModalProps> = ({
  isOpen,
  onClose,
  masterMonthlyBudget: initialMasterBudget,
  onApplyAllocation,
  subCampaigns,
  onOpenLanguageModal,
  onOpenAddSubCampaignModal
}) => {
  if (!isOpen) return null;

  // Level 0: Master Monthly Budget
  const [masterBudget, setMasterBudget] = useState<number>(initialMasterBudget || 100000);
  const dailyBudget = useMemo(() => Math.round((masterBudget || 0) / 30.4), [masterBudget]);

  // Working copy of sub-campaigns to adjust in modal before applying
  const [draftSubCampaigns, setDraftSubCampaigns] = useState<SubCampaignItem[]>(() => {
    return subCampaigns.map(c => ({ ...c }));
  });

  // Rapid Draft Generator State
  const [selectedDraftLangCodes, setSelectedDraftLangCodes] = useState<string[]>(['tr', 'en']);
  const [selectedDraftModelIds, setSelectedDraftModelIds] = useState<string[]>(['GOOGLE_SEARCH', 'META_LEADS']);
  const [showDraftGenerator, setShowDraftGenerator] = useState<boolean>(() => subCampaigns.length === 0);

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

  // Initialize Language Allocations on load or when language groups change
  useEffect(() => {
    if (languageGroups.length === 0) {
      setLangAllocations({});
      return;
    }

    const currentLangSums: Record<string, number> = {};
    let totalSum = 0;
    languageGroups.forEach(grp => {
      const sum = grp.items.reduce((s, item) => s + (item.monthlyBudget || 0), 0);
      currentLangSums[grp.code] = sum;
      totalSum += sum;
    });

    const activeMaster = masterBudget > 0 ? masterBudget : (totalSum > 0 ? totalSum : 100000);

    const initialAlloc: Record<string, { percentage: number; budget: number }> = {};
    languageGroups.forEach((grp, idx) => {
      const currentSum = currentLangSums[grp.code] || 0;
      let pct = totalSum > 0 ? Math.round((currentSum / totalSum) * 100) : Math.round(100 / languageGroups.length);
      if (isNaN(pct)) pct = 0;

      // Adjust last item to reach exactly 100%
      if (idx === languageGroups.length - 1 && totalSum <= 0) {
        const previousPctsSum = (languageGroups.length - 1) * Math.round(100 / languageGroups.length);
        pct = Math.max(0, 100 - previousPctsSum);
      }

      const bgt = Math.round((activeMaster * pct) / 100);
      initialAlloc[grp.code] = { percentage: pct, budget: bgt };
    });

    setLangAllocations(initialAlloc);
  }, [languageGroups.length, draftSubCampaigns.length]);

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

  // Rapid Draft Generation Action
  const handleGenerateDraftSubCampaigns = () => {
    if (selectedDraftLangCodes.length === 0 || selectedDraftModelIds.length === 0) return;

    const totalNewCampaignsCount = selectedDraftLangCodes.length * selectedDraftModelIds.length;
    const perCampaignBudget = Math.round(masterBudget / totalNewCampaignsCount);

    const generated: SubCampaignItem[] = [];
    let counter = 1;

    selectedDraftLangCodes.forEach(lCode => {
      const langObj = GOOGLE_ADS_LANGUAGES.find(l => l.code === lCode) || { code: lCode, name: lCode, flag: '🌐' };

      selectedDraftModelIds.forEach(mId => {
        const modelObj = POPULAR_DRAFT_MODELS.find(m => m.id === mId) || POPULAR_DRAFT_MODELS[0];
        const newId = `sub_${Date.now()}_${counter++}`;

        generated.push({
          id: newId,
          name: `${langObj.name} - ${modelObj.label.replace(/^[^\s]+\s/, '')}`,
          platform: modelObj.platform,
          objective: modelObj.objective,
          languageCode: langObj.code,
          languageName: langObj.name,
          languageFlag: langObj.flag,
          targetLocations: DEFAULT_LOCATIONS,
          monthlyBudget: perCampaignBudget,
          selectedKeywords: [],
          discoveredKeywords: [],
          negativeCategories: [],
          businessModel: modelObj.objective.includes('SALES') ? 'ECOMMERCE' : 'LEAD_GEN',
          parameters: {
            targetImpressionShare: 70,
            expectedCtr: 7.5,
            searchLeadCr: 3.5,
            searchHealthyLeadRate: 40,
            searchCloseRate: 15,
            searchEcommerceCr: 2.0,
            searchAov: 1250,
            avgDealValue: 15000,
            metaCpm: 45,
            metaCtr: 1.8,
            metaLeadCr: 4.0,
            metaHealthyLeadRate: 45,
            metaCloseRate: 12,
            youtubeCpv: 0.35,
            youtubeVtr: 30
          }
        });
      });
    });

    setDraftSubCampaigns(generated);
    setShowDraftGenerator(false);
  };

  // Toggle Language Check in Draft Generator
  const toggleDraftLang = (code: string) => {
    setSelectedDraftLangCodes(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  // Toggle Model Check in Draft Generator
  const toggleDraftModel = (id: string) => {
    setSelectedDraftModelIds(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  // Delete a draft sub-campaign
  const handleDeleteDraftSubCampaign = (subId: string) => {
    setDraftSubCampaigns(prev => prev.filter(s => s.id !== subId));
  };

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

  // Auto-fill unallocated language budget remainder into last language
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

  // Update Sub-Campaign Percentage in Level 2 (% -> ₺)
  const handleSubCampaignPercentageChange = (subId: string, langCode: string, newPct: number) => {
    const pct = Math.min(100, Math.max(0, newPct));
    const langBudget = langAllocations[langCode]?.budget || 0;
    const calcBgt = Math.round((langBudget * pct) / 100);

    setDraftSubCampaigns(prev => prev.map(sc => sc.id === subId ? { ...sc, monthlyBudget: calcBgt } : sc));
  };

  // Auto-fill unallocated sub-campaign budget remainder into the last sub-campaign of a language group
  const handleAutoFillSubCampaignRemainder = (langCode: string) => {
    const grp = languageGroups.find(g => g.code === langCode);
    if (!grp || grp.items.length === 0) return;
    const langBudget = langAllocations[langCode]?.budget || 0;
    const lastSubId = grp.items[grp.items.length - 1].id;
    const sumWithoutLast = grp.items.filter(i => i.id !== lastSubId).reduce((s, i) => s + (i.monthlyBudget || 0), 0);
    const remBgt = Math.max(0, langBudget - sumWithoutLast);

    setDraftSubCampaigns(prev => prev.map(sc => sc.id === lastSubId ? { ...sc, monthlyBudget: remBgt } : sc));
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

  // Quick Add Sub-Campaign item for a specific language
  const handleQuickAddSubCampaignForLanguage = (langCode: string, modelId: string) => {
    const langObj = GOOGLE_ADS_LANGUAGES.find(l => l.code === langCode) || { code: langCode, name: langCode, flag: '🌐' };
    const modelObj = POPULAR_DRAFT_MODELS.find(m => m.id === modelId) || POPULAR_DRAFT_MODELS[0];
    const newId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;

    const newSub: SubCampaignItem = {
      id: newId,
      name: `${langObj.name} - ${modelObj.label.replace(/^[^\s]+\s/, '')}`,
      platform: modelObj.platform,
      objective: modelObj.objective,
      languageCode: langObj.code,
      languageName: langObj.name,
      languageFlag: langObj.flag,
      targetLocations: DEFAULT_LOCATIONS,
      monthlyBudget: 10000,
      selectedKeywords: [],
      discoveredKeywords: [],
      negativeCategories: [],
      businessModel: modelObj.objective.includes('SALES') ? 'ECOMMERCE' : 'LEAD_GEN',
      parameters: {
        targetImpressionShare: 70,
        expectedCtr: 7.5,
        searchLeadCr: 3.5,
        searchHealthyLeadRate: 40,
        searchCloseRate: 15,
        searchEcommerceCr: 2.0,
        searchAov: 1250,
        avgDealValue: 15000,
        metaCpm: 45,
        metaCtr: 1.8,
        metaLeadCr: 4.0,
        metaHealthyLeadRate: 45,
        metaCloseRate: 12,
        youtubeCpv: 0.35,
        youtubeVtr: 30
      }
    };

    setDraftSubCampaigns(prev => [...prev, newSub]);
  };

  // Apply Changes and Save
  const handleApply = () => {
    onApplyAllocation(masterBudget, draftSubCampaigns);
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
      zIndex: 9990,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.25rem'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '840px',
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

        {/* Rapid Draft Generator Box (Shown if 0 sub-campaigns or explicitly toggled) */}
        {(draftSubCampaigns.length === 0 || showDraftGenerator) ? (
          <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1.5px dashed var(--brand-primary)', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Sparkles size={18} color="var(--brand-primary)" />
                <span>Hızlı Dil & Kampanya Modeli Taslak Oluşturucu</span>
              </div>
              {draftSubCampaigns.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowDraftGenerator(false)}
                  className="btn-ghost"
                  style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}
                >
                  Kapat
                </button>
              )}
            </div>

            {/* Step 1: Select Languages */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.45rem' }}>
                1. Hedef Reklam Dillerini Seçin:
              </label>
              <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                {POPULAR_DRAFT_LANGUAGES.map(lang => {
                  const isChecked = selectedDraftLangCodes.includes(lang.code);
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => toggleDraftLang(lang.code)}
                      style={{
                        fontSize: '0.8rem',
                        padding: '0.4rem 0.75rem',
                        borderRadius: 'var(--radius-xs)',
                        border: isChecked ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-default)',
                        backgroundColor: isChecked ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-surface)',
                        color: isChecked ? 'var(--brand-primary)' : 'var(--text-primary)',
                        fontWeight: isChecked ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.12s ease'
                      }}
                    >
                      <span>{isChecked ? '✓ ' : '+ '}{lang.flag} {lang.name}</span>
                    </button>
                  );
                })}

                {onOpenLanguageModal && (
                  <button
                    type="button"
                    onClick={onOpenLanguageModal}
                    style={{
                      fontSize: '0.8rem',
                      padding: '0.4rem 0.75rem',
                      borderRadius: 'var(--radius-xs)',
                      border: '1.5px solid var(--brand-primary)',
                      backgroundColor: 'rgba(37, 99, 235, 0.08)',
                      color: 'var(--brand-primary)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                    title="45+ Dil arasından arayarak seçin"
                  >
                    <Globe size={13} />
                    <span>🌐 Dil Seç (Arama Modalı)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Step 2: Select Channels / Objectives */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.45rem' }}>
                2. Her Dil Altında Oluşturulacak Kampanya Modellerini Seçin:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '0.5rem' }}>
                {POPULAR_DRAFT_MODELS.map(model => {
                  const isChecked = selectedDraftModelIds.includes(model.id);
                  return (
                    <label
                      key={model.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.7rem',
                        fontSize: '0.8rem',
                        fontWeight: isChecked ? 700 : 500,
                        color: isChecked ? 'var(--brand-primary)' : 'var(--text-primary)',
                        backgroundColor: isChecked ? 'rgba(37, 99, 235, 0.1)' : 'var(--bg-surface)',
                        border: isChecked ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-xs)',
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleDraftModel(model.id)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span>{model.label}</span>
                    </label>
                  );
                })}

                {onOpenAddSubCampaignModal && (
                  <button
                    type="button"
                    onClick={() => onOpenAddSubCampaignModal()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                      padding: '0.5rem 0.7rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'var(--brand-primary)',
                      backgroundColor: 'rgba(37, 99, 235, 0.08)',
                      border: '1.5px dashed var(--brand-primary)',
                      borderRadius: 'var(--radius-xs)',
                      cursor: 'pointer'
                    }}
                    title="Özel platform ve model seçerek alt kampanya oluşturun"
                  >
                    <Plus size={14} />
                    <span>➕ Detaylı Alt Kampanya Ekle</span>
                  </button>
                )}
              </div>
            </div>

            {/* Action Button: Generate Drafts */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Otomatik Oluşturulacak: <strong style={{ color: 'var(--brand-primary)' }}>{selectedDraftLangCodes.length * selectedDraftModelIds.length} Alt Kampanya Taslağı</strong> ({selectedDraftLangCodes.length} Dil × {selectedDraftModelIds.length} Kanal)
              </span>
              <button
                type="button"
                onClick={handleGenerateDraftSubCampaigns}
                disabled={selectedDraftLangCodes.length === 0 || selectedDraftModelIds.length === 0}
                className="btn-primary"
                style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 600 }}
              >
                <Plus size={16} />
                <span>🚀 {selectedDraftLangCodes.length * selectedDraftModelIds.length} Taslak Kampanyayı Üret & Bütçeleri Eşit Böl</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setShowDraftGenerator(true)}
              className="btn-ghost"
              style={{ fontSize: '0.78rem', color: 'var(--brand-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Plus size={14} />
              <span>➕ Yeni Dil veya Kampanya Modeli Ekle / Taslak Üret</span>
            </button>
          </div>
        )}

        {/* Level 1: Language Breakdown Tier */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Globe size={16} color="var(--brand-primary)" />
              <span>1. Seviye: Dil Bazlı Bütçe Dağılımı ({languageGroups.length} Hedef Dil)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {onOpenLanguageModal && (
                <button
                  type="button"
                  onClick={onOpenLanguageModal}
                  className="btn-primary"
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}
                  title="Arama modali ile tüm 45+ dil arasından ekleyin"
                >
                  <Globe size={14} />
                  <span>🌐 + Dil Ekle</span>
                </button>
              )}

              {languageGroups.length > 0 && (
                <button
                  type="button"
                  onClick={handleDistributeLanguagesEqually}
                  className="btn-ghost"
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', color: 'var(--brand-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Scale size={13} />
                  <span>⚡ Dilleri Eşit Dağıt</span>
                </button>
              )}
            </div>
          </div>

          {/* Languages Table / Cards */}
          {languageGroups.length > 0 ? (
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
                          {grp.items.length} Alt Kampanya Taslağı
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
          ) : (
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-xs)', border: '1px dashed var(--border-default)', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <span>Henüz kampanya için hedef reklam dili seçilmedi.</span>
              {onOpenLanguageModal && (
                <button
                  type="button"
                  onClick={onOpenLanguageModal}
                  className="btn-primary"
                  style={{ fontSize: '0.78rem', padding: '0.45rem 1rem' }}
                >
                  🌐 + Hedef Reklam Dili Ekle (45+ Dil)
                </button>
              )}
            </div>
          )}

          {/* Language Unallocated / Over-allocated Guard Bar */}
          {languageGroups.length > 0 && (
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
          )}
        </div>

        {/* Level 2: Sub-Campaigns Breakdown Tier per Language */}
        {languageGroups.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Layers size={16} color="var(--brand-primary)" />
              <span>2. Seviye: Diller Altındaki Kampanya Amacı / Kanal Dağılımı</span>
            </div>

            {languageGroups.map(grp => {
              const langBudget = langAllocations[grp.code]?.budget || 0;
              const subBudgetSum = grp.items.reduce((s, i) => s + (i.monthlyBudget || 0), 0);
              const subPctSum = langBudget > 0 ? Math.round((subBudgetSum / langBudget) * 100) : 0;
              const unallocatedSubBudget = langBudget - subBudgetSum;

              return (
                <div key={grp.code} className="card" style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      <span>{grp.flag} {grp.name} Bütçesi:</span>
                      <strong style={{ color: 'var(--brand-primary)' }}>₺{langBudget.toLocaleString('tr-TR')}</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      {onOpenAddSubCampaignModal && (
                        <button
                          type="button"
                          onClick={() => onOpenAddSubCampaignModal(grp.code)}
                          className="btn-primary"
                          style={{ fontSize: '0.74rem', padding: '0.3rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}
                          title={`${grp.name} dili için özel alt kampanya oluştur`}
                        >
                          <Plus size={12} />
                          <span>➕ Alt Kampanya Ekle</span>
                        </button>
                      )}

                      {grp.items.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleDistributeSubCampaignsEqually(grp.code)}
                          className="btn-ghost"
                          style={{ fontSize: '0.72rem', padding: '2px 6px', color: 'var(--brand-primary)', fontWeight: 600 }}
                        >
                          ⚡ Kanallara Eşit Böl
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quick channel model buttons for this language */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Hızlı Kanal Ekle:</span>
                    {POPULAR_DRAFT_MODELS.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleQuickAddSubCampaignForLanguage(grp.code, m.id)}
                        className="btn-ghost"
                        style={{ fontSize: '0.68rem', padding: '2px 6px', border: '1px dashed var(--brand-primary)', color: 'var(--brand-primary)', borderRadius: 'var(--radius-xs)' }}
                        title={`${grp.name} diline ${m.label} ekle`}
                      >
                        + {m.label.split(' ')[1] || m.label}
                      </button>
                    ))}
                  </div>

                  {/* Sub-Campaign items list */}
                  {grp.items.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {grp.items.map(sc => {
                        const subPct = langBudget > 0 ? Math.round(((sc.monthlyBudget || 0) / langBudget) * 100) : 0;
                        const subDaily = Math.round((sc.monthlyBudget || 0) / 30.4);

                        return (
                          <div key={sc.id} style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                            {/* Platform & Name */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: '160px' }}>
                              <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>
                                {sc.platform}
                              </span>
                              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {sc.name}
                              </span>
                            </div>

                            {/* Range Slider & % Input */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: '180px', maxWidth: '320px' }}>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                step={1}
                                value={subPct}
                                onChange={(e) => handleSubCampaignPercentageChange(sc.id, grp.code, parseFloat(e.target.value) || 0)}
                                style={{ flex: 1, accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                              />
                              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  step={1}
                                  value={subPct}
                                  onChange={(e) => handleSubCampaignPercentageChange(sc.id, grp.code, parseFloat(e.target.value) || 0)}
                                  style={{ width: '52px', padding: '0.25rem 0.4rem', fontSize: '0.82rem', fontWeight: 700, textAlign: 'right', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}
                                />
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>%</span>
                              </div>
                            </div>

                            {/* Budget Amount ₺ & Daily Budget & Delete */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
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
                                    style={{ width: '100px', padding: '0.28rem 0.5rem', fontSize: '0.84rem', fontWeight: 700, textAlign: 'right', borderRadius: 'var(--radius-xs)', border: '1px solid var(--brand-primary)', backgroundColor: 'var(--bg-surface-elevated)' }}
                                  />
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteDraftSubCampaign(sc.id)}
                                className="btn-ghost"
                                style={{ padding: '4px', color: 'var(--text-muted)' }}
                                title="Taslak Kampanyayı Sil"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ padding: '0.65rem', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-surface)', border: '1px dashed var(--border-default)', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Henüz {grp.flag} {grp.name} dili altında tanımlı bir alt kampanya yok.</span>
                      {onOpenAddSubCampaignModal && (
                        <button
                          type="button"
                          onClick={() => onOpenAddSubCampaignModal(grp.code)}
                          className="btn-ghost"
                          style={{ fontSize: '0.72rem', color: 'var(--brand-primary)', fontWeight: 600 }}
                        >
                          + Hemen Alt Kampanya Ekle
                        </button>
                      )}
                    </div>
                  )}

                  {/* Sub-Campaign Unallocated / Over-allocated Guard Bar for this Language */}
                  {grp.items.length > 0 && (
                    <div style={{
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: subPctSum === 100 ? 'rgba(16, 185, 129, 0.1)' : (subPctSum > 100 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)'),
                      border: `1px solid ${subPctSum === 100 ? '#10b981' : (subPctSum > 100 ? '#ef4444' : '#f59e0b')}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      fontSize: '0.75rem',
                      marginTop: '0.35rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: subPctSum === 100 ? '#10b981' : (subPctSum > 100 ? '#ef4444' : '#b45309') }}>
                        {subPctSum === 100 ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                        <span>
                          {subPctSum === 100 && `✓ ${grp.name} bütçesi alt kampanyalar arasında %100 oranında tam dağıtıldı.`}
                          {subPctSum > 100 && `⚠️ Bütçe aşımı! ${grp.name} kampanyaları toplamı %${subPctSum} (₺${subBudgetSum.toLocaleString('tr-TR')}) yapıyor.`}
                          {subPctSum < 100 && `⚠️ Boşta kalan ${grp.name} bütçesi: ₺${unallocatedSubBudget.toLocaleString('tr-TR')} (%${(100 - subPctSum).toFixed(1)})`}
                        </span>
                      </div>

                      {subPctSum !== 100 && (
                        <button
                          type="button"
                          onClick={() => handleAutoFillSubCampaignRemainder(grp.code)}
                          className="btn-ghost"
                          style={{ fontSize: '0.7rem', padding: '2px 7px', fontWeight: 700, color: subPctSum > 100 ? '#ef4444' : '#b45309', border: '1px solid currentColor', borderRadius: 'var(--radius-xs)' }}
                        >
                          Kalanı Son Kampanyaya Ekle (%100 Tamamla)
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Footer Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-default)', paddingTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            💡 <em>Uygula butonuna bastığınızda üretilen {draftSubCampaigns.length} alt kampanyanın tüm simülasyonları bu bütçelerle anında oluşturulur.</em>
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
              disabled={draftSubCampaigns.length === 0}
              className="btn-primary"
              style={{ fontSize: '0.85rem', padding: '0.55rem 1.45rem', display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 600 }}
            >
              <CheckCircle2 size={16} />
              <span>Hiyerarşik Dağılımı Uygula & {draftSubCampaigns.length} Kampanyayı Senkronize Et</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
