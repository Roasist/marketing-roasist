import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  Smartphone, 
  Monitor, 
  FileSpreadsheet,
  SlidersHorizontal,
  Info
} from 'lucide-react';

export interface AdHeadline {
  id: string;
  text: string;
  category?: 'KEYWORD' | 'USP' | 'CTA' | 'OFFER';
  pin?: 'POSITION_1' | 'POSITION_2' | 'POSITION_3' | null;
}

export interface AdDescription {
  id: string;
  text: string;
  category?: 'VALUE' | 'TRUST' | 'OFFER' | 'ACTION';
}

export interface AdSitelink {
  title: string;
  desc1: string;
  desc2: string;
}

export interface MetaPrimaryText {
  id: string;
  text: string;
  angle: string;
}

export interface MetaHeadline {
  id: string;
  text: string;
}

export interface MetaDescription {
  id: string;
  text: string;
}

export interface AdCopyData {
  googleSearch: {
    headlines: AdHeadline[];
    descriptions: AdDescription[];
    sitelinks: AdSitelink[];
    callouts: string[];
  };
  metaAds: {
    primaryTexts: MetaPrimaryText[];
    headlines: MetaHeadline[];
    descriptions: MetaDescription[];
    callToAction: string;
  };
}

interface AiAdCreativeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  subCampaign: any;
  clientName?: string;
  targetUrl?: string;
  onSaveAdCopy: (subCampaignId: string, adCopyData: AdCopyData) => void;
}

