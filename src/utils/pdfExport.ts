import { TimeRecord, Tab } from '../types';
import { formatDate, getDayName } from '../services/dateUtils';
import { formatHours } from '../utils/formatters';

interface ExportOptions {
  records: TimeRecord[];
  tab: Tab;
  settings: {
    hourlyRate: number;
    standardHours: number;
    lunchDuration: number;
    currency: string;
  };
}

const buildPrintableHTML = ({ records, tab, settings }: ExportOptions): string => {
  const totalHours = records.reduce((sum, r) => sum + r.hoursWorked, 0);
  const totalOvertime = records.reduce((sum, r) => sum + r.overtimeHours, 0);
  const totalUndertime = records.reduce((sum, r) => sum + r.undertimeHours, 0);
  const workingDays = records.filter(r => r.timeIn && r.timeOut).length;

  const rows = records
    .map(
      r => `
    <tr>
      <td>${formatDate(new Date(r.date))}</td>
      <td>${getDayName(new Date(r.date))}</td>
      <td>${r.timeIn || '—'}</td>
      <td>${r.timeOut || '—'}</td>
      <td>${r.hoursWorked > 0 ? formatHours(r.hoursWorked) : '—'}</td>
      <td>${r.overtimeHours > 0 ? formatHours(r.overtimeHours) : '—'}</td>
      <td>${r.undertimeHours > 0 ? formatHours(r.undertimeHours) : '—'}</td>
    </tr>
  `
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${tab.name} — Отчёт</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; padding: 24px; background: #f5f5f5; }
    .page { max-width: 900px; margin: 0 auto; background: #fff; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-radius: 4px; }
    h1 { font-size: 22px; margin-bottom: 4px; color: #111; }
    .subtitle { font-size: 13px; color: #666; margin-bottom: 20px; }
    .summary { display: flex; gap: 24px; margin-bottom: 24px; flex-wrap: wrap; }
    .summary-item { font-size: 14px; }
    .summary-item strong { display: block; font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 2px; }
    .summary-item span { font-size: 18px; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
    th { background: #f5f5f5; font-weight: 600; }
    tr:nth-child(even) { background: #fafafa; }
    tfoot td { font-weight: 700; background: #f0f0f0; }
    .print-btn { position: fixed; top: 16px; right: 16px; padding: 10px 20px; background: #3b82f6; color: #fff; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; font-weight: 600; }
    .print-btn:hover { background: #2563eb; }
    @media print {
      body { padding: 0; background: #fff; }
      .page { box-shadow: none; padding: 0; max-width: 100%; }
      .print-btn { display: none; }
      @page { margin: 1.5cm; }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">Сохранить как PDF</button>
  <div class="page">
    <h1>${tab.name}</h1>
    <p class="subtitle">Норма: ${settings.standardHours}ч · Обед: ${settings.lunchDuration}ч</p>
    <div class="summary">
      <div class="summary-item"><strong>Отработано</strong><span>${formatHours(totalHours)}</span></div>
      <div class="summary-item"><strong>Переработка</strong><span>${formatHours(totalOvertime)}</span></div>
      <div class="summary-item"><strong>Недоработка</strong><span>${formatHours(totalUndertime)}</span></div>
      <div class="summary-item"><strong>Рабочих дней</strong><span>${workingDays}</span></div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Дата</th><th>День</th><th>Приход</th><th>Уход</th><th>Отработано</th><th>Переработка</th><th>Недоработка</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr>
          <td colspan="4">ИТОГО</td>
          <td>${formatHours(totalHours)}</td>
          <td>${formatHours(totalOvertime)}</td>
          <td>${formatHours(totalUndertime)}</td>
        </tr>
      </tfoot>
    </table>
  </div>
</body>
</html>`;
};

export const exportToPDF = (options: ExportOptions): void => {
  const html = buildPrintableHTML(options);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  if (!printWindow) {
    URL.revokeObjectURL(url);
    console.error(
      'Не удалось открыть окно для просмотра. Проверьте настройки блокировки всплывающих окон.'
    );
  }
};
