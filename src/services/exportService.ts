import { AdItem, Competitor } from '../types/ad';

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
}