export const AiAdCreativeStudioModal: React.FC<AiAdCreativeStudioModalProps> = ({
  isOpen,
  onClose,
  subCampaign,
  clientName = 'Marka',
  onSaveAdCopy
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'GOOGLE_SEARCH' | 'META_ADS'>('GOOGLE_SEARCH');
  const [tone, setTone] = useState<'CONVERSION' | 'CORPORATE' | 'URGENCY' | 'CASUAL'>('CONVERSION');
  const [devicePreview, setDevicePreview] = useState<'DESKTOP' | 'MOBILE'>('MOBILE');
  const [metaPlacement, setMetaPlacement] = useState<'INSTAGRAM' | 'FACEBOOK'>('INSTAGRAM');

  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedMetaPrimaryIdx, setSelectedMetaPrimaryIdx] = useState(0);

  // Local state for full creative assets
  const [adCopy, setAdCopy] = useState<AdCopyData>(() => {
    if (subCampaign.adCopyData && subCampaign.adCopyData.googleSearch?.headlines?.length > 0) {
      return subCampaign.adCopyData;
    }
    return {
      googleSearch: {
        headlines: [],
        descriptions: [],
        sitelinks: [],
        callouts: []
      },
      metaAds: {
        primaryTexts: [],
        headlines: [],
        descriptions: [],
        callToAction: 'Şimdi Alışveriş Yap'
      }
    };
  });

  // Auto-generate on first open if empty
  useEffect(() => {
    if (subCampaign.adCopyData?.googleSearch?.headlines?.length) {
      setAdCopy(subCampaign.adCopyData);
    } else {
      handleGenerateAll();
    }
  }, [subCampaign.id]);

  const handleGenerateAll = async () => {
    setIsGenerating(true);
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      const res = await fetch('/api/forecast.php?action=generate_ad_copy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          subCampaignName: subCampaign.name,
          clientName: clientName,
          targetUrl: subCampaign.targetUrl || '',
          languageCode: subCampaign.languageCode || 'tr',
          languageName: subCampaign.languageName || 'Türkçe',
          targetLocations: subCampaign.targetLocations || [],
          keywords: subCampaign.selectedKeywords || [],
          stagClusters: subCampaign.stagClusters || [],
          tone: tone,
          channel: activeTab
        })
      });

      const data = await res.json();
      if (data.status === 'success' && data.adCopyData) {
        setAdCopy(data.adCopyData);
        onSaveAdCopy(subCampaign.id, data.adCopyData);
      }
    } catch (err) {
      console.error('Ad copy generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateSingle = async (type: 'headline' | 'description' | 'primaryText', id: string, index: number) => {
    setRegeneratingId(id);
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      const res = await fetch('/api/forecast.php?action=generate_ad_copy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          subCampaignName: subCampaign.name,
          clientName: clientName,
          targetUrl: subCampaign.targetUrl || '',
          languageCode: subCampaign.languageCode || 'tr',
          languageName: subCampaign.languageName || 'Türkçe',
          targetLocations: subCampaign.targetLocations || [],
          keywords: subCampaign.selectedKeywords || [],
          tone: tone,
          regenerateItem: {
            type,
            index
          }
        })
      });

      const data = await res.json();
      if (data.status === 'success' && data.item) {
        setAdCopy(prev => {
          const next = { ...prev };
          if (type === 'headline') {
            const h = [...next.googleSearch.headlines];
            if (h[index]) {
              h[index] = { ...h[index], text: data.item.text };
              next.googleSearch = { ...next.googleSearch, headlines: h };
            }
          } else if (type === 'description') {
            const d = [...next.googleSearch.descriptions];
            if (d[index]) {
              d[index] = { ...d[index], text: data.item.text };
              next.googleSearch = { ...next.googleSearch, descriptions: d };
            }
          } else if (type === 'primaryText') {
            const pt = [...next.metaAds.primaryTexts];
            if (pt[index]) {
              pt[index] = { ...pt[index], text: data.item.text, angle: data.item.angle || pt[index].angle };
              next.metaAds = { ...next.metaAds, primaryTexts: pt };
            }
          }
          return next;
        });
      }
    } catch (err) {
      console.error('Single regeneration error:', err);
    } finally {
      setRegeneratingId(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyAllAdTexts = () => {
    let fullText = '';
    if (activeTab === 'GOOGLE_SEARCH') {
      fullText = `=== GOOGLE SEARCH (RSA) REKLAM METİNLERİ ===\n`
        + `Kampanya: ${subCampaign.name}\n`
        + `Hedef URL: ${subCampaign.targetUrl || ''}\n`
        + `Dil: ${subCampaign.languageName || 'Türkçe'}\n\n`
        + `--- BAŞLIKLAR (15 Adet - Maks 30 Karakter) ---\n`
        + adCopy.googleSearch.headlines.map((h, i) => `${i + 1}. [${h.text}] (${h.text.length}/30) ${h.pin ? `[Sabit: ${h.pin}]` : ''}`).join('\n')
        + `\n\n--- AÇIKLAMALAR (4 Adet - Maks 90 Karakter) ---\n`
        + adCopy.googleSearch.descriptions.map((d, i) => `${i + 1}. [${d.text}] (${d.text.length}/90)`).join('\n')
        + `\n\n--- SİTELİNKLER ---\n`
        + adCopy.googleSearch.sitelinks.map((s, i) => `${i + 1}. Başlık: ${s.title} | Satır 1: ${s.desc1} | Satır 2: ${s.desc2}`).join('\n')
        + `\n\n--- BELİRTME METİNLERİ (CALLOUTS) ---\n`
        + adCopy.googleSearch.callouts.join(' • ');
    } else {
      fullText = `=== META ADS (FACEBOOK & INSTAGRAM) REKLAM METİNLERİ ===\n`
        + `Kampanya: ${subCampaign.name}\n`
        + `Hedef URL: ${subCampaign.targetUrl || ''}\n\n`
        + `--- BİRİNCİL METİNLER (PRIMARY TEXTS) ---\n`
        + adCopy.metaAds.primaryTexts.map((pt, i) => `Varyasyon ${i + 1} (${pt.angle}):\n${pt.text}\n`).join('\n')
        + `\n--- BAŞLIKLAR ---\n`
        + adCopy.metaAds.headlines.map((h, i) => `${i + 1}. ${h.text}`).join('\n')
        + `\n\n--- AÇIKLAMALAR ---\n`
        + adCopy.metaAds.descriptions.map((d, i) => `${i + 1}. ${d.text}`).join('\n')
        + `\nEylem Çağrısı (CTA): ${adCopy.metaAds.callToAction}`;
    }

    copyToClipboard(fullText, 'COPY_ALL');
  };

  const exportGoogleAdsEditorCsv = () => {
    const headers = [
      'Campaign',
      'Ad Group',
      'Final URL',
      'Headline 1',
      'Headline 2',
      'Headline 3',
      'Headline 4',
      'Headline 5',
      'Headline 6',
      'Headline 7',
      'Headline 8',
      'Headline 9',
      'Headline 10',
      'Headline 11',
      'Headline 12',
      'Headline 13',
      'Headline 14',
      'Headline 15',
      'Headline 1 position',
      'Headline 2 position',
      'Headline 3 position',
      'Headline 4 position',
      'Headline 5 position',
      'Headline 6 position',
      'Headline 7 position',
      'Headline 8 position',
      'Headline 9 position',
      'Headline 10 position',
      'Headline 11 position',
      'Headline 12 position',
      'Headline 13 position',
      'Headline 14 position',
      'Headline 15 position',
      'Description 1',
      'Description 2',
      'Description 3',
      'Description 4',
      'Path 1',
      'Path 2'
    ];

    const cleanQuote = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;

    const pinToNum = (pin?: string | null) => {
      if (pin === 'POSITION_1') return '1';
      if (pin === 'POSITION_2') return '2';
      if (pin === 'POSITION_3') return '3';
      return '';
    };

    const row = [
      cleanQuote(subCampaign.name),
      cleanQuote(subCampaign.name + ' - Ana Grup'),
      cleanQuote(subCampaign.targetUrl || 'https://roasist.com')
    ];

    // Headlines 1..15
    for (let i = 0; i < 15; i++) {
      row.push(cleanQuote(adCopy.googleSearch.headlines[i]?.text || ''));
    }
    // Headline positions 1..15
    for (let i = 0; i < 15; i++) {
      row.push(cleanQuote(pinToNum(adCopy.googleSearch.headlines[i]?.pin)));
    }
    // Descriptions 1..4
    for (let i = 0; i < 4; i++) {
      row.push(cleanQuote(adCopy.googleSearch.descriptions[i]?.text || ''));
    }
    // Paths
    row.push(cleanQuote('kampanya'));
    row.push(cleanQuote('firsat'));

    const csvContent = '\uFEFF' + headers.join(',') + '\n' + row.join(',');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${subCampaign.name.replace(/\s+/g, '_')}_GoogleAdsEditor_RSA.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Google Ad Strength calculation
  const adStrengthScore = useMemo(() => {
    let score = 0;
    const hCount = adCopy.googleSearch.headlines.filter(h => h.text.trim().length > 0).length;
    const dCount = adCopy.googleSearch.descriptions.filter(d => d.text.trim().length > 0).length;
    const allHeadlinesValidLen = adCopy.googleSearch.headlines.every(h => h.text.length <= 30);

    if (hCount >= 8) score += 30;
    if (hCount >= 14) score += 20;
    if (dCount >= 3) score += 25;
    if (dCount === 4) score += 10;
    if (allHeadlinesValidLen && hCount > 0) score += 15;

    return Math.min(100, score);
  }, [adCopy.googleSearch]);

  const getAdStrengthBadge = (score: number) => {
    if (score >= 85) return { label: 'Mükemmel (Excellent)', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' };
    if (score >= 60) return { label: 'İyi (Good)', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' };
    if (score >= 40) return { label: 'Ortalama (Average)', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' };
    return { label: 'Zayıf (Poor)', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' };
  };

  const adStrengthInfo = getAdStrengthBadge(adStrengthScore);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.25rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1280px',
        height: '92vh',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden'
      }}>
        
        {/* ========================================================================= */}
        {/* MODAL HEADER                                                              */}
        {/* ========================================================================= */}
        <div style={{
          padding: '1.15rem 1.75rem',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-surface-elevated)',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: 'rgba(37, 99, 235, 0.12)',
              border: '1px solid rgba(37, 99, 235, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-primary)'
            }}>
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  AI Reklam Kreatif & Metin Stüdyosu
                </h2>
                <span className="badge badge-active" style={{ fontSize: '0.72rem' }}>
                  {subCampaign.name}
                </span>
                <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                  {subCampaign.languageFlag || '🌐'} {subCampaign.languageName || 'Türkçe'}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                {subCampaign.selectedKeywords?.length || 0} seçili anahtar kelime, arama niyetleri ve açılış sayfası verisine göre optimize edildi.
              </p>
            </div>
          </div>

          {/* Quick Actions & Tone */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Tone Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'var(--bg-surface)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <SlidersHorizontal size={14} color="var(--text-muted)" />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ton:</span>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="CONVERSION">🎯 Satış & Dönüşüm Odaklı</option>
                <option value="CORPORATE">🏢 Kurumsal & Güven Verici</option>
                <option value="URGENCY">⚡ Aciliyet & Fırsat (FOMO)</option>
                <option value="CASUAL">✨ Dinamik & Samimi</option>
              </select>
            </div>

            {/* Regenerate All Button */}
            <button
              onClick={handleGenerateAll}
              disabled={isGenerating}
              className="btn-primary"
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
              <span>{isGenerating ? 'Yazılıyor...' : 'Tümünü Yeniden Üret'}</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="btn-ghost"
              style={{ padding: '6px', borderRadius: '50%' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CHANNEL TABS SELECTOR                                                     */}
        {/* ========================================================================= */}
        <div style={{
          padding: '0.5rem 1.75rem',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'var(--bg-surface)'
        }}>
          <button
            onClick={() => setActiveTab('GOOGLE_SEARCH')}
            style={{
              padding: '0.55rem 1.15rem',
              fontSize: '0.85rem',
              fontWeight: activeTab === 'GOOGLE_SEARCH' ? 700 : 500,
              color: activeTab === 'GOOGLE_SEARCH' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'GOOGLE_SEARCH' ? '2.5px solid var(--brand-primary)' : '2.5px solid transparent',
              background: 'transparent',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <span>🔍 Google Search (RSA)</span>
            <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>15 Başlık · 4 Açıklama</span>
          </button>

          <button
            onClick={() => setActiveTab('META_ADS')}
            style={{
              padding: '0.55rem 1.15rem',
              fontSize: '0.85rem',
              fontWeight: activeTab === 'META_ADS' ? 700 : 500,
              color: activeTab === 'META_ADS' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'META_ADS' ? '2.5px solid var(--brand-primary)' : '2.5px solid transparent',
              background: 'transparent',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <span>📱 Meta Ads (Facebook & Instagram)</span>
            <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>4 Kanca Metni · Önizleme</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* MAIN STUDIO WORKSPACE (SPLIT VIEW)                                        */}
        {/* ========================================================================= */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(450px, 1.25fr) minmax(380px, 1fr)',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-surface)'
        }}>
          
          {/* ======================================================================= */}
          {/* LEFT: EDITABLE ASSETS & COPYWRITING                                     */}
          {/* ======================================================================= */}
          <div style={{
            padding: '1.25rem 1.75rem',
            overflowY: 'auto',
            borderRight: '1px solid var(--border-default)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            
            {/* --------------------------------------------------------------------- */}
            {/* GOOGLE SEARCH RSA ASSETS                                              */}
            {/* --------------------------------------------------------------------- */}
            {activeTab === 'GOOGLE_SEARCH' && (
              <>
                {/* Headlines Section */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Başlıklar (Headlines)
                      </span>
                      <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>
                        {adCopy.googleSearch.headlines.length} / 15
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Maksimum 30 Karakter / Başlık
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {adCopy.googleSearch.headlines.map((h, idx) => {
                      const len = h.text.length;
                      const isOver = len > 30;
                      const isNear = len >= 28 && !isOver;

                      return (
                        <div key={h.id || idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          backgroundColor: 'var(--bg-surface-elevated)',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          border: `1px solid ${isOver ? '#ef4444' : 'var(--border-default)'}`
                        }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', width: '20px' }}>
                            {idx + 1}.
                          </span>

                          <input
                            type="text"
                            value={h.text}
                            onChange={(e) => {
                              const newText = e.target.value;
                              setAdCopy(prev => {
                                const copy = { ...prev };
                                const headlines = [...copy.googleSearch.headlines];
                                headlines[idx] = { ...headlines[idx], text: newText };
                                copy.googleSearch = { ...copy.googleSearch, headlines };
                                return copy;
                              });
                            }}
                            placeholder="Başlık metni girin..."
                            style={{
                              flex: 1,
                              background: 'transparent',
                              border: 'none',
                              outline: 'none',
                              fontSize: '0.82rem',
                              color: isOver ? '#ef4444' : 'var(--text-primary)',
                              fontWeight: 500
                            }}
                          />

                          {/* Character Counter Badge */}
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: isOver ? 'rgba(239, 68, 68, 0.15)' : (isNear ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.1)'),
                            color: isOver ? '#ef4444' : (isNear ? '#f59e0b' : '#10b981')
                          }}>
                            {len}/30
                          </span>

                          {/* Pinning Dropdown */}
                          <select
                            value={h.pin || ''}
                            onChange={(e) => {
                              const val = e.target.value || null;
                              setAdCopy(prev => {
                                const copy = { ...prev };
                                const headlines = [...copy.googleSearch.headlines];
                                headlines[idx] = { ...headlines[idx], pin: val as any };
                                copy.googleSearch = { ...copy.googleSearch, headlines };
                                return copy;
                              });
                            }}
                            style={{
                              background: h.pin ? 'rgba(37, 99, 235, 0.12)' : 'transparent',
                              border: `1px solid ${h.pin ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                              color: h.pin ? 'var(--brand-primary)' : 'var(--text-secondary)',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              fontSize: '0.7rem',
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                            title="Google Ads Sabitleme (Pinning)"
                          >
                            <option value="">Sabitleme Yok</option>
                            <option value="POSITION_1">📌 Pozisyon 1</option>
                            <option value="POSITION_2">📌 Pozisyon 2</option>
                            <option value="POSITION_3">📌 Pozisyon 3</option>
                          </select>

                          {/* Regenerate Single */}
                          <button
                            type="button"
                            onClick={() => handleRegenerateSingle('headline', h.id, idx)}
                            disabled={regeneratingId === h.id}
                            className="btn-ghost"
                            style={{ padding: '4px', borderRadius: '4px' }}
                            title="Bu başlığı yapay zekaya yeniden yazdır"
                          >
                            <RefreshCw size={12} className={regeneratingId === h.id ? 'animate-spin' : ''} />
                          </button>

                          {/* Copy Single */}
                          <button
                            type="button"
                            onClick={() => copyToClipboard(h.text, h.id)}
                            className="btn-ghost"
                            style={{ padding: '4px', borderRadius: '4px' }}
                            title="Kopyala"
                          >
                            {copiedId === h.id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Descriptions Section */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Açıklama Metinleri (Descriptions)
                      </span>
                      <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>
                        {adCopy.googleSearch.descriptions.length} / 4
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Maksimum 90 Karakter / Açıklama
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {adCopy.googleSearch.descriptions.map((d, idx) => {
                      const len = d.text.length;
                      const isOver = len > 90;
                      const isNear = len >= 85 && !isOver;

                      return (
                        <div key={d.id || idx} style={{
                          backgroundColor: 'var(--bg-surface-elevated)',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          border: `1px solid ${isOver ? '#ef4444' : 'var(--border-default)'}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.4rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                              Açıklama {idx + 1}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: isOver ? 'rgba(239, 68, 68, 0.15)' : (isNear ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.1)'),
                                color: isOver ? '#ef4444' : (isNear ? '#f59e0b' : '#10b981')
                              }}>
                                {len}/90
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRegenerateSingle('description', d.id, idx)}
                                disabled={regeneratingId === d.id}
                                className="btn-ghost"
                                style={{ padding: '3px', borderRadius: '4px' }}
                                title="Bu açıklamayı yeniden yazdır"
                              >
                                <RefreshCw size={12} className={regeneratingId === d.id ? 'animate-spin' : ''} />
                              </button>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(d.text, d.id)}
                                className="btn-ghost"
                                style={{ padding: '3px', borderRadius: '4px' }}
                                title="Kopyala"
                              >
                                {copiedId === d.id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                              </button>
                            </div>
                          </div>

                          <textarea
                            rows={2}
                            value={d.text}
                            onChange={(e) => {
                              const newText = e.target.value;
                              setAdCopy(prev => {
                                const copy = { ...prev };
                                const descriptions = [...copy.googleSearch.descriptions];
                                descriptions[idx] = { ...descriptions[idx], text: newText };
                                copy.googleSearch = { ...copy.googleSearch, descriptions };
                                return copy;
                              });
                            }}
                            placeholder="Açıklama metni girin..."
                            style={{
                              width: '100%',
                              background: 'transparent',
                              border: 'none',
                              outline: 'none',
                              fontSize: '0.82rem',
                              color: isOver ? '#ef4444' : 'var(--text-primary)',
                              resize: 'none',
                              lineHeight: 1.45
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sitelinks & Callouts Extension Snippet */}
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                    Google Reklam Varlıkları (Sitelinks & Callouts)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.65rem' }}>
                    {adCopy.googleSearch.sitelinks.map((sl, idx) => (
                      <div key={idx} style={{
                        padding: '8px 10px',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-default)',
                        fontSize: '0.75rem'
                      }}>
                        <div style={{ fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '2px' }}>🔗 {sl.title}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>{sl.desc1}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* META ADS ASSETS                                                       */}
            {/* --------------------------------------------------------------------- */}
            {activeTab === 'META_ADS' && (
              <>
                {/* Primary Texts Section */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Birincil Metinler (Primary Texts)
                      </span>
                      <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>
                        {adCopy.metaAds.primaryTexts.length} Varyasyon
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {adCopy.metaAds.primaryTexts.map((pt, idx) => {
                      const isSelected = selectedMetaPrimaryIdx === idx;

                      return (
                        <div key={pt.id || idx} style={{
                          backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.04)' : 'var(--bg-surface-elevated)',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-sm)',
                          border: `1.5px solid ${isSelected ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <span className="badge badge-neutral" style={{ fontSize: '0.7rem', fontWeight: 600 }}>
                                {pt.angle}
                              </span>
                              {isSelected && (
                                <span className="badge badge-active" style={{ fontSize: '0.65rem' }}>
                                  ✓ Canlı Önizlemede Aktif
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <button
                                type="button"
                                onClick={() => setSelectedMetaPrimaryIdx(idx)}
                                className="btn-ghost"
                                style={{ padding: '2px 6px', fontSize: '0.7rem', color: isSelected ? 'var(--brand-primary)' : 'var(--text-secondary)' }}
                              >
                                Önizle
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRegenerateSingle('primaryText', pt.id, idx)}
                                disabled={regeneratingId === pt.id}
                                className="btn-ghost"
                                style={{ padding: '3px', borderRadius: '4px' }}
                                title="Bu metni yeniden yazdır"
                              >
                                <RefreshCw size={12} className={regeneratingId === pt.id ? 'animate-spin' : ''} />
                              </button>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(pt.text, pt.id)}
                                className="btn-ghost"
                                style={{ padding: '3px', borderRadius: '4px' }}
                                title="Kopyala"
                              >
                                {copiedId === pt.id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                              </button>
                            </div>
                          </div>

                          <textarea
                            rows={3}
                            value={pt.text}
                            onChange={(e) => {
                              const newText = e.target.value;
                              setAdCopy(prev => {
                                const copy = { ...prev };
                                const primaryTexts = [...copy.metaAds.primaryTexts];
                                primaryTexts[idx] = { ...primaryTexts[idx], text: newText };
                                copy.metaAds = { ...copy.metaAds, primaryTexts };
                                return copy;
                              });
                            }}
                            placeholder="Birincil reklam metni..."
                            style={{
                              width: '100%',
                              background: 'transparent',
                              border: 'none',
                              outline: 'none',
                              fontSize: '0.82rem',
                              color: 'var(--text-primary)',
                              resize: 'none',
                              lineHeight: 1.5
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Meta Headlines & Call to Action */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.45rem' }}>
                      Meta Başlıkları (Maks 40 Karakter)
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {adCopy.metaAds.headlines.map((mh, idx) => (
                        <input
                          key={mh.id || idx}
                          type="text"
                          value={mh.text}
                          onChange={(e) => {
                            const newText = e.target.value;
                            setAdCopy(prev => {
                              const copy = { ...prev };
                              const headlines = [...copy.metaAds.headlines];
                              headlines[idx] = { ...headlines[idx], text: newText };
                              copy.metaAds = { ...copy.metaAds, headlines };
                              return copy;
                            });
                          }}
                          style={{
                            padding: '6px 10px',
                            backgroundColor: 'var(--bg-surface-elevated)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-default)',
                            fontSize: '0.8rem',
                            color: 'var(--text-primary)'
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.45rem' }}>
                      Eylem Çağrısı (CTA Butonu)
                    </span>
                    <select
                      value={adCopy.metaAds.callToAction}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAdCopy(prev => ({
                          ...prev,
                          metaAds: { ...prev.metaAds, callToAction: val }
                        }));
                      }}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-default)',
                        fontSize: '0.8rem',
                        color: 'var(--text-primary)',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="Şimdi Alışveriş Yap">Şimdi Alışveriş Yap</option>
                      <option value="Daha Fazla Bilgi Al">Daha Fazla Bilgi Al</option>
                      <option value="Teklif Al">Teklif Al</option>
                      <option value="Bize Ulaşın">Bize Ulaşın</option>
                      <option value="Şimdi Kaydol">Şimdi Kaydol</option>
                      <option value="İndir">İndir</option>
                    </select>
                  </div>
                </div>
              </>
            )}

          </div>

          {/* ======================================================================= */}
          {/* RIGHT: INTERACTIVE LIVE PREVIEW MOCKUP SIMULATOR                       */}
          {/* ======================================================================= */}
          <div style={{
            padding: '1.25rem 1.75rem',
            overflowY: 'auto',
            backgroundColor: 'var(--bg-surface-elevated)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            
            {/* Preview Header & Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Canlı Reklam Önizleme
                </span>
                <span className="badge badge-active" style={{ fontSize: '0.68rem' }}>
                  Canlı Simülatör
                </span>
              </div>

              {activeTab === 'GOOGLE_SEARCH' ? (
                <div style={{ display: 'flex', backgroundColor: 'var(--bg-surface)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
                  <button
                    onClick={() => setDevicePreview('MOBILE')}
                    style={{
                      padding: '4px 8px',
                      background: devicePreview === 'MOBILE' ? 'var(--brand-primary)' : 'transparent',
                      color: devicePreview === 'MOBILE' ? '#fff' : 'var(--text-secondary)',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 600
                    }}
                  >
                    <Smartphone size={12} /> Mobil
                  </button>
                  <button
                    onClick={() => setDevicePreview('DESKTOP')}
                    style={{
                      padding: '4px 8px',
                      background: devicePreview === 'DESKTOP' ? 'var(--brand-primary)' : 'transparent',
                      color: devicePreview === 'DESKTOP' ? '#fff' : 'var(--text-secondary)',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 600
                    }}
                  >
                    <Monitor size={12} /> Masaüstü
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', backgroundColor: 'var(--bg-surface)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
                  <button
                    onClick={() => setMetaPlacement('INSTAGRAM')}
                    style={{
                      padding: '4px 8px',
                      background: metaPlacement === 'INSTAGRAM' ? 'var(--brand-primary)' : 'transparent',
                      color: metaPlacement === 'INSTAGRAM' ? '#fff' : 'var(--text-secondary)',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.72rem',
                      fontWeight: 600
                    }}
                  >
                    Instagram
                  </button>
                  <button
                    onClick={() => setMetaPlacement('FACEBOOK')}
                    style={{
                      padding: '4px 8px',
                      background: metaPlacement === 'FACEBOOK' ? 'var(--brand-primary)' : 'transparent',
                      color: metaPlacement === 'FACEBOOK' ? '#fff' : 'var(--text-secondary)',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.72rem',
                      fontWeight: 600
                    }}
                  >
                    Facebook
                  </button>
                </div>
              )}
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* GOOGLE SEARCH PREVIEW MOCKUP                                          */}
            {/* --------------------------------------------------------------------- */}
            {activeTab === 'GOOGLE_SEARCH' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Ad Strength Gauge Card */}
                <div style={{
                  padding: '1rem',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Google Reklam Gücü (Ad Strength)
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: adStrengthInfo.bg,
                      color: adStrengthInfo.color
                    }}>
                      {adStrengthInfo.label}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-default)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${adStrengthScore}%`,
                      height: '100%',
                      backgroundColor: adStrengthInfo.color,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <div>✓ {adCopy.googleSearch.headlines.length}/15 Başlık Eklendi</div>
                    <div>✓ {adCopy.googleSearch.descriptions.length}/4 Açıklama Eklendi</div>
                  </div>
                </div>

                {/* Simulated Google SERP Snippet */}
                <div style={{
                  width: devicePreview === 'MOBILE' ? '360px' : '100%',
                  margin: '0 auto',
                  padding: '1.15rem',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #e2e8f0',
                  color: '#202124',
                  fontFamily: 'Roboto, Arial, sans-serif'
                }}>
                  {/* Google Sponsored Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#f1f3f4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#5f6368'
                    }}>
                      {clientName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#202124', lineHeight: 1.2 }}>
                        {clientName}
                      </div>
                      <div style={{ fontSize: '10px', color: '#5f6368', lineHeight: 1.2 }}>
                        {subCampaign.targetUrl ? subCampaign.targetUrl.replace(/^https?:\/\//, '').split('/')[0] : 'roasist.com'} › kampanya
                      </div>
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 700, color: '#202124' }}>
                      Sponsorlu
                    </span>
                  </div>

                  {/* Headline (Google Blue) */}
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 400,
                    color: '#1a0dab',
                    lineHeight: 1.3,
                    margin: '6px 0',
                    cursor: 'pointer'
                  }}>
                    {adCopy.googleSearch.headlines.slice(0, 3).map(h => h.text).filter(Boolean).join(' | ') || 'Reklam Başlığı | Değer Önerisi | Hemen Keşfet'}
                  </div>

                  {/* Description */}
                  <div style={{ fontSize: '13px', color: '#4d5156', lineHeight: 1.45, marginBottom: '8px' }}>
                    {adCopy.googleSearch.descriptions[0]?.text || 'En kaliteli ürünleri avantajlı fiyatlar ve hızlı kargo fırsatıyla keşfedin. Hemen online sipariş verin.'}
                  </div>

                  {/* Sitelinks Grid in SERP */}
                  {adCopy.googleSearch.sitelinks.length > 0 && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      marginTop: '10px',
                      paddingTop: '8px',
                      borderTop: '1px solid #f1f3f4'
                    }}>
                      {adCopy.googleSearch.sitelinks.slice(0, 4).map((sl, i) => (
                        <div key={i}>
                          <div style={{ fontSize: '12px', color: '#1a0dab', fontWeight: 500, textDecoration: 'underline' }}>
                            {sl.title}
                          </div>
                          <div style={{ fontSize: '10px', color: '#70757a' }}>{sl.desc1}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Callouts */}
                  {adCopy.googleSearch.callouts.length > 0 && (
                    <div style={{ fontSize: '11px', color: '#70757a', marginTop: '8px' }}>
                      {adCopy.googleSearch.callouts.join(' · ')}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* META ADS PREVIEW MOCKUP                                               */}
            {/* --------------------------------------------------------------------- */}
            {activeTab === 'META_ADS' && (
              <div style={{
                width: '360px',
                margin: '0 auto',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid #e2e8f0',
                color: '#1c1e21',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                overflow: 'hidden'
              }}>
                {/* Meta Header */}
                <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f0f2f5' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700
                  }}>
                    {clientName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#050505' }}>
                      {clientName}
                    </div>
                    <div style={{ fontSize: '10px', color: '#65676b' }}>
                      Sponsorlu · 🌐
                    </div>
                  </div>
                </div>

                {/* Primary Text */}
                <div style={{ padding: '10px 12px', fontSize: '12px', color: '#050505', lineHeight: 1.45, whiteSpace: 'pre-line' }}>
                  {adCopy.metaAds.primaryTexts[selectedMetaPrimaryIdx]?.text || 'Yüksek dönüşüm getiren reklam metni burada yer alır.'}
                </div>

                {/* Ad Creative Image Placeholder */}
                <div style={{
                  width: '100%',
                  height: '200px',
                  backgroundColor: '#1e293b',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  gap: '6px'
                }}>
                  <Sparkles size={24} color="#60a5fa" />
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>{clientName} Reklam Kreatifi</span>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>1080 x 1080 (1:1) / 9:16 Feed & Story</span>
                </div>

                {/* Bottom Bar: Headline + CTA */}
                <div style={{
                  padding: '10px 12px',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #e2e8f0'
                }}>
                  <div style={{ flex: 1, paddingRight: '8px' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>
                      {subCampaign.targetUrl ? subCampaign.targetUrl.replace(/^https?:\/\//, '').split('/')[0] : 'ROASIST.COM'}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {adCopy.metaAds.headlines[0]?.text || 'Özel Fırsatı Kaçırma'}
                    </div>
                  </div>

                  <button style={{
                    padding: '6px 12px',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}>
                    {adCopy.metaAds.callToAction || 'Şimdi Satın Al'}
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* ========================================================================= */}
        {/* FOOTER ACTIONS BAR                                                        */}
        {/* ========================================================================= */}
        <div style={{
          padding: '0.9rem 1.75rem',
          borderTop: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-surface-elevated)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <Info size={14} color="var(--brand-primary)" />
            <span>Tüm metinler platform kurallarına ve karakter kotalarına göre anlık olarak denetlenmektedir.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {/* Copy All */}
            <button
              onClick={copyAllAdTexts}
              className="btn-ghost"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {copiedId === 'COPY_ALL' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{copiedId === 'COPY_ALL' ? 'Panoya Kopyalandı!' : 'Metinleri Kopyala'}</span>
            </button>

            {/* Google Ads Editor CSV Export */}
            {activeTab === 'GOOGLE_SEARCH' && (
              <button
                onClick={exportGoogleAdsEditorCsv}
                className="btn-ghost"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--border-default)' }}
                title="Google Ads Editor ile doğrudan içe aktarılabilir CSV dosyası"
              >
                <FileSpreadsheet size={14} color="var(--brand-primary)" />
                <span>Google Ads Editor CSV İndir</span>
              </button>
            )}

            {/* Save to Sub-Campaign */}
            <button
              onClick={() => {
                onSaveAdCopy(subCampaign.id, adCopy);
                onClose();
              }}
              className="btn-primary"
              style={{ padding: '0.45rem 1.15rem', fontSize: '0.82rem', fontWeight: 600 }}
            >
              💾 Alt Kampanyaya Kaydet & Kapat
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
