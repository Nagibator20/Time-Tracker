import { TimeRecord } from '../types';
import { formatDate, getDayName } from '../services/dateUtils';
import { formatHours } from './formatters';

export const exportToCSV = (records: TimeRecord[], tabName: string) => {
  const headers = ['Дата', 'День', 'Приход', 'Уход', 'Отработано', 'Переработка', 'Недоработка', 'Заработано'];
  
  const rows = records.map(r => [
    formatDate(new Date(r.date)),
    getDayName(new Date(r.date)),
    r.timeIn || '',
    r.timeOut || '',
    formatHours(r.hoursWorked),
    formatHours(r.overtimeHours),
    formatHours(r.undertimeHours),
    r.dailyEarnings.toString()
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.join(';'))
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `report_${tabName.replace(/\s+/g, '_')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
