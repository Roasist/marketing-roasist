import { AdItem, Competitor } from '../types/ad';
import { SubCampaignItem, KeywordMetric, NegativeCategory, GeoTargetLocation } from '../types/forecast';
import { enrichKeywordsWithClusterCpc } from './keywordClusteringService';

export interface VisibleMetricsConfig {
  budget: boolean;        // Aylık Medya Bütçesi
  impressions: boolean;   // Gösterim (Impressions)
  clicks: boolean;        // Tıklama / Trafik (Clicks)
  ctr: boolean;           // Tıklama Oranı (CTR)
  cpc: boolean;           // Tıklama Başı Maliyet (CPC / TBM)
  cpm: boolean;           // Bin Gösterim Başı Maliyet (CPM)
  conversions: boolean;   // Brüt Dönüşüm (Leads / Satış)
  cpl: boolean;           // Dönüşüm Başı Maliyet (CPL / CPA)
  healthyLeads: boolean;  // Nitelikli Talep (SQL Leads)
  cpql: boolean;          // Nitelikli Lead Başı Maliyet (CPQL)
  deals: boolean;         // Satış / Müşteri (Deals)
  cac: boolean;           // Müşteri Edinme Maliyeti (CAC)
  revenue: boolean;       // Ciro Projeksiyonu (Revenue)
  roas: boolean;          // ROAS (Yatırım Getirisi)
}

export interface VisibleKeywordColumnsConfig {
  keyword: boolean;       // Anahtar Kelime
  intent: boolean;        // Arama Niyeti
  volume: boolean;        // Aylık Aranma Hacmi
  trend: boolean;         // 3 Aylık Trend
  competition: boolean;   // Rekabet Derecesi
  lowCpc: boolean;        // Min TBM (₺)
  highCpc: boolean;       // Max TBM (₺)
  avgCpc: boolean;        // Ortalama TBM (₺)
  opportunity: boolean;   // Fırsat Skoru
  aiPick: boolean;        // SEM Uzmanı / AI Önerisi
}

export interface SubCampaignExportConfig {
  includeGeneralInfo: boolean;       // Kampanya & Çatı Plan Bilgileri
  includeKpiSummary: boolean;         // Temel Performans & KPI Özeti
  includeFunnel: boolean;             // 4 Aşamalı Dönüşüm Hunisi
  includeKeywords: boolean;           // Anahtar Kelime & TBM Fırsat Tablosu
  includeNegativeKeywords: boolean;   // Negatif Anahtar Kelime Koruma Listesi
  includeChannelParameters: boolean;  // Kanal & Bütçe Dağılım Parametreleri
  includeStrategicNotes: boolean;     // Stratejik Uygulama Notları
  keywordFilter: 'ALL' | 'SELECTED_ONLY' | 'AI_PICKS_ONLY'; // Kelime Filtresi
  maxKeywordCount: number;            // Kelime Adedi Limiti (0 = Tümü)
  visibleMetrics: VisibleMetricsConfig;
  visibleKeywordColumns: VisibleKeywordColumnsConfig;
}

export const DEFAULT_VISIBLE_METRICS: VisibleMetricsConfig = {
  budget: true,
  impressions: true,
  clicks: true,
  ctr: true,
  cpc: true,
  cpm: true,
  conversions: true,
  cpl: true,
  healthyLeads: true,
  cpql: true,
  deals: true,
  cac: true,
  revenue: true,
  roas: true
};

export const DEFAULT_VISIBLE_COLUMNS: VisibleKeywordColumnsConfig = {
  keyword: true,
  intent: true,
  volume: true,
  trend: true,
  competition: true,
  lowCpc: true,
  highCpc: true,
  avgCpc: true,
  opportunity: true,
  aiPick: true
};

export const DEFAULT_EXPORT_CONFIG: SubCampaignExportConfig = {
  includeGeneralInfo: true,
  includeKpiSummary: true,
  includeFunnel: true,
  includeKeywords: true,
  includeNegativeKeywords: true,
  includeChannelParameters: true,
  includeStrategicNotes: true,
  keywordFilter: 'ALL',
  maxKeywordCount: 50,
  visibleMetrics: DEFAULT_VISIBLE_METRICS,
  visibleKeywordColumns: DEFAULT_VISIBLE_COLUMNS
};

