import { useCallback } from 'react';
import { useAppStore } from '../store';
import { Tab } from '../types';
import { getMonthName } from '../services/dateUtils';

interface NextMonthInfo {
  name: string;
  year: number;
  month: number;
}

export const useTabs = () => {
  const tabs = useAppStore((s) => s.getSortedTabs());
  const activeTabId = useAppStore((s) => s.activeTabId);
  const setActiveTabId = useAppStore((s) => s.setActiveTabId);
  const createTab = useAppStore((s) => s.createTab);
  const updateTab = useAppStore((s) => s.updateTab);
  const deleteTab = useAppStore((s) => s.deleteTab);
  const restoreDeletedTab = useAppStore((s) => s.restoreDeletedTab);
  const deletedTab = useAppStore((s) => s.deletedTab);

  const getNextMonthInfo = useCallback((existingTabs: Tab[]): NextMonthInfo => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const usedNames = new Set(existingTabs.map(t => t.name));

    for (let i = 0; i < 24; i++) {
      const monthIndex = (currentMonth + existingTabs.length + i) % 12;
      const yearOffset = Math.floor((currentMonth + existingTabs.length + i) / 12);
      const year = currentYear + yearOffset;
      const name = `${getMonthName(monthIndex)} ${year}`;
      
      if (!usedNames.has(name)) {
        return { name, year, month: monthIndex };
      }
    }

    const monthIndex = (currentMonth + existingTabs.length) % 12;
    const yearOffset = Math.floor((currentMonth + existingTabs.length) / 12);
    return {
      name: `${getMonthName(monthIndex)} ${currentYear + yearOffset} ${existingTabs.length + 1}`,
      year: currentYear + yearOffset,
      month: monthIndex
    };
  }, []);

  const handleCreateTab = useCallback(() => {
    const { name, year, month } = getNextMonthInfo(tabs);
    return createTab(name, year, month);
  }, [createTab, getNextMonthInfo, tabs]);

  const renameTab = useCallback((id: string, name: string) => {
    updateTab(id, { name });
  }, [updateTab]);

  const handleDeleteTab = useCallback((id: string) => {
    deleteTab(id);
  }, [deleteTab]);

  return {
    tabs,
    activeTabId,
    setActiveTabId,
    createTab: handleCreateTab,
    renameTab,
    deleteTab: handleDeleteTab,
    restoreDeletedTab,
    deletedTab,
  };
};
