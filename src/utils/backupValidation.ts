import { Tab, TimeRecord, Settings } from '../types';

export interface BackupData {
  version: number;
  tabs: Tab[];
  timeRecords: TimeRecord[];
  settings: Settings;
  activeTabId: string | null;
}

export interface BackupValidationResult {
  isValid: boolean;
  error?: string;
  data?: BackupData;
}

const MAX_SUPPORTED_VERSION = 3;

export const validateBackupData = (data: unknown): BackupValidationResult => {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Некорректный формат данных' };
  }

  const backup = data as Record<string, unknown>;

  if (typeof backup.version !== 'number') {
    return { isValid: false, error: 'Отсутствует версия резервной копии' };
  }

  if (backup.version < 1 || backup.version > MAX_SUPPORTED_VERSION) {
    return { 
      isValid: false, 
      error: `Неподдерживаемая версия резервной копии (v${backup.version}). Поддерживаются v1-v${MAX_SUPPORTED_VERSION}` 
    };
  }

  if (!Array.isArray(backup.tabs)) {
    return { isValid: false, error: 'Отсутствуют данные вкладок' };
  }

  for (let i = 0; i < backup.tabs.length; i++) {
    const tab = backup.tabs[i];
    if (!isValidTab(tab, i)) {
      return { isValid: false, error: `Некорректные данные вкладки #${i + 1}` };
    }
  }

  if (!Array.isArray(backup.timeRecords)) {
    return { isValid: false, error: 'Отсутствуют записи времени' };
  }

  for (let i = 0; i < backup.timeRecords.length; i++) {
    const record = backup.timeRecords[i];
    if (!isValidTimeRecord(record, i)) {
      return { isValid: false, error: `Некорректная запись времени #${i + 1}` };
    }
  }

  if (!backup.settings || typeof backup.settings !== 'object') {
    return { isValid: false, error: 'Отсутствуют настройки' };
  }

  if (!isValidSettings(backup.settings as Record<string, unknown>)) {
    return { isValid: false, error: 'Некорректные настройки' };
  }

  return {
    isValid: true,
    data: {
      version: backup.version,
      tabs: backup.tabs as Tab[],
      timeRecords: backup.timeRecords as TimeRecord[],
      settings: backup.settings as Settings,
      activeTabId: backup.activeTabId as string | null
    }
  };
};

const isValidTab = (tab: unknown, _index: number): boolean => {
  if (!tab || typeof tab !== 'object') return false;
  const t = tab as Record<string, unknown>;
  return (
    typeof t.id === 'string' && t.id.length > 0 &&
    typeof t.name === 'string' &&
    typeof t.year === 'number' &&
    typeof t.month === 'number' &&
    t.month >= 0 && t.month <= 11 &&
    typeof t.orderIndex === 'number'
  );
};

const isValidTimeRecord = (record: unknown, _index: number): boolean => {
  if (!record || typeof record !== 'object') return false;
  const r = record as Record<string, unknown>;
  return (
    typeof r.id === 'string' && r.id.length > 0 &&
    typeof r.tabId === 'string' &&
    typeof r.date === 'string' &&
    typeof r.dayOfWeek === 'number'
  );
};

const isValidSettings = (settings: Record<string, unknown>): boolean => {
  return (
    typeof settings.hourlyRate === 'number' &&
    typeof settings.standardHours === 'number' &&
    typeof settings.lunchDuration === 'number'
  );
};
