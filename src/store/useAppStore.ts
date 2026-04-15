import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { TimeRecord, Tab, Settings, TimeRecordInput } from '../types';
import { formatDateISO, getDaysInMonth } from '../services/dateUtils';
import { TimeCalculator } from '../services/timeCalculator';
import { indexedDBStorage } from './indexedDBStorage';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'time_tracker_data';
const CURRENT_VERSION = 3;

interface StoredData {
  version: number;
  tabs: Tab[];
  timeRecords: TimeRecord[];
  settings: Settings;
  activeTabId: string | null;
  theme: ThemeMode;
}

function loadPersistedData(): Partial<StoredData> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      if (!data.version || data.version < CURRENT_VERSION) {
        data.version = CURRENT_VERSION;
        if (data.settings && data.settings.lunchDuration === undefined) {
          data.settings.lunchDuration = 1;
        }
      }
      if (!Array.isArray(data.tabs)) data.tabs = [];
      if (!Array.isArray(data.timeRecords)) data.timeRecords = [];
      return data;
    }
  } catch {
    // ignore
  }
  return {};
}

function getDefaultSettings(): Settings {
  return {
    id: 1,
    hourlyRate: 0,
    standardHours: 8,
    lunchDuration: 1,
    currency: '₽',
    updatedAt: new Date().toISOString(),
  };
}

function createCalculator(settings: Settings): TimeCalculator {
  const calc = new TimeCalculator(settings.standardHours, settings.hourlyRate, 1.0);
  calc.setLunchDuration(settings.lunchDuration);
  return calc;
}

