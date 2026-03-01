import { DieHistoryEntry } from './types';

interface CompletedOrder {
    id: string;
    articolo: string;
    numeroBarra?: string;
    lega: string;
    billette: number;
    logsDecimali: number;
    logName: string;
    cut: number;
    completedAt: string;
}

interface ReportData {
    entries: DieHistoryEntry[];
    completedOrders: CompletedOrder[];
    filterLabel: string;
    generatedAt: string;
}

export function generateReportHTML(data: ReportData): string {
    const { entries, completedOrders, filterLabel, generatedAt } = data;

    // Stats from die_history
    const totalBillette = entries.reduce((s, e) => s + e.billetteEstruse, 0);
    const totalEntries = entries.length;
    const uniqueArticoli = [...new Set(entries.map(e => e.articolo))];
    const uniqueOperatori = [...new Set(entries.filter(e => e.operatore).map(e => e.operatore!))];
    const avgScarto = entries.filter(e => e.scartoReale != null).length > 0
        ? (entries.filter(e => e.scartoReale != null).reduce((s, e) => s + (e.scartoReale || 0), 0) / entries.filter(e => e.scartoReale != null).length).toFixed(0)
        : '—';

    // Stats from completed orders
    const totalOrderBillette = completedOrders.reduce((s, o) => s + o.billette, 0);
    const totalOrderLogs = completedOrders.reduce((s, o) => s + o.logsDecimali, 0);

    // Die history rows
    const dieRows = entries.map((e, i) => `
    <tr style="background:${i % 2 === 0 ? '#0f172a' : '#1e293b'};">
      <td style="padding:5px 8px;font-weight:700;color:#e2e8f0;">${e.articolo}</td>
      <td style="padding:5px 8px;color:#818cf8;font-weight:700;">${e.numeroBarra}</td>
      <td style="padding:5px 8px;color:#34d399;font-weight:800;text-align:center;">${e.billetteEstruse}</td>
      <td style="padding:5px 8px;color:#fbbf24;text-align:center;">${e.scartoReale != null ? `~${e.scartoReale}mm` : '—'}</td>
      <td style="padding:5px 8px;text-align:center;">
        ${e.turno ? `<span style="background:#312e81;color:#a5b4fc;padding:1px 6px;border-radius:3px;font-size:9px;font-weight:700;">${e.turno}°</span>` : '—'}
      </td>
      <td style="padding:5px 8px;color:#94a3b8;">${e.operatore || '—'}</td>
      <td style="padding:5px 8px;color:#64748b;font-style:italic;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px;">${e.note || ''}</td>
      <td style="padding:5px 8px;color:#475569;font-size:10px;">${new Date(e.dataCreazione).toLocaleDateString('it-IT')}</td>
    </tr>
  `).join('');

    // Completed orders rows
    const orderRows = completedOrders.map((o, i) => `
    <tr style="background:${i % 2 === 0 ? '#0f172a' : '#1e293b'};">
      <td style="padding:5px 8px;font-weight:700;color:#e2e8f0;">${o.articolo}</td>
      <td style="padding:5px 8px;color:#818cf8;font-weight:700;">${o.numeroBarra || '—'}</td>
      <td style="padding:5px 8px;color:#fbbf24;font-weight:600;">${o.lega || '—'}</td>
      <td style="padding:5px 8px;color:#34d399;font-weight:800;text-align:center;">${o.billette}</td>
      <td style="padding:5px 8px;color:#22d3ee;text-align:center;">${o.logsDecimali.toFixed(1)}</td>
      <td style="padding:5px 8px;color:#94a3b8;">${o.logName}</td>
      <td style="padding:5px 8px;color:#a5b4fc;text-align:center;">${o.cut}mm</td>
      <td style="padding:5px 8px;color:#475569;font-size:10px;">${o.completedAt}</td>
    </tr>
  `).join('');

    return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
    @page { size: A4; margin: 0; }
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body {
      width: 210mm;
      font-family: 'Inter', -apple-system, sans-serif;
      background: #020617;
      color: #e2e8f0;
      font-size: 11px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      width: 210mm;
      padding: 18mm 16mm 14mm 16mm;
      position: relative;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      border-bottom: 1.5px solid #1e293b;
      padding-bottom: 10px;
    }
    .header h1 { font-size: 18px; font-weight: 900; letter-spacing: 5px; text-transform: uppercase; color: #f8fafc; }
    .header .sub { font-size: 8px; letter-spacing: 2px; color: #64748b; text-transform: uppercase; font-weight: 700; }
    .meta { text-align: right; }
    .meta .filter { font-size: 11px; font-weight: 800; color: #818cf8; letter-spacing: 1px; text-transform: uppercase; }
    .meta .ts { font-size: 8px; color: #475569; }
    .stats { display: flex; gap: 8px; margin-bottom: 14px; }
    .stat { flex: 1; background: #0f172a; border: 1px solid #1e293b; border-radius: 6px; padding: 10px 12px; }
    .stat .lbl { font-size: 7px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin-bottom: 2px; }
    .stat .val { font-size: 20px; font-weight: 900; }
    .green { color: #34d399; }
    .indigo { color: #818cf8; }
    .amber { color: #fbbf24; }
    .cyan { color: #22d3ee; }
    .unit { font-size: 9px; color: #475569; margin-left: 2px; }
    .stitle { font-size: 8px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 2px; margin-bottom: 6px; margin-top: 16px; }
    .ops { display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px; }
    .ops span { background:#1e293b;color:#94a3b8;padding:2px 8px;border-radius:4px;font-size:9px;font-weight:700; }
    table { width: 100%; border-collapse: collapse; border-radius: 6px; overflow: hidden; margin-bottom: 14px; font-size: 10px; }
    thead th { background: #1e293b; padding: 6px 8px; font-size: 7px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; text-align: left; }
    thead th.c { text-align: center; }
    .foot {
      border-top: 1px solid #1e293b;
      padding-top: 8px;
      display: flex;
      justify-content: space-between;
      font-size: 7px;
      color: #334155;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div>
        <h1>EXTRUCALC</h1>
        <div class="sub">Ø206 Extrusion Engine — Report Produzione</div>
      </div>
      <div class="meta">
        <div class="filter">${filterLabel}</div>
        <div class="ts">Generato il ${generatedAt}</div>
      </div>
    </div>

    <div class="stats">
      <div class="stat"><div class="lbl">Ordini Completati</div><div class="val indigo">${completedOrders.length}</div></div>
      <div class="stat"><div class="lbl">Billette Ordini</div><div class="val green">${totalOrderBillette}</div></div>
      <div class="stat"><div class="lbl">Logs Usati</div><div class="val cyan">${totalOrderLogs.toFixed(1)}</div></div>
      <div class="stat"><div class="lbl">Scarto Medio</div><div class="val amber">${avgScarto}<span class="unit">mm</span></div></div>
    </div>

    ${completedOrders.length > 0 ? `
    <div class="stitle">Ordini Completati</div>
    <table>
      <thead>
        <tr>
          <th>Articolo</th>
          <th>Barra</th>
          <th>Lega</th>
          <th class="c">Billette</th>
          <th class="c">Logs</th>
          <th>Tipo Log</th>
          <th class="c">Taglio</th>
          <th>Completato</th>
        </tr>
      </thead>
      <tbody>
        ${orderRows}
      </tbody>
    </table>
    ` : ''}

    ${entries.length > 0 ? `
    ${uniqueOperatori.length > 0 ? `
    <div class="stitle">Operatori</div>
    <div class="ops">${uniqueOperatori.map(op => `<span>${op}</span>`).join('')}</div>
    ` : ''}

    <div class="stitle">Dettaglio Lavorazioni Matrici (${totalEntries} sessioni — ${totalBillette} billette)</div>
    <table>
      <thead>
        <tr>
          <th>Articolo</th>
          <th>Barra</th>
          <th class="c">Bill.</th>
          <th class="c">Scarto</th>
          <th class="c">Turno</th>
          <th>Operatore</th>
          <th>Note</th>
          <th>Data</th>
        </tr>
      </thead>
      <tbody>
        ${dieRows}
      </tbody>
    </table>
    ` : ''}

    <div class="foot">
      <span>© ${new Date().getFullYear()} EXTRUCALC — Ø206</span>
      <span>Report generato • ${generatedAt}</span>
    </div>
  </div>
</body>
</html>`;
}
