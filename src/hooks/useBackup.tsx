import { useCallback, useRef, type ChangeEvent } from 'react';
import { useAppStore } from '../store';
import { validateBackupData } from '../utils/backupValidation';
import type { StoreApi } from 'zustand';
import type { AppState } from '../store/useAppStore';

interface UseBackupOptions {
  showToast?: (message: string, type: 'error' | 'success' | 'warning') => void;
}

export const useBackup = ({ showToast }: UseBackupOptions = {}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = useCallback(() => {
    const state = useAppStore.getState();
    const exportData = {
      version: 3,
      tabs: state.tabs,
      timeRecords: state.timeRecords,
      settings: state.settings,
      activeTabId: state.activeTabId,
      theme: state.theme,
    };
    const data = JSON.stringify(exportData);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `time_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast?.('Резервная копия экспортирована', 'success');
  }, [showToast]);

  const handleImportBackup = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((
    e: ChangeEvent<HTMLInputElement>,
    _onImportSuccess?: () => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result as string;
        const parsed = JSON.parse(data);
        
        const validation = validateBackupData(parsed);
        
        if (!validation.isValid) {
          showToast?.(validation.error || 'Неверный формат файла резервной копии', 'error');
          return;
        }

        if (confirm('Вы уверены? Это заменит все текущие данные.')) {
          const store = useAppStore as unknown as StoreApi<AppState>;
          const currentTheme = store.getState().theme;
          store.setState({
            tabs: validation.data!.tabs,
            timeRecords: validation.data!.timeRecords,
            settings: validation.data!.settings,
            activeTabId: validation.data!.activeTabId,
            theme: (parsed as Record<string, unknown>).theme as 'light' | 'dark' || currentTheme,
            deletedTab: null,
          });
          showToast?.('Резервная копия импортирована', 'success');
        }
      } catch {
        showToast?.('Ошибка при чтении файла', 'error');
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [showToast]);

  const FileInput = useCallback(() => (
    <input
      ref={fileInputRef}
      type="file"
      accept=".json"
      onChange={handleFileChange}
      style={{ display: 'none' }}
      aria-hidden="true"
    />
  ), [handleFileChange]);

  return {
    handleExportBackup,
    handleImportBackup,
    handleFileChange,
    FileInput,
  };
};