export class ExportService {
  /**
   * Export Competitor Ads as CSV
   */
  public static exportToCsv(ads: AdItem[], competitorName: string): void {
    const headers = [
      'Reklam ID',
      'Marka',
      'Durum',
      'Format',
      'Aktif Gün Sayısı',
      'Yayın Başlangıç',
      'Başlık',
      'Reklam Metni',
      'CTA',
      'Tahmini Erişim',
      'Kanca Tipi (Hook)',
      'Meta Linki'
    ];

    const rows = ads.map(ad => [
      `"${ad.id}"`,
      `"${(ad.pageName || '').replace(/"/g, '""')}"`,
      `"${ad.activeStatus === 'ACTIVE' ? 'Aktif' : 'Pasif'}"`,
      `"${ad.format}"`,
      ad.activeDaysCount,
      `"${ad.startDate}"`,
      `"${(ad.adHeadline || '').replace(/"/g, '""')}"`,
      `"${(ad.adBodyText || '').replace(/"/g, '""')}"`,
      `"${ad.adCta || '-'}"`,
      `"${ad.estimatedImpressions || '-'}"`,
      `"${ad.hookType || '-'}"`,
      `"${ad.metaLibraryUrl || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `Roasist_Rakip_Analizi_${competitorName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Generates a printable HTML report for Competitor Ads
   */
  public static printAiReport(competitor: Competitor, ads: AdItem[]): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const activeAds = ads.filter(a => a.activeStatus === 'ACTIVE');
    const pastAds = ads.filter(a => a.activeStatus === 'INACTIVE');
    const winnerAds = [...ads].sort((a, b) => b.activeDaysCount - a.activeDaysCount).slice(0, 5);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Roasist AI Rakip Analiz Raporu - ${competitor.name}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; padding: 24px; line-height: 1.5; }
          .header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
          h1 { margin: 0 0 8px 0; font-size: 24px; color: #0f172a; }
          .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
          .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
          .stat-number { font-size: 24px; font-weight: bold; color: #4f46e5; margin-top: 4px; }
          .section { margin-bottom: 32px; }
          h2 { font-size: 16px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
          th { background-color: #f1f5f9; font-weight: 600; }
          .winner-badge { background-color: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>⚡ Roasist AI Rakip Reklam & Strateji Raporu</h1>
          <p><strong>Rakip Marka:</strong> ${competitor.name} | <strong>Sektör:</strong> ${competitor.category || '-'}</p>
          <p><strong>Rapor Oluşturma Tarihi:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
        </div>

        <div class="stat-grid">
          <div class="stat-card">
            <div>Aktif Reklam Sayısı</div>
            <div class="stat-number">${activeAds.length} Adet</div>
          </div>
          <div class="stat-card">
            <div>Geçmiş Reklam Arşivi</div>
            <div class="stat-number">${pastAds.length} Adet</div>
          </div>
          <div class="stat-card">
            <div>En Uzun Yayında Kalan</div>
            <div class="stat-number">${winnerAds[0]?.activeDaysCount || 0} Gün 🔥</div>
          </div>
        </div>

        <div class="section">
          <h2>🏆 Kazanan Reklam Kancaları & Kreatifler (Winning Ads)</h2>
          <table>
            <thead>
              <tr>
                <th>Reklam Formatı</th>
                <th>Aktif Süre</th>
                <th>Başlık</th>
                <th>Kanca Tipi (Hook)</th>
                <th>Ana Metin Özeti</th>
              </tr>
            </thead>
            <tbody>
              ${winnerAds.map(ad => `
                <tr>
                  <td><strong>${ad.format}</strong></td>
                  <td><span class="winner-badge">${ad.activeDaysCount} Gün Yayında</span></td>
                  <td>${ad.adHeadline || '-'}</td>
                  <td>${ad.hookType || '-'}</td>
                  <td>${(ad.adBodyText || '').substring(0, 90)}...</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>💡 AI Strateji & Tavsiye Notları</h2>
          <p><strong>Öne Çıkan Açı:</strong> Rakip firma yoğun şekilde <em>${winnerAds[0]?.hookType || 'İndirim'}</em> temasına odaklanıyor.</p>
          <p><strong>Önerilen Aksiyon:</strong> Rakibin ${winnerAds[0]?.activeDaysCount || 30} gündür yayında tuttuğu reklama karşı benzer bir teklif kancası ve video formatı ile yeni bir test kampanyası başlatılması tavsiye edilir.</p>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }

  /**
   * Helper to calculate weighted campaign benchmarks for CPC imputation if auction bids are 0
   */
  public static getSubCampaignCpcBenchmarks(allKws: KeywordMetric[] = []): { benchLow: number; benchHigh: number } {
    const validLowKws = allKws.filter(k => {
      const raw = (k.rawLowCpc !== undefined && k.rawLowCpc > 0.50) ? k.rawLowCpc : (k.lowCpc && k.lowCpc > 0.50 && !k.isCpcEstimated ? k.lowCpc : undefined);
      return raw !== undefined && raw > 0.50;
    });
    const validHighKws = allKws.filter(k => {
      const raw = (k.rawHighCpc !== undefined && k.rawHighCpc > 0.50) ? k.rawHighCpc : (k.highCpc && k.highCpc > 0.50 && !k.isCpcEstimated ? k.highCpc : undefined);
      return raw !== undefined && raw > 0.50;
    });

    const lowSum = validLowKws.reduce((s, k) => s + (((k.rawLowCpc && k.rawLowCpc > 0.50) ? k.rawLowCpc : (k.lowCpc ?? 0)) * Math.max(k.monthlyVolume || 0, 10)), 0);
    const lowVol = validLowKws.reduce((s, k) => s + Math.max(k.monthlyVolume || 0, 10), 0);
    const avgLow = lowVol > 0 ? (lowSum / lowVol) : 0;

    const highSum = validHighKws.reduce((s, k) => s + (((k.rawHighCpc && k.rawHighCpc > 0.50) ? k.rawHighCpc : (k.highCpc ?? 0)) * Math.max(k.monthlyVolume || 0, 10)), 0);
    const highVol = validHighKws.reduce((s, k) => s + Math.max(k.monthlyVolume || 0, 10), 0);
    const avgHigh = highVol > 0 ? (highSum / highVol) : 0;

    const defaultSectorLow = 8.50;
    const defaultSectorHigh = 26.00;

    const benchLow = avgLow >= 1.0 ? avgLow : defaultSectorLow;
    const benchHigh = avgHigh > benchLow ? avgHigh : Math.max(defaultSectorHigh, benchLow * 2.8);

    return { benchLow, benchHigh };
  }

  /**
   * Helper to return EXACT CPC metrics matching the system's live algorithms (with intelligent fallback benchmark imputation for 0 TL CPCs)
   */
  public static sanitizeKeyword(
    k: KeywordMetric,
    benchmarks?: { benchLow: number; benchHigh: number },
    _targetLocations?: GeoTargetLocation[]
  ): {
    lowCpc: number;
    highCpc: number;
    avgCpc: number;
    isEstimated: boolean;
  } {
    // 1. If keyword already has positive computed/imputed CPCs in active state, prioritize them directly!
    const directLow = Number(k.lowCpc) || 0;
    const directHigh = Number(k.highCpc) || 0;
    const isEstimatedFlag = Boolean(k.isCpcEstimated || (k.rawLowCpc !== undefined && k.rawLowCpc <= 0.05));

    if (directLow > 0.05 && directHigh > 0.05) {
      return {
        lowCpc: Math.round(directLow * 100) / 100,
        highCpc: Math.round(directHigh * 100) / 100,
        avgCpc: Math.round(((directLow + directHigh) / 2) * 100) / 100,
        isEstimated: isEstimatedFlag
      };
    }

    // 2. If directLow or directHigh are missing or 0, fallback to cluster semantic imputation
    const enriched = enrichKeywordsWithClusterCpc([k])[0] || k;
    const finalLow = Number(enriched.lowCpc) || (benchmarks?.benchLow || 8.50);
    const finalHigh = Number(enriched.highCpc) || (benchmarks?.benchHigh || 26.00);
    const avgCpc = Math.round(((finalLow + finalHigh) / 2) * 100) / 100;

    return {
      lowCpc: Math.round(finalLow * 100) / 100,
      highCpc: Math.round(finalHigh * 100) / 100,
      avgCpc,
      isEstimated: true
    };
  }

  /**
   * Helper to extract/compute KPIs for a SubCampaignItem matching the exact active studio state
   */
  private static extractSubCampaignMetrics(sub: SubCampaignItem) {
    const budget = sub.monthlyBudget || 0;
    const isLeadGen = sub.businessModel !== 'ECOMMERCE';

    const rawKws = sub.selectedKeywords && sub.selectedKeywords.length > 0
      ? sub.selectedKeywords
      : (sub.discoveredKeywords || []);
      
    const kws = enrichKeywordsWithClusterCpc(rawKws);
    const benchmarks = this.getSubCampaignCpcBenchmarks(kws);
    const validCpcs = kws.map(k => {
      const c = this.sanitizeKeyword(k, benchmarks, sub.targetLocations);
      return c.avgCpc;
    }).filter(v => v > 0);
    
    const fallbackAvgCpc = validCpcs.length > 0 ? (validCpcs.reduce((a, b) => a + b, 0) / validCpcs.length) : 15.0;

    // Google Search Simulation Result
    if (sub.simulationResult) {
      const s = sub.simulationResult;
      const healthyLeads = isLeadGen ? Math.round(s.estConversions * 0.85) : s.estConversions;
      const cpql = healthyLeads > 0 ? Math.round(s.actualSpend / healthyLeads) : 0;
      
      const calculatedCpc = (s.avgCpc && s.avgCpc > 0) 
        ? s.avgCpc 
        : (s.estClicks > 0 && s.actualSpend > 0 ? (s.actualSpend / s.estClicks) : fallbackAvgCpc);

      return {
        impressions: s.estImpressions || 0,
        clicks: s.estClicks || 0,
        ctr: s.avgCtr !== undefined ? s.avgCtr : (s.estImpressions > 0 ? (s.estClicks / s.estImpressions) * 100 : 7.5),
        cpc: Math.round(calculatedCpc * 100) / 100,
        cpm: s.estImpressions > 0 ? Math.round((s.actualSpend / s.estImpressions) * 1000 * 100) / 100 : 0,
        conversions: s.estConversions || 0,
        healthyLeads,
        cpl: s.cpa || (s.estConversions > 0 ? Math.round(s.actualSpend / s.estConversions) : 0),
        cpql,
        deals: s.estDeals || 0,
        cac: s.cac || (s.estDeals && s.estDeals > 0 ? Math.round(s.actualSpend / s.estDeals) : 0),
        revenue: s.estRevenue || 0,
        roas: s.projectedRoas || (budget > 0 ? (s.estRevenue / budget) : 0),
        marketShare: s.targetImpressionShare || sub.parameters?.targetImpressionShare || 70
      };
    }

    // Meta Ads Simulation Result
    if (sub.metaSimulationResult) {
      const m = sub.metaSimulationResult;
      return {
        impressions: m.impressions || 0,
        clicks: m.clicks || 0,
        ctr: m.ctr || 1.6,
        cpc: Math.round((m.cpc || 0) * 100) / 100,
        cpm: m.cpm || 75,
        conversions: m.grossLeads || 0,
        healthyLeads: m.healthyLeads || 0,
        cpl: m.cpl || 0,
        cpql: m.cpql || 0,
        deals: m.deals || 0,
        cac: m.cac || 0,
        revenue: m.revenue || 0,
        roas: m.roas || 0,
        marketShare: 0
      };
    }

    // YouTube Simulation Result
    if (sub.youtubeSimulationResult) {
      const y = sub.youtubeSimulationResult;
      const cpa = y.actions > 0 ? Math.round(y.budget / y.actions) : 0;
      return {
        impressions: y.impressions || 0,
        clicks: y.videoViews || 0,
        ctr: y.vtr || 32,
        cpc: y.cpv || 0.45,
        cpm: 0,
        conversions: y.actions || 0,
        healthyLeads: Math.round((y.actions || 0) * 0.5),
        cpl: cpa,
        cpql: y.actions > 0 ? Math.round(budget / (y.actions * 0.5)) : 0,
        deals: 0,
        cac: 0,
        revenue: 0,
        roas: 0,
        marketShare: 0
      };
    }

    // GDN Simulation Result
    if (sub.gdnSimulationResult) {
      const g = sub.gdnSimulationResult;
      const cpa = g.assistedConversions > 0 ? Math.round(g.budget / g.assistedConversions) : 0;
      return {
        impressions: g.impressions || 0,
        clicks: g.clicks || 0,
        ctr: g.ctr || 0.6,
        cpc: Math.round((g.cpc || 0) * 100) / 100,
        cpm: g.cpm || 18,
        conversions: g.assistedConversions || 0,
        healthyLeads: g.assistedConversions || 0,
        cpl: cpa,
        cpql: cpa,
        deals: 0,
        cac: 0,
        revenue: 0,
        roas: 0,
        marketShare: 0
      };
    }

    // Fallback computed from parameters & keywords
    const p = sub.parameters || {};
    const totalVol = kws.reduce((s, k) => s + (k.monthlyVolume || 0), 0) || 15000;
    const avgCpc = fallbackAvgCpc || 18.5;
    const isShare = p.targetImpressionShare || 70;
    const estImpressions = Math.round(totalVol * (isShare / 100));
    const ctr = p.expectedCtr || 7.5;
    const estClicks = Math.round(estImpressions * (ctr / 100));
    const leadCr = p.searchLeadCr || (isLeadGen ? 3.5 : 2.0);
    const estConversions = Math.round(estClicks * (leadCr / 100));
    const healthyRate = p.searchHealthyLeadRate || 50;
    const estHealthyLeads = Math.round(estConversions * (healthyRate / 100));
    const closeRate = p.searchCloseRate || 10;
    const estDeals = Math.round(estHealthyLeads * (closeRate / 100));
    const dealVal = p.avgDealValue || (isLeadGen ? 25000 : (p.searchAov || 1200));
    const estRevenue = estDeals * dealVal;
    const estRoas = budget > 0 ? Math.round((estRevenue / budget) * 10) / 10 : 0;

    return {
      impressions: estImpressions,
      clicks: estClicks,
      ctr,
      cpc: Math.round(avgCpc * 100) / 100,
      cpm: estImpressions > 0 ? Math.round((budget / estImpressions) * 1000 * 100) / 100 : 0,
      conversions: estConversions,
      healthyLeads: estHealthyLeads,
      cpl: estConversions > 0 ? Math.round(budget / estConversions) : 0,
      cpql: estHealthyLeads > 0 ? Math.round(budget / estHealthyLeads) : 0,
      deals: estDeals,
      cac: estDeals > 0 ? Math.round(budget / estDeals) : 0,
      revenue: estRevenue,
      roas: estRoas,
      marketShare: isShare
    };
  }

  /**
   * Export Sub-Campaign Report as CSV with granular metric and column selection
   */
  public static exportSubCampaignToCsv(
    sub: SubCampaignItem, 
    masterPlan?: { name?: string; clientName?: string; period?: string; startDate?: string; endDate?: string },
    userConfig?: Partial<SubCampaignExportConfig>
  ): void {
    const config: SubCampaignExportConfig = { 
      ...DEFAULT_EXPORT_CONFIG, 
      ...userConfig,
      visibleMetrics: { ...DEFAULT_VISIBLE_METRICS, ...(userConfig?.visibleMetrics || {}) },
      visibleKeywordColumns: { ...DEFAULT_VISIBLE_COLUMNS, ...(userConfig?.visibleKeywordColumns || {}) }
    };
    
    const m = this.extractSubCampaignMetrics(sub);
    const vm = config.visibleMetrics;
    const vc = config.visibleKeywordColumns;
    const isLeadGen = sub.businessModel !== 'ECOMMERCE';
    const locNames = (sub.targetLocations || []).map(l => l.name).join(' | ') || 'Tüm Türkiye';
    const subCampaignName = sub.name || 'Alt Kampanya';

    const rawKws: KeywordMetric[] = sub.selectedKeywords && sub.selectedKeywords.length > 0 
      ? sub.selectedKeywords 
      : (sub.discoveredKeywords || []);

    let allKws = enrichKeywordsWithClusterCpc(rawKws);

    if (config.keywordFilter === 'SELECTED_ONLY') {
      allKws = sub.selectedKeywords && sub.selectedKeywords.length > 0 ? enrichKeywordsWithClusterCpc(sub.selectedKeywords) : allKws.filter(k => k.isSelected);
    } else if (config.keywordFilter === 'AI_PICKS_ONLY') {
      allKws = allKws.filter(k => k.isAiStrategistPick);
    }

    const keywords = (config.maxKeywordCount && config.maxKeywordCount > 0)
      ? allKws.slice(0, config.maxKeywordCount)
      : allKws;

    const lines: string[] = [];

    // Header Meta - Alt Kampanya İsmi en başta ve net
    lines.push(`"ROASIST MARKETING INTELLIGENCE OS - ALT KAMPANYA MEDYA PLANI: ${subCampaignName.toUpperCase().replace(/"/g, '""')}"`);
    lines.push(`"Rapor Tarihi", "${new Date().toLocaleString('tr-TR')}"`);
    
    if (config.includeGeneralInfo) {
      lines.push(`"Alt Kampanya Adı", "${subCampaignName.replace(/"/g, '""')}"`);
      if (masterPlan?.name) lines.push(`"Çatı / Master Kampanya", "${masterPlan.name.replace(/"/g, '""')}"`);
      if (masterPlan?.clientName) lines.push(`"Müşteri / Marka", "${masterPlan.clientName.replace(/"/g, '""')}"`);
      if (masterPlan?.period) lines.push(`"Kampanya Dönemi", "${masterPlan.period.replace(/"/g, '""')}"`);
      lines.push(`"Platform / Kanal", "${sub.platform} (${sub.objective})"`);
      lines.push(`"Hedef Dil", "${sub.languageFlag || ''} ${sub.languageName || sub.languageCode || 'Türkçe'}"`);
      lines.push(`"Hedef Lokasyonlar", "${locNames.replace(/"/g, '""')}"`);
      lines.push(`"İş Modeli", "${isLeadGen ? 'B2B & Nitelikli Talep (Lead Gen)' : 'E-Ticaret & Satış'}"`);
      if (vm.budget) {
        lines.push(`"Aylık Bütçe", "₺${(sub.monthlyBudget || 0).toLocaleString('tr-TR')}"`);
        lines.push(`"Günlük Ortalama Bütçe", "₺${Math.round((sub.monthlyBudget || 0) / 30.4).toLocaleString('tr-TR')}"`);
      }
      lines.push('');
    }

    // Section 1: Parameters
    if (config.includeChannelParameters) {
      lines.push('--- BÖLÜM 1: KANAL & SİMÜLASYON HESAPLAMA PARAMETRELERİ ---');
      lines.push('"Parametre", "Değer"');
      const p = sub.parameters || {};
      if (p.targetImpressionShare) lines.push(`"Hedef Pazar Gösterim Payı (IS)", "%${p.targetImpressionShare}"`);
      if (p.expectedCtr) lines.push(`"Beklenen Tıklama Oranı (CTR)", "%${p.expectedCtr}"`);
      if (p.searchLeadCr) lines.push(`"Arama Ağı Lead Dönüşüm Oranı (CR)", "%${p.searchLeadCr}"`);
      if (p.searchHealthyLeadRate) lines.push(`"Nitelikli Lead Oranı", "%${p.searchHealthyLeadRate}"`);
      if (p.searchCloseRate) lines.push(`"Satış Kapatma Oranı", "%${p.searchCloseRate}"`);
      if (p.avgDealValue) lines.push(`"Ortalama Anlaşma Tutarı", "₺${p.avgDealValue.toLocaleString('tr-TR')}"`);
      if (p.metaCpm) lines.push(`"Meta Hedef CPM", "₺${p.metaCpm}"`);
      if (p.metaCtr) lines.push(`"Meta Hedef CTR", "%${p.metaCtr}"`);
      if (p.youtubeCpv) lines.push(`"YouTube Hedef CPV", "₺${p.youtubeCpv}"`);
      if (p.gdnCpm) lines.push(`"GDN Hedef CPM", "₺${p.gdnCpm}"`);
      lines.push('');
    }

    // Section 2: Funnel Projections
    if (config.includeFunnel) {
      lines.push(`--- BÖLÜM 2: UÇTAN UCA BÜYÜME & DÖNÜŞÜM HUNİSİ PROJEKSİYONU (${subCampaignName}) ---`);
      lines.push('"Huni Aşaması", "Tahmini Hacim", "Birim", "Metrik / Oran"');
      if (vm.impressions) lines.push(`"1. Pazar Gösterimi (Reach)", "${m.impressions}", "Adet", "%${m.marketShare || 0} IS"`);
      if (vm.clicks) lines.push(`"2. Nitelikli Trafik (Clicks)", "${m.clicks}", "Adet", "%${m.ctr.toFixed(2)} TO / ₺${m.cpc.toFixed(2)} TBM"`);
      if (vm.conversions) lines.push(`"3. Brüt Talep / Sipariş", "${m.conversions}", "Adet", "₺${m.cpl.toLocaleString('tr-TR')} CPL"`);
      if (isLeadGen && vm.healthyLeads) lines.push(`"4. Nitelikli Talep (SQL Leads)", "${m.healthyLeads}", "Adet", "₺${m.cpql.toLocaleString('tr-TR')} CPQL"`);
      if (vm.deals || vm.revenue) lines.push(`"5. Kapanan Müşteri / Satış", "${m.deals || 0}", "Adet", "${m.cac > 0 ? `₺${m.cac.toLocaleString('tr-TR')} CAC` : ''}"`);
      lines.push('');
    }

    // Section 3: Key Financial & Performance KPIs
    if (config.includeKpiSummary) {
      lines.push(`--- BÖLÜM 3: TEMEL PERFORMANS & FİNANSAL KPI KARTLARI (${subCampaignName}) ---`);
      lines.push('"KPI", "Değer", "Birim", "Açıklama"');
      if (vm.budget) lines.push(`"Aylık Medya Bütçesi", "${sub.monthlyBudget || 0}", "₺", "Kanal için ayrılan aylık net bütçe"`);
      if (vm.cpc) lines.push(`"Ortalama TBM (CPC)", "₺${m.cpc.toFixed(2)}", "₺", "Sistem Ortalama TBM"`);
      if (vm.cpm && m.cpm > 0) lines.push(`"Bin Gösterim Başı Maliyet (CPM)", "₺${m.cpm.toFixed(2)}", "₺", "Cost Per Mille"`);
      if (isLeadGen && vm.cac && m.cac > 0) lines.push(`"Müşteri Edinme Maliyeti (CAC)", "₺${m.cac.toLocaleString('tr-TR')}", "₺", "Kapanan müşteri başı nihai maliyet"`);
      if (vm.revenue) lines.push(`"Tahmini Toplam Ciro", "₺${m.revenue.toLocaleString('tr-TR')}", "₺", "Model bazlı toplam gelir"`);
      if (vm.roas) lines.push(`"Tahmini ROAS", "${m.roas.toFixed(1)}x", "Kat", "Gelir / Harcama Çarpanı"`);
      lines.push('');
    }

    // Section 4: Keywords Table
    if (config.includeKeywords && keywords.length > 0) {
      lines.push(`--- BÖLÜM 4: SEÇİLEN ANAHTAR KELİMELER VE TBM REKABET ANALİZİ (${keywords.length} Kelime) ---`);
      
      const benchmarks = this.getSubCampaignCpcBenchmarks(keywords);

      // Dynamic Headers based on column visibility
      const kwHeaders: string[] = [];
      if (vc.keyword) kwHeaders.push('"Anahtar Kelime"');
      if (vc.intent) kwHeaders.push('"Arama Niyeti"');
      if (vc.volume) kwHeaders.push('"Aylık Hacim"');
      if (vc.trend) kwHeaders.push('"3 Aylık Trend"');
      if (vc.competition) kwHeaders.push('"Rekabet"');
      if (vc.lowCpc) kwHeaders.push('"Min TBM (₺)"');
      if (vc.highCpc) kwHeaders.push('"Max TBM (₺)"');
      if (vc.avgCpc) kwHeaders.push('"Ort TBM (₺)"');
      if (vc.opportunity) kwHeaders.push('"Fırsat Skoru"');
      if (vc.aiPick) kwHeaders.push('"SEM Uzmanı Önerisi"');
      lines.push(kwHeaders.join(','));

      keywords.forEach(k => {
        const cpc = this.sanitizeKeyword(k, benchmarks, sub.targetLocations);
        const rowCells: string[] = [];
        if (vc.keyword) rowCells.push(`"${k.keyword.replace(/"/g, '""')}"`);
        if (vc.intent) rowCells.push(`"${k.intent || 'COMMERCIAL'}"`);
        if (vc.volume) rowCells.push(`${k.monthlyVolume || 0}`);
        if (vc.trend) rowCells.push(`"${(k.trendChangePercent || 0) >= 0 ? '+' : ''}${k.trendChangePercent || 0}%"`);
        if (vc.competition) rowCells.push(`"${k.competition || 'MEDIUM'}"`);
        if (vc.lowCpc) rowCells.push(cpc.lowCpc.toFixed(2));
        if (vc.highCpc) rowCells.push(cpc.highCpc.toFixed(2));
        if (vc.avgCpc) rowCells.push(cpc.avgCpc.toFixed(2));
        if (vc.opportunity) rowCells.push(`${k.opportunityScore || 80}`);
        if (vc.aiPick) rowCells.push(`"${k.isAiStrategistPick ? 'EVET (Yüksek Dönüşümlü)' : 'Standart'}"`);
        lines.push(rowCells.join(','));
      });
      lines.push('');
    }

    // Section 5: Negatives
    if (config.includeNegativeKeywords && sub.negativeCategories && sub.negativeCategories.length > 0) {
      lines.push('--- BÖLÜM 5: NEGATİF KELİME KATEGORİLERİ VE BÜTÇE KORUMASI ---');
      lines.push('"Negatif Kategori", "Kelime Adedi", "Örnek Negatif Terimler"');
      sub.negativeCategories.forEach((n: NegativeCategory) => {
        const words = Array.isArray(n.words) ? n.words.join(', ') : '';
        const count = Array.isArray(n.words) ? n.words.length : 0;
        lines.push(`"${n.category.replace(/"/g, '""')}", "${count}", "${words.replace(/"/g, '""')}"`);
      });
      lines.push('');
    }

    const csvString = lines.join('\n');
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    const safeName = subCampaignName.replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ]/gi, '_');
    link.download = `Roasist_Alt_Kampanya_${safeName}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Generates a stunning, printable PDF Report for a Sub-Campaign with Executive Styling
   */
  public static printSubCampaignReport(
    sub: SubCampaignItem, 
    masterPlan?: { name?: string; clientName?: string; period?: string; startDate?: string; endDate?: string },
    userConfig?: Partial<SubCampaignExportConfig>
  ): void {
    const config: SubCampaignExportConfig = { 
      ...DEFAULT_EXPORT_CONFIG, 
      ...userConfig,
      visibleMetrics: { ...DEFAULT_VISIBLE_METRICS, ...(userConfig?.visibleMetrics || {}) },
      visibleKeywordColumns: { ...DEFAULT_VISIBLE_COLUMNS, ...(userConfig?.visibleKeywordColumns || {}) }
    };

    const m = this.extractSubCampaignMetrics(sub);
    const vm = config.visibleMetrics;
    const vc = config.visibleKeywordColumns;
    const isLeadGen = sub.businessModel !== 'ECOMMERCE';
    const locNames = (sub.targetLocations || []).map(l => l.name).join(', ') || 'Tüm Türkiye';
    const subCampaignName = sub.name || 'Alt Kampanya';

    const rawKws: KeywordMetric[] = sub.selectedKeywords && sub.selectedKeywords.length > 0 
      ? sub.selectedKeywords 
      : (sub.discoveredKeywords || []);

    let allKws = enrichKeywordsWithClusterCpc(rawKws);

    if (config.keywordFilter === 'SELECTED_ONLY') {
      allKws = sub.selectedKeywords && sub.selectedKeywords.length > 0 ? enrichKeywordsWithClusterCpc(sub.selectedKeywords) : allKws.filter(k => k.isSelected);
    } else if (config.keywordFilter === 'AI_PICKS_ONLY') {
      allKws = allKws.filter(k => k.isAiStrategistPick);
    }

    const maxCount = config.maxKeywordCount > 0 ? config.maxKeywordCount : allKws.length;
    const keywords = allKws.slice(0, maxCount);

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const safeTitle = `${subCampaignName} - Roasist Medya Raporu`;

    const html = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8" />
        <title>${safeTitle}</title>
        <!-- Google Fonts for High Precision Typography -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f8fafc;
            color: #0f172a;
            line-height: 1.5;
            padding: 30px;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          h1, h2, h3, h4 { font-family: 'Outfit', sans-serif; }
          .report-container {
            max-width: 1080px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
            border: 1px solid #e2e8f0;
          }
          
          /* Top Action Bar (Hidden on print) */
          .action-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #1e1b4b;
            color: #ffffff;
            padding: 14px 24px;
            border-radius: 8px;
            margin-bottom: 24px;
            box-shadow: 0 4px 12px rgba(30, 27, 75, 0.2);
          }
          .action-btn {
            background: #2563eb;
            color: #ffffff;
            border: none;
            padding: 9px 18px;
            border-radius: 6px;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s ease;
          }
          .action-btn:hover { background: #1d4ed8; }
          .close-btn {
            background: transparent;
            border: 1px solid rgba(255,255,255,0.3);
            color: #ffffff;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 13px;
            cursor: pointer;
          }

          /* Executive Header */
          .header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            border-bottom: 2px solid #f1f5f9;
            padding-bottom: 24px;
            margin-bottom: 24px;
          }
          .brand-logo {
            display: flex;
            align-items: center;
            gap: 10px;
            font-family: 'Outfit', sans-serif;
            font-size: 22px;
            font-weight: 800;
            color: #2563eb;
            letter-spacing: -0.5px;
          }
          .brand-logo span.tag {
            font-size: 11px;
            background: #eff6ff;
            color: #2563eb;
            padding: 2px 8px;
            border-radius: 99px;
            font-weight: 700;
            border: 1px solid #bfdbfe;
          }
          .header-meta {
            text-align: right;
            font-size: 12px;
            color: #64748b;
          }

          /* Title & Badges */
          .campaign-title-box {
            background: linear-gradient(135deg, rgba(37, 99, 235, 0.06) 0%, rgba(147, 51, 234, 0.04) 100%);
            border: 1px solid #dbeafe;
            border-radius: 10px;
            padding: 20px 24px;
            margin-bottom: 24px;
          }
          .campaign-title-box h1 {
            font-size: 24px;
            font-weight: 800;
            color: #1e293b;
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
          }
          .campaign-title-box .sub-badge {
            background: #2563eb;
            color: #ffffff;
            font-size: 11px;
            padding: 2px 8px;
            border-radius: 4px;
            font-weight: 700;
            text-transform: uppercase;
          }
          .campaign-details-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 14px;
            margin-top: 14px;
            padding-top: 14px;
            border-top: 1px dashed #cbd5e1;
            font-size: 13px;
          }
          .detail-item strong {
            display: block;
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
          }
          .detail-item span {
            color: #0f172a;
            font-weight: 600;
          }

          /* KPI Stat Grid */
          .stat-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
            gap: 14px;
            margin-bottom: 28px;
          }
          .stat-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 16px;
            border-top: 3px solid #2563eb;
            box-shadow: 0 1px 3px rgba(0,0,0,0.03);
          }
          .stat-card.emerald { border-top-color: #10b981; background: #f0fdf4; }
          .stat-card.purple { border-top-color: #9333ea; }
          .stat-card.amber { border-top-color: #f59e0b; }
          .stat-label {
            font-size: 11px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          .stat-value {
            font-size: 22px;
            font-weight: 800;
            font-family: 'Outfit', sans-serif;
            color: #0f172a;
          }
          .stat-sub {
            font-size: 11px;
            color: #64748b;
            margin-top: 2px;
          }

          /* Section Titles */
          .section-title {
            font-size: 16px;
            font-weight: 700;
            color: #1e293b;
            margin: 28px 0 14px 0;
            display: flex;
            align-items: center;
            gap: 8px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
          }

          /* Conversion Funnel Box */
          .funnel-box {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
            gap: 8px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 16px;
            margin-bottom: 24px;
            text-align: center;
          }
          .funnel-step {
            position: relative;
            padding: 10px 6px;
            background: #ffffff;
            border-radius: 8px;
            border: 1px solid #cbd5e1;
          }
          .funnel-step .val {
            font-size: 16px;
            font-weight: 800;
            color: #2563eb;
            font-family: 'Outfit', sans-serif;
          }
          .funnel-step .lbl {
            font-size: 11px;
            color: #64748b;
            font-weight: 600;
            margin-top: 2px;
          }
          .funnel-step .rate {
            font-size: 10px;
            background: #eff6ff;
            color: #2563eb;
            padding: 1px 6px;
            border-radius: 99px;
            display: inline-block;
            margin-top: 4px;
            font-weight: 700;
          }

          /* Tables */
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-top: 8px;
            background: #ffffff;
          }
          th {
            background: #f1f5f9;
            color: #334155;
            text-align: left;
            padding: 9px 10px;
            font-weight: 700;
            border: 1px solid #e2e8f0;
            text-transform: uppercase;
            font-size: 10.5px;
            letter-spacing: 0.3px;
          }
          td {
            padding: 8px 10px;
            border: 1px solid #e2e8f0;
            color: #1e293b;
          }
          tr:nth-child(even) td {
            background: #f8fafc;
          }
          .badge {
            display: inline-block;
            padding: 2px 7px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 700;
          }
          .badge-intent-trans { background: #dcfce7; color: #166534; }
          .badge-intent-comm { background: #dbeafe; color: #1e40af; }
          .badge-intent-info { background: #f1f5f9; color: #475569; }
          .badge-ai-pick { background: #fae8ff; color: #86198f; border: 1px solid #f0abfc; }

          /* Negative categories pills */
          .negative-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 10px;
            margin-top: 10px;
          }
          .negative-card {
            background: #fff1f2;
            border: 1px solid #fecdd3;
            border-radius: 8px;
            padding: 10px 14px;
            font-size: 12px;
          }
          .negative-card strong {
            color: #e11d48;
            display: block;
            font-size: 12px;
            margin-bottom: 3px;
          }
          .negative-card span {
            color: #881337;
            font-size: 11px;
          }

          /* Footer */
          .footer {
            margin-top: 36px;
            padding-top: 18px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 11px;
            color: #94a3b8;
          }

          /* Print Overrides */
          @media print {
            body { padding: 0; background: #ffffff; }
            .action-bar { display: none !important; }
            .report-container {
              box-shadow: none !important;
              border: none !important;
              padding: 10px !important;
              max-width: 100% !important;
            }
            .page-break { page-break-before: always; }
          }
        </style>
      </head>
      <body>

        <!-- Action Bar (Hidden on Print) -->
        <div class="action-bar">
          <div style="display:flex; align-items:center; gap: 10px;">
            <span style="font-size: 18px;">📄</span>
            <div>
              <div style="font-weight: 700; font-size: 15px;">Roasist Alt Kampanya Raporu: ${subCampaignName}</div>
              <div style="font-size: 12px; opacity: 0.8;">Baskı ve PDF önizlemesi hazır. Kaydetmek için butona tıklayın.</div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap: 10px;">
            <button class="action-btn" onclick="window.print()">🖨️ PDF Olarak Kaydet / Yazdır</button>
            <button class="close-btn" onclick="window.close()">Kapat</button>
          </div>
        </div>

        <div class="report-container">
          
          <!-- Executive Header -->
          <div class="header">
            <div>
              <div class="brand-logo">
                <span>⚡ ROASIST</span>
                <span class="tag">MARKETING INTELLIGENCE OS</span>
              </div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
                Resmi Google & Meta API Algoritmik Kampanya Simülatörü
              </div>
            </div>
            <div class="header-meta">
              <div><strong>Rapor Tarihi:</strong> ${new Date().toLocaleDateString('tr-TR')}</div>
              <div><strong>Alt Kampanya:</strong> <span style="color:#2563eb; font-weight:700;">${subCampaignName}</span></div>
              <div><strong>Rapor ID:</strong> #${sub.id.slice(-8)}</div>
            </div>
          </div>

          <!-- Campaign Main Banner -->
          <div class="campaign-title-box">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
              <span class="sub-badge">ALT KAMPANYA MEDYA PLANI</span>
              ${sub.platform ? `<span style="font-size:12px; color:#475569; font-weight:600;">• ${sub.platform} (${sub.objective})</span>` : ''}
            </div>
            <h1>
              <span>${sub.languageFlag || '🎯'}</span>
              <span>${subCampaignName}</span>
            </h1>
            <div style="font-size: 13px; color: #475569;">
              ${masterPlan?.name ? `<strong>Çatı Kampanya:</strong> ${masterPlan.name} • ` : ''}
              ${masterPlan?.clientName ? `<strong>Müşteri:</strong> ${masterPlan.clientName} • ` : ''}
              <strong>Hedef Dil:</strong> ${sub.languageName || sub.languageCode || 'Türkçe'}
            </div>

            ${config.includeGeneralInfo ? `
            <div class="campaign-details-grid">
              <div class="detail-item">
                <strong>Hedef Dil & Bayrak</strong>
                <span>${sub.languageFlag || ''} ${sub.languageName || sub.languageCode || 'Türkçe'}</span>
              </div>
              <div class="detail-item">
                <strong>Hedef Lokasyonlar</strong>
                <span style="font-size: 12px;">${locNames}</span>
              </div>
              <div class="detail-item">
                <strong>İş Modeli & Huni</strong>
                <span>${isLeadGen ? 'B2B / Nitelikli Talep' : 'E-Ticaret & Satış'}</span>
              </div>
              ${masterPlan?.period ? `
              <div class="detail-item">
                <strong>Kampanya Dönemi</strong>
                <span>${masterPlan.period}</span>
              </div>` : ''}
            </div>` : ''}
          </div>

          <!-- SECTION 1: Kanal & Simülasyon Hesaplama Parametreleri -->
          ${config.includeChannelParameters && sub.parameters ? `
          <div class="section-title">
            <span>⚙️</span>
            <span>Kanal & Simülasyon Hesaplama Parametreleri</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px;">
            ${sub.parameters.targetImpressionShare ? `<div><strong style="display:block; font-size:11px; color:#64748b; margin-bottom:2px;">Hedef Gösterim Payı (IS)</strong><span style="font-weight:700; color:#0f172a; font-size:14px;">%${sub.parameters.targetImpressionShare}</span></div>` : ''}
            ${sub.parameters.expectedCtr ? `<div><strong style="display:block; font-size:11px; color:#64748b; margin-bottom:2px;">Beklenen TO (CTR)</strong><span style="font-weight:700; color:#0f172a; font-size:14px;">%${sub.parameters.expectedCtr}</span></div>` : ''}
            ${sub.parameters.searchLeadCr ? `<div><strong style="display:block; font-size:11px; color:#64748b; margin-bottom:2px;">Lead Dönüşüm Oranı (CR)</strong><span style="font-weight:700; color:#0f172a; font-size:14px;">%${sub.parameters.searchLeadCr}</span></div>` : ''}
            ${sub.parameters.searchHealthyLeadRate ? `<div><strong style="display:block; font-size:11px; color:#64748b; margin-bottom:2px;">Nitelikli Lead Oranı</strong><span style="font-weight:700; color:#0f172a; font-size:14px;">%${sub.parameters.searchHealthyLeadRate}</span></div>` : ''}
            ${sub.parameters.searchCloseRate ? `<div><strong style="display:block; font-size:11px; color:#64748b; margin-bottom:2px;">Satış Kapatma Oranı</strong><span style="font-weight:700; color:#0f172a; font-size:14px;">%${sub.parameters.searchCloseRate}</span></div>` : ''}
            ${sub.parameters.avgDealValue ? `<div><strong style="display:block; font-size:11px; color:#64748b; margin-bottom:2px;">Ort. Anlaşma Tutarı</strong><span style="font-weight:700; color:#0f172a; font-size:14px;">₺${sub.parameters.avgDealValue.toLocaleString('tr-TR')}</span></div>` : ''}
            ${sub.parameters.metaCpm ? `<div><strong style="display:block; font-size:11px; color:#64748b; margin-bottom:2px;">Meta Hedef CPM</strong><span style="font-weight:700; color:#0f172a; font-size:14px;">₺${sub.parameters.metaCpm}</span></div>` : ''}
            ${sub.parameters.youtubeCpv ? `<div><strong style="display:block; font-size:11px; color:#64748b; margin-bottom:2px;">YouTube Hedef CPV</strong><span style="font-weight:700; color:#0f172a; font-size:14px;">₺${sub.parameters.youtubeCpv}</span></div>` : ''}
          </div>
          ` : ''}

          <!-- SECTION 2: Uçtan Uca Büyüme & Dönüşüm Hunisi Projeksiyonu -->
          ${config.includeFunnel ? `
          <div class="section-title">
            <span>🎯</span>
            <span>Uçtan Uca Büyüme & Dönüşüm Hunisi Projeksiyonu</span>
          </div>

          <div class="funnel-box">
            ${vm.impressions ? `
            <div class="funnel-step">
              <div class="val">${m.impressions.toLocaleString('tr-TR')}</div>
              <div class="lbl">1. Pazar Gösterimi</div>
              <div class="rate">${m.marketShare > 0 ? `%${m.marketShare} IS` : 'Hedef Gösterim'}</div>
            </div>` : ''}

            ${vm.clicks ? `
            <div class="funnel-step">
              <div class="val">${m.clicks.toLocaleString('tr-TR')}</div>
              <div class="lbl">2. Nitelikli Trafik</div>
              <div class="rate">${vm.ctr ? `%${m.ctr.toFixed(2)} TO` : 'Tıklama'}</div>
            </div>` : ''}

            ${vm.conversions ? `
            <div class="funnel-step">
              <div class="val">${m.conversions.toLocaleString('tr-TR')}</div>
              <div class="lbl">3. Brüt Talep / Sipariş</div>
              <div class="rate">${vm.cpl ? `₺${m.cpl.toLocaleString('tr-TR')} CPL` : 'Dönüşüm'}</div>
            </div>` : ''}

            ${(isLeadGen ? vm.healthyLeads : vm.conversions) ? `
            <div class="funnel-step" style="border-color: #86efac; background: #f0fdf4;">
              <div class="val" style="color: #16a34a;">${(isLeadGen ? m.healthyLeads : m.conversions).toLocaleString('tr-TR')}</div>
              <div class="lbl">4. ${isLeadGen ? 'Nitelikli SQL Lead' : 'Net Sipariş'}</div>
              <div class="rate" style="background:#dcfce7; color:#166534;">${isLeadGen ? `₺${m.cpql.toLocaleString('tr-TR')} CPQL` : 'Satış'}</div>
            </div>` : ''}

            ${(vm.deals || vm.revenue) ? `
            <div class="funnel-step" style="border-color: #86efac; background: #f0fdf4;">
              <div class="val" style="color: #16a34a;">${m.deals > 0 ? `${m.deals} Müşteri` : (vm.revenue ? `₺${m.revenue.toLocaleString('tr-TR')}` : 'Tamamlandı')}</div>
              <div class="lbl">5. Kapanan Satış</div>
              <div class="rate" style="background:#dcfce7; color:#166534;">${m.cac > 0 ? `₺${m.cac.toLocaleString('tr-TR')} CAC` : 'Satış'}</div>
            </div>` : ''}
          </div>` : ''}

          <!-- SECTION 3: Temel Performans & KPI Kartları (Mükerrer Olmayan Finansal & Büyüme Kartları) -->
          ${config.includeKpiSummary ? `
          <div class="section-title">
            <span>📊</span>
            <span>Temel Performans & KPI Kartları</span>
          </div>
          <div class="stat-grid">
            ${vm.budget ? `
            <div class="stat-card">
              <div class="stat-label">Aylık Medya Bütçesi</div>
              <div class="stat-value" style="color: #2563eb;">₺${(sub.monthlyBudget || 0).toLocaleString('tr-TR')}</div>
              <div class="stat-sub">Günlük ₺${Math.round((sub.monthlyBudget || 0) / 30.4).toLocaleString('tr-TR')} Harcama Tavanı</div>
            </div>` : ''}

            ${vm.cpc ? `
            <div class="stat-card">
              <div class="stat-label">Ortalama TBM & CPM</div>
              <div class="stat-value" style="color: #2563eb;">₺${m.cpc.toFixed(2)}</div>
              <div class="stat-sub">${vm.cpm && m.cpm > 0 ? `CPM: ₺${m.cpm.toFixed(2)}` : 'Sistem Ortalama TBM'}</div>
            </div>` : ''}

            ${(isLeadGen && vm.cac && m.cac > 0) ? `
            <div class="stat-card emerald">
              <div class="stat-label">Müşteri Edinme Maliyeti (CAC)</div>
              <div class="stat-value" style="color: #16a34a;">₺${m.cac.toLocaleString('tr-TR')}</div>
              <div class="stat-sub">Kapanan Müşteri Başı Maliyet</div>
            </div>` : ''}

            ${vm.revenue ? `
            <div class="stat-card emerald">
              <div class="stat-label">Tahmini Toplam Ciro</div>
              <div class="stat-value" style="color: #16a34a;">₺${m.revenue.toLocaleString('tr-TR')}</div>
              <div class="stat-sub">${m.deals > 0 ? `${m.deals} Kapanan Müşteri Projeksiyonu` : 'Model Geliri'}</div>
            </div>` : ''}

            ${vm.roas ? `
            <div class="stat-card emerald">
              <div class="stat-label">Tahmini ROAS (Yatırım Getirisi)</div>
              <div class="stat-value" style="color: #16a34a;">${m.roas.toFixed(1)}x</div>
              <div class="stat-sub">Gelir / Harcama Çarpanı</div>
            </div>` : ''}
          </div>` : ''}

          <!-- Keywords Table (if Google Search / Keywords exist) -->
          ${config.includeKeywords && keywords.length > 0 ? `
          <div class="section-title">
            <span>🔍</span>
            <span>Hedeflenen Anahtar Kelimeler & TBM Analizi (${keywords.length} Kelime)</span>
          </div>

          <table>
            <thead>
              <tr>
                ${vc.keyword ? '<th>Anahtar Kelime</th>' : ''}
                ${vc.intent ? '<th>Niyet</th>' : ''}
                ${vc.volume ? '<th style="text-align:right;">Aylık Hacim</th>' : ''}
                ${vc.trend ? '<th style="text-align:right;">Trend</th>' : ''}
                ${vc.competition ? '<th>Rekabet</th>' : ''}
                ${vc.lowCpc ? '<th style="text-align:right;">Min TBM</th>' : ''}
                ${vc.highCpc ? '<th style="text-align:right;">Max TBM</th>' : ''}
                ${vc.avgCpc ? '<th style="text-align:right;">Ort TBM</th>' : ''}
                ${vc.opportunity ? '<th style="text-align:center;">Fırsat Skoru</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${(() => {
                const benchmarks = this.getSubCampaignCpcBenchmarks(keywords);
                return keywords.map(k => {
                  const cpc = this.sanitizeKeyword(k, benchmarks, sub.targetLocations);
                  const intentClass = k.intent === 'TRANSACTIONAL' ? 'badge-intent-trans' : (k.intent === 'INFORMATIONAL' ? 'badge-intent-info' : 'badge-intent-comm');
                  const intentLabel = k.intent === 'TRANSACTIONAL' ? 'Satın Alma' : (k.intent === 'INFORMATIONAL' ? 'Bilgi' : 'Ticari');
                  return `
                    <tr>
                      ${vc.keyword ? `
                      <td>
                        <strong>${k.keyword}</strong>
                        ${vc.aiPick && k.isAiStrategistPick ? '<span class="badge badge-ai-pick" style="margin-left: 4px;">✨ SEM Önerisi</span>' : ''}
                      </td>` : ''}
                      ${vc.intent ? `<td><span class="badge ${intentClass}">${intentLabel}</span></td>` : ''}
                      ${vc.volume ? `<td style="text-align:right; font-weight:700;">${(k.monthlyVolume || 0).toLocaleString('tr-TR')}</td>` : ''}
                      ${vc.trend ? `
                      <td style="text-align:right; color: ${(k.trendChangePercent || 0) >= 0 ? '#16a34a' : '#dc2626'}; font-weight:600;">
                        ${(k.trendChangePercent || 0) >= 0 ? '+' : ''}${k.trendChangePercent || 0}%
                      </td>` : ''}
                      ${vc.competition ? `<td><span style="font-size:11px; color:#64748b;">${k.competition === 'HIGH' ? 'Yüksek' : (k.competition === 'LOW' ? 'Düşük' : 'Orta')}</span></td>` : ''}
                      ${vc.lowCpc ? `<td style="text-align:right; font-family:monospace;">₺${cpc.lowCpc.toFixed(2)}</td>` : ''}
                      ${vc.highCpc ? `<td style="text-align:right; font-family:monospace;">₺${cpc.highCpc.toFixed(2)}</td>` : ''}
                      ${vc.avgCpc ? `<td style="text-align:right; font-weight:700; color:#2563eb; font-family:monospace;">₺${cpc.avgCpc.toFixed(2)}</td>` : ''}
                      ${vc.opportunity ? `
                      <td style="text-align:center;">
                        <span style="font-weight:800; color:${(k.opportunityScore || 80) >= 85 ? '#16a34a' : '#2563eb'};">${k.opportunityScore || 80}</span>/100
                      </td>` : ''}
                    </tr>
                  `;
                }).join('');
              })()}
            </tbody>
          </table>
          ` : ''}

          <!-- Negative Safeguards -->
          ${config.includeNegativeKeywords && sub.negativeCategories && sub.negativeCategories.length > 0 ? `
          <div class="section-title">
            <span>🛡️</span>
            <span>Aktif Negatif Kelime Koruması (${sub.negativeCategories.length} Kategori)</span>
          </div>
          <div class="negative-grid">
            ${sub.negativeCategories.map((n: NegativeCategory) => {
              const wordsList = Array.isArray(n.words) ? n.words : [];
              return `
                <div class="negative-card">
                  <strong>🚫 ${n.category} (${wordsList.length} Terim)</strong>
                  <span>${wordsList.slice(0, 5).join(', ')}</span>
                </div>
              `;
            }).join('')}
          </div>
          ` : ''}

          <!-- Strategic Notes -->
          ${config.includeStrategicNotes ? `
          <div class="section-title">
            <span>💡</span>
            <span>Stratejik Uygulama & Kampanya Başlatma Notları</span>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; font-size: 12px; color: #334155; line-height: 1.6;">
            <p style="margin-bottom: 6px;">• <strong>Hedefleme Optimizasyonu:</strong> Bu alt kampanya (${subCampaignName}) ${sub.languageName || 'belirlenen dilde'} ve seçilen ${locNames} coğrafi bölgesinde en yüksek satın alma niyetine sahip kitleye odaklanacak şekilde modellenmiştir.</p>
            <p style="margin-bottom: 6px;">• <strong>Bütçe & TBM Dağılımı:</strong> Aylık ₺${(sub.monthlyBudget || 0).toLocaleString('tr-TR')} bütçe ile ortalama ₺${m.cpc.toFixed(2)} TBM hedeflenmiş ve günlük ₺${Math.round((sub.monthlyBudget || 0) / 30.4).toLocaleString('tr-TR')} harcama tavanı öngörülmüştür.</p>
            <p>• <strong>Dönüşüm Takibi:</strong> Kampanya canlıya alınmadan önce dönüşüm piksellerinin (Google Ads Enhanced Conversions / Meta CAPI) doğrulanması tavsiye edilir.</p>
          </div>` : ''}

          <!-- Footer -->
          <div class="footer">
            <div>© ${new Date().getFullYear()} Roasist Marketing Intelligence OS • Tüm hakları saklıdır.</div>
            <div>Gizli & Kurumsal Medya Raporu • ${subCampaignName} (${masterPlan?.clientName || 'Roasist Client'})</div>
          </div>

        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }
}
