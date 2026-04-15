import { v4 as uuidv4 } from 'uuid';
import { TimeRecord, Tab, Settings, MonthlyStats, TimeRecordInput } from '../types';
import { formatDateISO, getDaysInMonth } from './dateUtils';
import { TimeCalculator } from './timeCalculator';

const STORAGE_KEY = 'time_tracker_data';
const CURRENT_VERSION = 2; // Incremented for new changes

interface StoredData {
  version: number;
  tabs: Tab[];
  timeRecords: TimeRecord[];
  settings: Settings;
  activeTabId: string | null;
}

class DatabaseService {
  private data: StoredData;
  private calculator: TimeCalculator;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.calculator = new TimeCalculator();
    this.data = this.loadData();
  }

  private loadData(): StoredData {
    const defaultData: StoredData = {
      version: CURRENT_VERSION,
      tabs: [],
      timeRecords: [],
      settings: {
        id: 1,
        hourlyRate: 0,
        standardHours: 8,
        lunchDuration: 1,
        currency: '₽',
        updatedAt: new Date().toISOString()
      },
      activeTabId: null
    };

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        let data = JSON.parse(stored);
        
        // Simple migration logic
        if (!data.version || data.version < 2) {
          // Version 1 to 2: ensure lunchDuration and other fields exist
          data.version = 2;
          if (data.settings && data.settings.lunchDuration === undefined) {
            data.settings.lunchDuration = 1;
          }
        }

        const mergedData = { ...defaultData, ...data };
        mergedData.settings = { ...defaultData.settings, ...mergedData.settings };
        
        // Ensure arrays are present
        if (!Array.isArray(mergedData.tabs)) mergedData.tabs = [];
        if (!Array.isArray(mergedData.timeRecords)) mergedData.timeRecords = [];

        if (mergedData.tabs.length > 0) {
          const now = new Date();
          mergedData.tabs = mergedData.tabs.map((tab: Tab, index: number) => {
            if (tab.year === undefined || tab.month === undefined) {
              const monthOffset = index;
              const monthIndex = (now.getMonth() + monthOffset) % 12;
              const yearOffset = Math.floor((now.getMonth() + monthOffset) / 12);
              return {
                ...tab,
                year: now.getFullYear() + yearOffset,
                month: monthIndex
              };
            }
            return tab;
          });
        }
        return mergedData;
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }

    return defaultData;
  }

  private saveData(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      this.notifyListeners();
    } catch (error) {
      const err = error as { name?: string };
      if (err.name === 'QuotaExceededError') {
        console.error('LocalStorage quota exceeded. Consider clearing old data.');
      } else {
        console.error('Failed to save data:', error);
      }
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getActiveTabId(): string | null {
    return this.data.activeTabId;
  }

  setActiveTabId(id: string | null): void {
    this.data.activeTabId = id;
    this.saveData();
  }

  getSettings(): Settings {
    this.calculator.setStandardHours(this.data.settings.standardHours);
    this.calculator.setHourlyRate(this.data.settings.hourlyRate);
    this.calculator.setLunchDuration(this.data.settings.lunchDuration);
    return this.data.settings;
  }

  updateSettings(updates: Partial<Settings>): void {
    this.data.settings = {
      ...this.data.settings,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.calculator.setStandardHours(this.data.settings.standardHours);
    this.calculator.setHourlyRate(this.data.settings.hourlyRate);
    this.calculator.setLunchDuration(this.data.settings.lunchDuration);
    this.saveData();
  }

  getTabs(): Tab[] {
    return [...this.data.tabs].sort((a, b) => a.orderIndex - b.orderIndex);
  }

  createTab(name: string, year: number, month: number): Tab {
    const maxIndex = this.data.tabs.reduce((max, t) => Math.max(max, t.orderIndex), 0);
    
    const tab: Tab = {
      id: uuidv4(),
      name,
      year,
      month,
      orderIndex: maxIndex + 1,
      isReportTab: false,
      createdAt: new Date().toISOString()
    };

    this.data.tabs.push(tab);
    this.generateTimeRecordsForTab(tab.id, year, month);
    this.saveData();

    return tab;
  }

  updateTab(id: string, updates: Partial<Tab>): void {
    const index = this.data.tabs.findIndex(t => t.id === id);
    if (index >= 0) {
      this.data.tabs[index] = { ...this.data.tabs[index], ...updates };
      this.saveData();
    }
  }

  deleteTab(id: string): void {
    this.data.tabs = this.data.tabs.filter(t => t.id !== id);
    this.data.timeRecords = this.data.timeRecords.filter(r => r.tabId !== id);
    this.saveData();
  }

  getTimeRecords(tabId: string): TimeRecord[] {
    return this.data.timeRecords
      .filter(r => r.tabId === tabId)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private generateTimeRecordsForTab(tabId: string, year: number, month: number): void {
    const daysInMonth = getDaysInMonth(new Date(year, month));

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();

      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const dateStr = formatDateISO(date);
        const existing = this.data.timeRecords.find(
          r => r.tabId === tabId && r.date === dateStr
        );

        if (!existing) {
          const record: TimeRecord = {
            id: uuidv4(),
            tabId,
            date: dateStr,
            dayOfWeek,
            timeIn: null,
            timeOut: null,
            hoursWorked: 0,
            overtimeHours: 0,
            undertimeHours: 0,
            dailyEarnings: 0,
            comment: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          this.data.timeRecords.push(record);
        }
      }
    }
  }

  updateTimeRecord(tabId: string, date: string, input: TimeRecordInput): void {
    const settings = this.getSettings();
    this.calculator.setStandardHours(settings.standardHours);
    this.calculator.setHourlyRate(settings.hourlyRate);
    this.calculator.setLunchDuration(settings.lunchDuration);

    const index = this.data.timeRecords.findIndex(
      r => r.tabId === tabId && r.date === date
    );

    if (index < 0) return;

    let hoursWorked = 0;
    let overtimeHours = 0;
    let undertimeHours = 0;
    let dailyEarnings = 0;

    if (input.timeIn && input.timeOut) {
      hoursWorked = this.calculator.calculateHours(input.timeIn, input.timeOut);
      overtimeHours = this.calculator.calculateOvertime(hoursWorked);
      undertimeHours = this.calculator.calculateUndertime(hoursWorked);
      dailyEarnings = this.calculator.calculateDailyEarnings(hoursWorked);
    }

    this.data.timeRecords[index] = {
      ...this.data.timeRecords[index],
      timeIn: input.timeIn || null,
      timeOut: input.timeOut || null,
      hoursWorked,
      overtimeHours,
      undertimeHours,
      dailyEarnings,
      comment: input.comment !== undefined ? input.comment : this.data.timeRecords[index].comment,
      updatedAt: new Date().toISOString()
    };

    this.saveData();
  }

  getMonthlyStats(year: number): MonthlyStats[] {
    const stats: MonthlyStats[] = [];

    for (let month = 0; month < 12; month++) {
      let totalHours = 0;
      let totalOvertime = 0;
      let totalUndertime = 0;
      let totalEarnings = 0;
      let workingDays = 0;

      const monthStr = (month + 1).toString().padStart(2, '0');
      
      this.data.timeRecords
        .filter(r => r.date.startsWith(`${year}-${monthStr}`))
        .forEach(r => {
          totalHours += r.hoursWorked;
          totalOvertime += r.overtimeHours;
          totalUndertime += r.undertimeHours;
          totalEarnings += r.dailyEarnings;
          if (r.timeIn && r.timeOut) workingDays++;
        });

      stats.push({
        year,
        month,
        totalHours,
        totalOvertime,
        totalUndertime,
        totalEarnings,
        workingDays
      });
    }

    return stats;
  }

  getTotalStats(tabId: string): { totalHours: number; totalEarnings: number; totalOvertime: number } {
    const records = this.data.timeRecords.filter(r => r.tabId === tabId);
    
    return records.reduce((acc, r) => ({
      totalHours: acc.totalHours + r.hoursWorked,
      totalEarnings: acc.totalEarnings + r.dailyEarnings,
      totalOvertime: acc.totalOvertime + r.overtimeHours
    }), { totalHours: 0, totalEarnings: 0, totalOvertime: 0 });
  }
}

export const db = new DatabaseService();
