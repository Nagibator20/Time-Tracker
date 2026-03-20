import { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../services/database';
import { TimeRecord, TimeRecordInput } from '../types';

interface UseTimeRecordsParams {
  tabId: string | null;
  year?: number;
  month?: number;
}

export const useTimeRecords = ({ tabId, year, month }: UseTimeRecordsParams) => {
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRecords = useCallback(() => {
    if (!tabId) {
      setRecords([]);
      return;
    }
    setLoading(true);
    try {
      const data = db.getTimeRecords(tabId);
      setRecords(data);
    } finally {
      setLoading(false);
    }
  }, [tabId]);

  useEffect(() => {
    loadRecords();
    
    const unsubscribe = db.subscribe(() => {
      loadRecords();
    });
    
    return unsubscribe;
  }, [loadRecords]);

  const filteredRecords = useMemo(() => {
    if (year === undefined || month === undefined) {
      return records;
    }
    const monthStr = (month + 1).toString().padStart(2, '0');
    return records.filter(r => r.date.startsWith(`${year}-${monthStr}`));
  }, [records, year, month]);

  const updateRecord = useCallback((date: string, input: TimeRecordInput) => {
    if (!tabId) return;
    db.updateTimeRecord(tabId, date, input);
    loadRecords();
  }, [tabId, loadRecords]);

  const getTotals = useCallback(() => {
    return filteredRecords.reduce((acc, record) => ({
      totalHours: acc.totalHours + record.hoursWorked,
      totalEarnings: acc.totalEarnings + record.dailyEarnings,
      totalOvertime: acc.totalOvertime + record.overtimeHours,
      totalUndertime: acc.totalUndertime + record.undertimeHours
    }), { totalHours: 0, totalEarnings: 0, totalOvertime: 0, totalUndertime: 0 });
  }, [filteredRecords]);

  return {
    records: filteredRecords,
    loading,
    updateRecord,
    getTotals,
    refresh: loadRecords
  };
}
