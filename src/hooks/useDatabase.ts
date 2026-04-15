import { useCallback } from 'react';
import { useAppStore } from '../store';

export const useDatabase = () => {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);

  const updateHourlyRate = useCallback((rate: number) => {
    updateSettings({ hourlyRate: rate });
  }, [updateSettings]);

  const updateStandardHours = useCallback((hours: number) => {
    updateSettings({ standardHours: hours });
  }, [updateSettings]);

  const updateLunchDuration = useCallback((hours: number) => {
    updateSettings({ lunchDuration: hours });
  }, [updateSettings]);

  const updateCurrency = useCallback((currency: string) => {
    updateSettings({ currency });
  }, [updateSettings]);

  return {
    settings,
    updateHourlyRate,
    updateStandardHours,
    updateLunchDuration,
    updateCurrency
  };
};
