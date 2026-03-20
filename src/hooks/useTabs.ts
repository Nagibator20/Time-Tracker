import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/database';
import { Tab } from '../types';
import { getMonthName } from '../services/dateUtils';

interface NextMonthInfo {
  name: string;
  year: number;
  month: number;
}

export const useTabs = () => {
  const [tabs, setTabs] = useState<Tab[]>(db.getTabs());
  const [activeTabId, setActiveTabIdState] = useState<string | null>(
    db.getActiveTabId() || (tabs.length > 0 ? tabs[0].id : null)
  );

  const setActiveTabId = useCallback((id: string | null) => {
    setActiveTabIdState(id);
    db.setActiveTabId(id);
  }, []);

  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      setTabs(db.getTabs());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    setTabs(db.getTabs());
    const currentTabs = db.getTabs();
    const currentActive = db.getActiveTabId();
    
    if (currentTabs.length > 0) {
      if (!currentActive || !currentTabs.some(t => t.id === currentActive)) {
        setActiveTabId(currentTabs[0].id);
      }
    } else {
      setActiveTabId(null);
    }
  }, []);

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

  const createTab = useCallback(() => {
    const currentTabs = db.getTabs();
    const { name, year, month } = getNextMonthInfo(currentTabs);
    const newTab = db.createTab(name, year, month);
    setTabs(db.getTabs());
    setActiveTabId(newTab.id);
    return newTab;
  }, [getNextMonthInfo]);

  const renameTab = useCallback((id: string, name: string) => {
    db.updateTab(id, { name });
    setTabs(db.getTabs());
  }, []);

  const deleteTab = useCallback((id: string) => {
    db.deleteTab(id);
    setTabs(db.getTabs());
    if (activeTabId === id) {
      const remainingTabs = db.getTabs();
      setActiveTabId(remainingTabs.length > 0 ? remainingTabs[0].id : null);
    }
  }, [activeTabId]);

  return {
    tabs,
    activeTabId,
    setActiveTabId,
    createTab,
    renameTab,
    deleteTab
  };
};