function generateTimeRecords(tabId: string, year: number, month: number): TimeRecord[] {
  const records: TimeRecord[] = [];
  const daysInMonth = getDaysInMonth(new Date(year, month));

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();

    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      records.push({
        id: uuidv4(),
        tabId,
        date: formatDateISO(date),
        dayOfWeek,
        timeIn: null,
        timeOut: null,
        hoursWorked: 0,
        overtimeHours: 0,
        undertimeHours: 0,
        dailyEarnings: 0,
        comment: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }
  return records;
}

export interface DeletedTabSnapshot {
  tab: Tab;
  records: TimeRecord[];
}

export interface AppState {
  theme: ThemeMode;
  tabs: Tab[];
  timeRecords: TimeRecord[];
  settings: Settings;
  activeTabId: string | null;
  deletedTab: DeletedTabSnapshot | null;

  // Theme
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;

  // Tabs
  setActiveTabId: (id: string | null) => void;
  createTab: (name: string, year: number, month: number) => Tab;
  updateTab: (id: string, updates: Partial<Tab>) => void;
  deleteTab: (id: string) => void;
  restoreDeletedTab: () => void;
  clearDeletedTab: () => void;

  // Settings
  updateSettings: (updates: Partial<Settings>) => void;

  // Time records
  updateTimeRecord: (tabId: string, date: string, input: TimeRecordInput) => void;

  // Helpers
  getSortedTabs: () => Tab[];
  getTabRecords: (tabId: string) => TimeRecord[];

  // Hydration
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;

  // Earnings visibility
  areEarningsVisible: boolean;
  toggleEarningsVisibility: () => void;
}

const persisted = loadPersistedData();
const defaultSettings = getDefaultSettings();

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      theme: (persisted.theme as ThemeMode) || 'light',
      tabs: (persisted.tabs as Tab[]) || [],
      timeRecords: (persisted.timeRecords as TimeRecord[]) || [],
      settings: { ...defaultSettings, ...(persisted.settings || {}) },
      activeTabId: persisted.activeTabId as string | null || null,
      deletedTab: null,
      areEarningsVisible: true,

      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),

      setActiveTabId: (id) => set({ activeTabId: id }),

      createTab: (name, year, month) => {
        const state = get();
        const maxIndex = state.tabs.reduce((max, t) => Math.max(max, t.orderIndex), 0);
        const tab: Tab = {
          id: uuidv4(),
          name,
          year,
          month,
          orderIndex: maxIndex + 1,
          isReportTab: false,
          createdAt: new Date().toISOString(),
        };
        const records = generateTimeRecords(tab.id, year, month);
        set({
          tabs: [...state.tabs, tab],
          timeRecords: [...state.timeRecords, ...records],
          activeTabId: tab.id,
        });
        return tab;
      },

      updateTab: (id, updates) => {
        set((s) => ({
          tabs: s.tabs.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },

      deleteTab: (id) => {
        const state = get();
        const tab = state.tabs.find((t) => t.id === id);
        if (!tab) return;
        const records = state.timeRecords.filter((r) => r.tabId === id);
        set({
          tabs: state.tabs.filter((t) => t.id !== id),
          timeRecords: state.timeRecords.filter((r) => r.tabId !== id),
          activeTabId: state.activeTabId === id
            ? (state.tabs.filter((t) => t.id !== id)[0]?.id ?? null)
            : state.activeTabId,
          deletedTab: { tab, records },
        });
      },

      restoreDeletedTab: () => {
        const state = get();
        if (!state.deletedTab) return;
        const { tab, records } = state.deletedTab;
        set({
          tabs: [...state.tabs, tab],
          timeRecords: [...state.timeRecords, ...records],
          activeTabId: tab.id,
      deletedTab: null,
      areEarningsVisible: false,
        });
      },

      clearDeletedTab: () => set({ deletedTab: null }),

      updateSettings: (updates) => {
        set((s) => ({
          settings: { ...s.settings, ...updates, updatedAt: new Date().toISOString() },
        }));
      },

      updateTimeRecord: (tabId, date, input) => {
        set((s) => {
          const settings = { ...s.settings };
          const calc = createCalculator(settings);
          const idx = s.timeRecords.findIndex((r) => r.tabId === tabId && r.date === date);
          if (idx < 0) return s;

          const record = s.timeRecords[idx];
          let hoursWorked = 0;
          let overtimeHours = 0;
          let undertimeHours = 0;
          let dailyEarnings = 0;

          if (input.timeIn && input.timeOut) {
            hoursWorked = calc.calculateHours(input.timeIn, input.timeOut);
            overtimeHours = calc.calculateOvertime(hoursWorked);
            undertimeHours = calc.calculateUndertime(hoursWorked);
            dailyEarnings = calc.calculateDailyEarnings(hoursWorked);
          }

          const updatedRecords = [...s.timeRecords];
          updatedRecords[idx] = {
            ...record,
            timeIn: input.timeIn || null,
            timeOut: input.timeOut || null,
            hoursWorked,
            overtimeHours,
            undertimeHours,
            dailyEarnings,
            comment: input.comment !== undefined ? input.comment : record.comment,
            updatedAt: new Date().toISOString(),
          };

          return { timeRecords: updatedRecords };
        });
      },

      getSortedTabs: () => {
        return [...get().tabs].sort((a, b) => a.orderIndex - b.orderIndex);
      },

      getTabRecords: (tabId) => {
        return get().timeRecords
          .filter((r) => r.tabId === tabId)
          .sort((a, b) => a.date.localeCompare(b.date));
      },

      setHasHydrated: (value) => set({ _hasHydrated: value }),

      toggleEarningsVisibility: () => set((s) => ({ areEarningsVisible: !s.areEarningsVisible })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => indexedDBStorage),
      version: CURRENT_VERSION,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Record<string, unknown>;
        if (version < 3) {
          state.version = CURRENT_VERSION;
          if (state.settings && typeof state.settings === 'object') {
            const s = state.settings as Record<string, unknown>;
            if (s.lunchDuration === undefined) s.lunchDuration = 1;
          }
        }
        return state as unknown as AppState;
      },
      partialize: (state) => ({
        theme: state.theme,
        tabs: state.tabs,
        timeRecords: state.timeRecords,
        settings: state.settings,
        activeTabId: state.activeTabId,
        deletedTab: null,
        areEarningsVisible: state.areEarningsVisible,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    },
  ),
);
