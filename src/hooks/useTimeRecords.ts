import { useCallback, useMemo } from 'react';
import { useAppStore } from '../store';
import { TimeRecordInput } from '../types';

interface UseTimeRecordsParams {
  tabId: string | null;
  year?: number;
  month?: number;
}

export const useTimeRecords = ({ tabId, year, month }: UseTimeRecordsParams) => {
  const timeRecords = useAppStore((s) => s.timeRecords);
  const updateTimeRecord = useAppStore((s) => s.updateTimeRecord);

  const records = useMemo(() => {
    if (!tabId) return [];
    const allRecords = timeRecords.filter((r) => r.tabId === tabId).sort((a, b) => a.date.localeCompare(b.date));
    if (year === undefined || month === undefined) return allRecords;
    const monthStr = (month + 1).toString().padStart(2, '0');
    return allRecords.filter(r => r.date.startsWith(`${year}-${monthStr}`));
  }, [tabId, year, month, timeRecords]);

  const updateRecord = useCallback((date: string, input: TimeRecordInput) => {
    if (!tabId) return;
    updateTimeRecord(tabId, date, input);
  }, [tabId, updateTimeRecord]);

  const getTotals = useCallback(() => {
    const totalMinutes = records.reduce((acc, record) => {
      const h = Math.round(record.hoursWorked * 60);
      const ot = Math.round(record.overtimeHours * 60);
      const ut = Math.round(record.undertimeHours * 60);
      return {
        hours: acc.hours + h,
        overtime: acc.overtime + ot,
        undertime: acc.undertime + ut,
        earnings: acc.earnings + record.dailyEarnings,
      };
    }, { hours: 0, overtime: 0, undertime: 0, earnings: 0 });

    return {
      totalHours: totalMinutes.hours / 60,
      totalEarnings: totalMinutes.earnings,
      totalOvertime: totalMinutes.overtime / 60,
      totalUndertime: totalMinutes.undertime / 60,
    };
  }, [records]);

  return {
    records,
    loading: false,
    updateRecord,
    getTotals,
    refresh: () => {},
  };
}
