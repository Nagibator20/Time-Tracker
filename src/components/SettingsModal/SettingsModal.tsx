import React, { memo, useCallback, useRef } from 'react';
import { useAppStore } from '../../store';
import { HourlyRateModal } from '../HourlyRate';
import './SettingsModal.scss';

interface SettingsModalProps {
  onClose?: () => void;
}

const SettingsModalComponent: React.FC<SettingsModalProps> = () => {
  const { theme, toggleTheme } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = useCallback(() => {
    const data = localStorage.getItem('time_tracker_data');
    if (data) {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `time_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }, []);

  const handleImportBackup = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result as string;
        const parsed = JSON.parse(data);
        
        if (parsed.version && parsed.tabs && parsed.timeRecords && parsed.settings) {
          if (confirm('Вы уверены? Это заменит все текущие данные.')) {
            localStorage.setItem('time_tracker_data', data);
            window.location.reload();
          }
        } else {
          alert('Неверный формат файла резервной копии.');
        }
      } catch {
        alert('Ошибка при чтении файла.');
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="settings-modal">
      <div className="settings-modal__section">
        <h4 className="settings-modal__section-title">Оплата труда</h4>
        <HourlyRateModal onClose={() => {}} />
      </div>

      <div className="settings-modal__section">
        <h4 className="settings-modal__section-title">Внешний вид</h4>
        <div className="settings-modal__row">
          <span className="settings-modal__label">Тема:</span>
          <button
            className="settings-modal__theme-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
                Тёмная
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
                Светлая
              </>
            )}
          </button>
        </div>
      </div>

      <div className="settings-modal__section">
        <h4 className="settings-modal__section-title">Резервное копирование</h4>
        <div className="settings-modal__buttons">
          <button
            className="settings-modal__btn settings-modal__btn--export"
            onClick={handleExportBackup}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Экспорт
          </button>
          <button
            className="settings-modal__btn settings-modal__btn--import"
            onClick={handleImportBackup}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Импорт
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

export const SettingsModal = memo(SettingsModalComponent);
