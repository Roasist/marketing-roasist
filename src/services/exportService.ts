import { AdItem, Competitor } from '../types/ad';
import { SubCampaignItem, KeywordMetric, NegativeCategory } from '../types/forecast';

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
      `"${ad.pageName}"`,
      `"${ad.activeStatus === 'ACTIVE' ? 'Aktif' : 'Geçmiş'}"`,
      `"${ad.format}"`,
      `"${ad.activeDaysCount} Gün"`,
      `"${new Date(ad.startDate).toLocaleDateString('tr-TR')}"`,
      `"${ad.adHeadline.replace(/"/g, '""')}"`,
      `"${ad.adBodyText.replace(/"/g, '""')}"`,
      `"${ad.adCta}"`,
      `"${ad.estimatedImpressions || 'Belirtilmedi'}"`,
      `"${ad.hookType}"`,
      `"${ad.metaLibraryUrl}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rakip_Reklam_Raporu_${competitorName}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Generates formatted text report for AI Executive Summary or PDF printing
   */
  public static printAiReport(competitor: Competitor, ads: AdItem[]): void {
    const activeAds = ads.filter(a => a.activeStatus === 'ACTIVE');
    const pastAds = ads.filter(a => a.activeStatus === 'INACTIVE');
    const winnerAds = [...ads].sort((a, b) => b.activeDaysCount - a.activeDaysCount).slice(0, 3);

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rakip Reklam Stratejisi Raporu - ${competitor.name}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
          h1 { color: #4F46E5; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; }
          .header-info { background: #F3F4F6; padding: 15px; border-radius: 8px; margin-bottom: 25px; }
          .stat-grid { display: flex; gap: 20px; margin-bottom: 30px; }
          .stat-card { background: #EEF2FF; padding: 15px 20px; border-radius: 8px; flex: 1; border-left: 4px solid #4F46E5; }
          .stat-number { font-size: 24px; font-weight: bold; color: #312E81; }
          .section { margin-bottom: 35px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #E5E7EB; padding: 10px; text-align: left; font-size: 13px; }
          th { background: #F9FAFB; }
          .winner-badge { background: #FEF3C7; color: #92400E; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>📊 Rakip Reklam Stratejisi Raporu: ${competitor.name}</h1>
        <div class="header-info">
          <p><strong>Meta Sayfa ID:</strong> ${competitor.pageId}</p>
          <p><strong>Kategori:</strong> ${competitor.category}</p>
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
                  <td>${ad.adHeadline}</td>
                  <td>${ad.hookType}</td>
                  <td>${ad.adBodyText.substring(0, 90)}...</td>
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
   * Helper to sanitize and impute realistic CPC for any keyword (prevents 0 TBM in reports)
   */
  public static sanitizeKeyword(k: KeywordMetric, fallbackCpc: number = 18.5): {
    lowCpc: number;
    highCpc: number;
    avgCpc: number;
  } {
    let low = Number(k.lowCpc) || 0;
    let high = Number(k.highCpc) || 0;

    // 1. If both are valid bids (> 0.10 TL)
    if (low > 0.10 && high > 0.10) {
      if (low > high) {
        const temp = low;
        low = high;
        high = temp;
      }
      return {
        lowCpc: Math.round(low * 100) / 100,
        highCpc: Math.round(high * 100) / 100,
        avgCpc: Math.round(((low + high) / 2) * 100) / 100
      };
    }

    // 2. If only one bid is present
    if (low > 0.10 && high <= 0.10) {
      high = Math.round(low * 1.8 * 100) / 100;
      return {
        lowCpc: Math.round(low * 100) / 100,
        highCpc: high,
        avgCpc: Math.round(((low + high) / 2) * 100) / 100
      };
    }
    if (high > 0.10 && low <= 0.10) {
      low = Math.max(1.0, Math.round(high * 0.55 * 100) / 100);
      return {
        lowCpc: low,
        highCpc: Math.round(high * 100) / 100,
        avgCpc: Math.round(((low + high) / 2) * 100) / 100
      };
    }

    // 3. If both are 0 or missing, apply intent-based realistic imputation
    const intentMult = k.intent === 'TRANSACTIONAL' ? 1.25 : (k.intent === 'INFORMATIONAL' ? 0.80 : 1.00);
    const targetMid = (fallbackCpc > 2 ? fallbackCpc : 18.5) * intentMult;
    const imputedLow = Math.max(1.50, Math.round(targetMid * 0.65 * 100) / 100);
    const imputedHigh = Math.max(Math.round(imputedLow * 1.6 * 100) / 100, Math.round(targetMid * 1.45 * 100) / 100);

    return {
      lowCpc: imputedLow,
      highCpc: imputedHigh,
      avgCpc: Math.round(((imputedLow + imputedHigh) / 2) * 100) / 100
    };
  }

  /**
   * Helper to extract/compute KPIs for a SubCampaignItem
   */
  private static extractSubCampaignMetrics(sub: SubCampaignItem) {
    const budget = sub.monthlyBudget || 0;
    const isLeadGen = sub.businessModel !== 'ECOMMERCE';

    const kws = sub.selectedKeywords || sub.discoveredKeywords || [];
    const validCpcs = kws.map(k => (Number(k.lowCpc) + Number(k.highCpc)) / 2).filter(v => v > 0.5);
    const fallbackAvgCpc = validCpcs.length > 0 ? (validCpcs.reduce((a, b) => a + b, 0) / validCpcs.length) : 18.5;

    // Google Search Simulation
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
        ctr: s.avgCtr || (s.estImpressions > 0 ? (s.estClicks / s.estImpressions) * 100 : 7.5),
        cpc: calculatedCpc,
        cpm: s.estImpressions > 0 ? (s.actualSpend / s.estImpressions) * 1000 : 0,
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

    // Meta Ads Simulation
    if (sub.metaSimulationResult) {
      const m = sub.metaSimulationResult;
      return {
        impressions: m.impressions || 0,
        clicks: m.clicks || 0,
        ctr: m.ctr || 1.6,
        cpc: m.cpc || 0,
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

    // YouTube Simulation
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

    // GDN Simulation
    if (sub.gdnSimulationResult) {
      const g = sub.gdnSimulationResult;
      const cpa = g.assistedConversions > 0 ? Math.round(g.budget / g.assistedConversions) : 0;
      return {
        impressions: g.impressions || 0,
        clicks: g.clicks || 0,
        ctr: g.ctr || 0.6,
        cpc: g.cpc || 0,
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
    const avgCpc = fallbackAvgCpc;
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
      cpc: avgCpc,
      cpm: estImpressions > 0 ? (budget / estImpressions) * 1000 : 0,
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
   * Export Sub-Campaign Report as CSV
   */
  public static exportSubCampaignToCsv(
    sub: SubCampaignItem, 
    masterPlan?: { name?: string; clientName?: string; period?: string; startDate?: string; endDate?: string }
  ): void {
    const m = this.extractSubCampaignMetrics(sub);
    const isLeadGen = sub.businessModel !== 'ECOMMERCE';
    const locNames = (sub.targetLocations || []).map(l => l.name).join(' | ') || 'Tüm Türkiye';
    const keywords: KeywordMetric[] = sub.selectedKeywords && sub.selectedKeywords.length > 0 
      ? sub.selectedKeywords 
      : (sub.discoveredKeywords || []);

    const validCpcs = keywords.map(k => (Number(k.lowCpc) + Number(k.highCpc)) / 2).filter(v => v > 0.5);
    const poolFallbackAvg = validCpcs.length > 0 ? (validCpcs.reduce((a, b) => a + b, 0) / validCpcs.length) : (m.cpc > 0 ? m.cpc : 18.5);

    const lines: string[] = [];

    // Header Meta
    lines.push('ROASIST MARKETING INTELLIGENCE OS - ALT KAMPANYA MEDYA PLANI VE PERFORMANS PROJEKSİYONU');
    lines.push(`"Rapor Tarihi", "${new Date().toLocaleString('tr-TR')}"`);
    if (masterPlan?.name) lines.push(`"Master Kampanya", "${masterPlan.name.replace(/"/g, '""')}"`);
    if (masterPlan?.clientName) lines.push(`"Müşteri / Marka", "${masterPlan.clientName.replace(/"/g, '""')}"`);
    if (masterPlan?.period) lines.push(`"Kampanya Dönemi", "${masterPlan.period.replace(/"/g, '""')}"`);
    lines.push(`"Alt Kampanya Adı", "${(sub.name || 'Alt Kampanya').replace(/"/g, '""')}"`);
    lines.push(`"Platform / Kanal", "${sub.platform} (${sub.objective})"`);
    lines.push(`"Hedef Dil", "${sub.languageFlag || ''} ${sub.languageName || sub.languageCode || 'Türkçe'}"`);
    lines.push(`"Hedef Lokasyonlar", "${locNames.replace(/"/g, '""')}"`);
    lines.push(`"İş Modeli", "${isLeadGen ? 'B2B & Nitelikli Talep (Lead Gen)' : 'E-Ticaret & Satış'}"`);
    lines.push(`"Aylık Bütçe", "₺${(sub.monthlyBudget || 0).toLocaleString('tr-TR')}"`);
    lines.push(`"Günlük Ortalama Bütçe", "₺${Math.round((sub.monthlyBudget || 0) / 30.4).toLocaleString('tr-TR')}"`);
    lines.push('');

    // Section 1: KPI Summary
    lines.push('--- BÖLÜM 1: TAHMİNİ PERFORMANS VE DÖNÜŞÜM HUNİSİ (KPI) ---');
    lines.push('"Metrik", "Tahmini Değer", "Birim", "Açıklama"');
    lines.push(`"Aylık Medya Bütçesi", "${sub.monthlyBudget || 0}", "₺", "Kanal için ayrılan aylık net bütçe"`);
    lines.push(`"Tahmini Gösterim (Impressions)", "${m.impressions}", "Adet", "Pazar içi hedeflenen toplam gösterim"`);
    lines.push(`"Tahmini Tıklama / Trafik (Clicks)", "${m.clicks}", "Adet", "Siteye/Landing Page'e çekilecek trafik"`);
    lines.push(`"Tahmini Tıklama Oranı (CTR)", "%${m.ctr.toFixed(2)}", "%", "Gösterim / Tıklama verimliliği"`);
    lines.push(`"Tahmini Tıklama Başı Maliyet (CPC)", "₺${m.cpc.toFixed(2)}", "₺", "Ortalama TBM"`);
    lines.push(`"Tahmini Brüt Dönüşüm (Leads/Sales)", "${m.conversions}", "Adet", "Form, WhatsApp, Arama veya Satış"`);
    if (isLeadGen) {
      lines.push(`"Tahmini Nitelikli Talep (Healthy/SQL)", "${m.healthyLeads}", "Adet", "Doğrulanmış ve satışa uygun lead sayısı"`);
      lines.push(`"Nitelikli Lead Başı Maliyet (CPQL)", "₺${m.cpql.toLocaleString('tr-TR')}", "₺", "Cost per Qualified Lead"`);
      lines.push(`"Tahmini Kapanan Müşteri (Deals)", "${m.deals}", "Adet", "Satışa dönüşen nihai müşteri"`);
      lines.push(`"Müşteri Edinme Maliyeti (CAC)", "₺${m.cac.toLocaleString('tr-TR')}", "₺", "Cost per Acquisition"`);
    }
    lines.push(`"Tahmini Ciro Projeksiyonu", "₺${m.revenue.toLocaleString('tr-TR')}", "₺", "Model bazlı tahmini toplam gelir"`);
    lines.push(`"Tahmini ROAS (Yatırım Getirisi)", "${m.roas.toFixed(1)}x", "Kat", "Gelir / Harcama Çarpanı"`);
    lines.push('');

    // Section 2: Keywords (if any)
    if (keywords.length > 0) {
      lines.push(`--- BÖLÜM 2: SEÇİLEN ANAHTAR KELİMELER VE TBM REKABET ANALİZİ (${keywords.length} Kelime) ---`);
      lines.push('"Anahtar Kelime", "Arama Niyeti", "Aylık Hacim", "3 Aylık Trend", "Rekabet", "Min TBM (₺)", "Max TBM (₺)", "Ort TBM (₺)", "Fırsat Skoru", "AI Stratejist Önerisi"');
      keywords.forEach(k => {
        const cpc = this.sanitizeKeyword(k, poolFallbackAvg);
        lines.push([
          `"${k.keyword.replace(/"/g, '""')}"`,
          `"${k.intent || 'COMMERCIAL'}"`,
          k.monthlyVolume || 0,
          `"${(k.trendChangePercent || 0) >= 0 ? '+' : ''}${k.trendChangePercent || 0}%"`,
          `"${k.competition || 'MEDIUM'}"`,
          cpc.lowCpc.toFixed(2),
          cpc.highCpc.toFixed(2),
          cpc.avgCpc.toFixed(2),
          k.opportunityScore || 80,
          `"${k.isAiStrategistPick ? 'EVET (Yüksek Dönüşümlü)' : 'Standart'}"`
        ].join(','));
      });
      lines.push('');
    }

    // Section 3: Negatives (if any)
    if (sub.negativeCategories && sub.negativeCategories.length > 0) {
      lines.push('--- BÖLÜM 3: NEGATİF KELİME KATEGORİLERİ VE BÜTÇE KORUMASI ---');
      lines.push('"Negatif Kategori", "Kelime Adedi", "Örnek Negatif Terimler"');
      sub.negativeCategories.forEach((n: NegativeCategory) => {
        const words = Array.isArray(n.words) ? n.words.join(', ') : '';
        const count = Array.isArray(n.words) ? n.words.length : 0;
        lines.push(`"${n.category.replace(/"/g, '""')}", "${count}", "${words.replace(/"/g, '""')}"`);
      });
      lines.push('');
    }

    // Section 4: Parameters & Funnel Setup
    lines.push('--- BÖLÜM 4: KAMPANYA VE DÖNÜŞÜM HUNİSİ HESAPLAMA PARAMETRELERİ ---');
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

    const csvString = lines.join('\n');
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    const safeName = (sub.name || 'Alt_Kampanya').replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ]/gi, '_');
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
    masterPlan?: { name?: string; clientName?: string; period?: string; startDate?: string; endDate?: string }
  ): void {
    const m = this.extractSubCampaignMetrics(sub);
    const isLeadGen = sub.businessModel !== 'ECOMMERCE';
    const locNames = (sub.targetLocations || []).map(l => l.name).join(', ') || 'Tüm Türkiye';
    const keywords: KeywordMetric[] = sub.selectedKeywords && sub.selectedKeywords.length > 0 
      ? sub.selectedKeywords 
      : (sub.discoveredKeywords || []);
    const poolFallbackAvg = keywords.length > 0 
      ? (keywords.reduce((sum, k) => sum + (k.highCpc || k.lowCpc || 0), 0) / keywords.length || 18.5) 
      : 18.5;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const safeTitle = `${sub.name || 'Alt Kampanya'} - Roasist Medya Raporu`;

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
            grid-template-columns: repeat(4, 1fr);
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
            grid-template-columns: repeat(5, 1fr);
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
              <div style="font-weight: 700; font-size: 15px;">Roasist Yönetici Medya Planı & Alt Kampanya Raporu</div>
              <div style="font-size: 12px; opacity: 0.8;">Baskı önizlemesi hazır. PDF olarak kaydetmek için butona tıklayın.</div>
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
              <div><strong>Rapor ID:</strong> #${sub.id.slice(-8)}</div>
              <div><strong>Durum:</strong> Onaylı & Hazır Medya Planı</div>
            </div>
          </div>

          <!-- Campaign Main Banner -->
          <div class="campaign-title-box">
            <h1>
              <span>${sub.languageFlag || '🌐'}</span>
              <span>${sub.name || 'Alt Kampanya'}</span>
            </h1>
            <div style="font-size: 13px; color: #475569;">
              ${masterPlan?.name ? `<strong>Çatı Kampanya:</strong> ${masterPlan.name} • ` : ''}
              ${masterPlan?.clientName ? `<strong>Müşteri:</strong> ${masterPlan.clientName} • ` : ''}
              <strong>Platform:</strong> ${sub.platform} (${sub.objective})
            </div>

            <div class="campaign-details-grid">
              <div class="detail-item">
                <strong>Aylık Net Bütçe</strong>
                <span style="color: #2563eb; font-size: 15px; font-weight: 800;">₺${(sub.monthlyBudget || 0).toLocaleString('tr-TR')}</span>
                <div style="font-size: 10px; color: #64748b;">(₺${Math.round((sub.monthlyBudget || 0) / 30.4).toLocaleString('tr-TR')} / gün)</div>
              </div>
              <div class="detail-item">
                <strong>Hedef Dil</strong>
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
            </div>
          </div>

          <!-- KPI Cards Grid -->
          <div class="stat-grid">
            <div class="stat-card">
              <div class="stat-label">Aylık Medya Yatırımı</div>
              <div class="stat-value" style="color: #2563eb;">₺${(sub.monthlyBudget || 0).toLocaleString('tr-TR')}</div>
              <div class="stat-sub">Günlük ₺${Math.round((sub.monthlyBudget || 0) / 30.4).toLocaleString('tr-TR')}</div>
            </div>

            <div class="stat-card">
              <div class="stat-label">Tahmini Gösterim & TO</div>
              <div class="stat-value">${m.impressions.toLocaleString('tr-TR')}</div>
              <div class="stat-sub">CTR: %${m.ctr.toFixed(2)} • ${m.clicks.toLocaleString('tr-TR')} Tıklama</div>
            </div>

            <div class="stat-card ${isLeadGen ? 'emerald' : ''}">
              <div class="stat-label">${isLeadGen ? 'Nitelikli Lead (CPQL)' : 'Tahmini Satış (CPA)'}</div>
              <div class="stat-value" style="color: #16a34a;">${(isLeadGen ? m.healthyLeads : m.conversions).toLocaleString('tr-TR')} Adet</div>
              <div class="stat-sub">${isLeadGen ? `CPQL: ₺${m.cpql.toLocaleString('tr-TR')}` : `CPA: ₺${m.cpl.toLocaleString('tr-TR')}`}</div>
            </div>

            <div class="stat-card emerald">
              <div class="stat-label">Tahmini Ciro & ROAS</div>
              <div class="stat-value" style="color: #16a34a;">₺${m.revenue.toLocaleString('tr-TR')}</div>
              <div class="stat-sub">Tahmini ROAS: <strong>${m.roas.toFixed(1)}x</strong> ${m.deals > 0 ? `(${m.deals} Müşteri)` : ''}</div>
            </div>
          </div>

          <!-- Conversion Funnel Projections -->
          <div class="section-title">
            <span>🎯</span>
            <span>Uçtan Uca Büyüme & Dönüşüm Hunisi Projeksiyonu</span>
          </div>

          <div class="funnel-box">
            <div class="funnel-step">
              <div class="val">${m.impressions.toLocaleString('tr-TR')}</div>
              <div class="lbl">Pazar Gösterimi</div>
              <div class="rate">${m.marketShare > 0 ? `%${m.marketShare} IS` : 'Reach'}</div>
            </div>

            <div class="funnel-step">
              <div class="val">${m.clicks.toLocaleString('tr-TR')}</div>
              <div class="lbl">Nitelikli Trafik</div>
              <div class="rate">%${m.ctr.toFixed(1)} TO (CTR)</div>
            </div>

            <div class="funnel-step">
              <div class="val">${m.conversions.toLocaleString('tr-TR')}</div>
              <div class="lbl">Brüt Talep / Satış</div>
              <div class="rate">₺${m.cpl.toLocaleString('tr-TR')} CPL</div>
            </div>

            <div class="funnel-step" style="border-color: #86efac; background: #f0fdf4;">
              <div class="val" style="color: #16a34a;">${(isLeadGen ? m.healthyLeads : m.conversions).toLocaleString('tr-TR')}</div>
              <div class="lbl">${isLeadGen ? 'Nitelikli SQL Lead' : 'Net Sipariş'}</div>
              <div class="rate" style="background:#dcfce7; color:#166534;">₺${m.cpql.toLocaleString('tr-TR')} CPQL</div>
            </div>

            <div class="funnel-step" style="border-color: #86efac; background: #f0fdf4;">
              <div class="val" style="color: #16a34a;">₺${m.revenue.toLocaleString('tr-TR')}</div>
              <div class="lbl">Toplam Ciro</div>
              <div class="rate" style="background:#dcfce7; color:#166534;">${m.roas.toFixed(1)}x ROAS</div>
            </div>
          </div>

          <!-- Keywords Table (if Google Search / Keywords exist) -->
          ${keywords.length > 0 ? `
          <div class="section-title">
            <span>🔍</span>
            <span>Hedeflenen Anahtar Kelimeler & TBM Fırsat Analizi (${keywords.length} Kelime)</span>
          </div>

          <table>
            <thead>
              <tr>
                <th>Anahtar Kelime</th>
                <th>Niyet</th>
                <th style="text-align:right;">Aylık Hacim</th>
                <th style="text-align:right;">Trend</th>
                <th>Rekabet</th>
                <th style="text-align:right;">Min TBM</th>
                <th style="text-align:right;">Max TBM</th>
                <th style="text-align:right;">Ort TBM</th>
                <th style="text-align:center;">Fırsat Skoru</th>
              </tr>
            </thead>
            <tbody>
              ${keywords.slice(0, 40).map(k => {
                const cpc = this.sanitizeKeyword(k, poolFallbackAvg);
                const intentClass = k.intent === 'TRANSACTIONAL' ? 'badge-intent-trans' : (k.intent === 'INFORMATIONAL' ? 'badge-intent-info' : 'badge-intent-comm');
                const intentLabel = k.intent === 'TRANSACTIONAL' ? 'Satın Alma' : (k.intent === 'INFORMATIONAL' ? 'Bilgi' : 'Ticari');
                return `
                  <tr>
                    <td>
                      <strong>${k.keyword}</strong>
                      ${k.isAiStrategistPick ? '<span class="badge badge-ai-pick" style="margin-left: 4px;">✨ SEM Önerisi</span>' : ''}
                    </td>
                    <td><span class="badge ${intentClass}">${intentLabel}</span></td>
                    <td style="text-align:right; font-weight:700;">${(k.monthlyVolume || 0).toLocaleString('tr-TR')}</td>
                    <td style="text-align:right; color: ${(k.trendChangePercent || 0) >= 0 ? '#16a34a' : '#dc2626'}; font-weight:600;">
                      ${(k.trendChangePercent || 0) >= 0 ? '+' : ''}${k.trendChangePercent || 0}%
                    </td>
                    <td><span style="font-size:11px; color:#64748b;">${k.competition === 'HIGH' ? 'Yüksek' : (k.competition === 'LOW' ? 'Düşük' : 'Orta')}</span></td>
                    <td style="text-align:right;">₺${cpc.lowCpc.toFixed(2)}</td>
                    <td style="text-align:right;">₺${cpc.highCpc.toFixed(2)}</td>
                    <td style="text-align:right; font-weight:700; color:#2563eb;">₺${cpc.avgCpc.toFixed(2)}</td>
                    <td style="text-align:center;">
                      <span style="font-weight:800; color:${(k.opportunityScore || 80) >= 85 ? '#16a34a' : '#2563eb'};">${k.opportunityScore || 80}</span>/100
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          ${keywords.length > 40 ? `<div style="font-size:11px; color:#64748b; margin-top:6px; font-style:italic;">* İlk 40 anahtar kelime gösterilmektedir. Listenin tamamı (${keywords.length} kelime) CSV dışa aktarımında mevcuttur.</div>` : ''}
          ` : ''}

          <!-- Negative Safeguards -->
          ${sub.negativeCategories && sub.negativeCategories.length > 0 ? `
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
          <div class="section-title">
            <span>💡</span>
            <span>Stratejik Uygulama & Kampanya Başlatma Notları</span>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; font-size: 12px; color: #334155; line-height: 1.6;">
            <p style="margin-bottom: 6px;">• <strong>Hedefleme Optimizasyonu:</strong> Bu alt kampanya ${sub.languageName || 'belirlenen dilde'} ve seçilen ${locNames} coğrafi bölgesinde en yüksek satın alma niyetine sahip kitleye odaklanacak şekilde modellenmiştir.</p>
            <p style="margin-bottom: 6px;">• <strong>Bütçe Dağılımı:</strong> Aylık ₺${(sub.monthlyBudget || 0).toLocaleString('tr-TR')} bütçe ile günlük ₺${Math.round((sub.monthlyBudget || 0) / 30.4).toLocaleString('tr-TR')} harcama tavanı öngörülmüştür.</p>
            <p>• <strong>Dönüşüm Takibi:</strong> Kampanya canlıya alınmadan önce dönüşüm piksellerinin (Google Ads Enhanced Conversions / Meta CAPI) doğrulanması tavsiye edilir.</p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div>© ${new Date().getFullYear()} Roasist Marketing Intelligence OS • Tüm hakları saklıdır.</div>
            <div>Gizli & Kurumsal Medya Raporu • ${masterPlan?.clientName || 'Roasist Client'}</div>
          </div>

        </div>

        <script>
          // Automatically prompt print dialog after font and resources load
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
