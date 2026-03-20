import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/database';
import { Settings } from '../types';

export const useDatabase = () => {
  const [settings, setSettings] = useState<Settings>({
    id: 1,
    hourlyRate: 0,
    standardHours: 8,
    lunchDuration: 1,
    currency: '₽',
    updatedAt: ''
  });

  useEffect(() => {
    setSettings(db.getSettings());
    
    const unsubscribe = db.subscribe(() => {
      setSettings(db.getSettings());
    });
    return unsubscribe;
  }, []);

  const updateHourlyRate = useCallback((rate: number) => {
    db.updateSettings({ hourlyRate: rate });
    setSettings(db.getSettings());
  }, []);

  const updateStandardHours = useCallback((hours: number) => {
    db.updateSettings({ standardHours: hours });
    setSettings(db.getSettings());
  }, []);

  const updateLunchDuration = useCallback((hours: number) => {
    db.updateSettings({ lunchDuration: hours });
    setSettings(db.getSettings());
  }, []);

  const updateCurrency = useCallback((currency: string) => {
    db.updateSettings({ currency });
    setSettings(db.getSettings());
  }, []);

  return {
    settings,
    updateHourlyRate,
    updateStandardHours,
    updateLunchDuration,
    updateCurrency
  };
};
