import React, { memo, useCallback, useRef } from 'react';
import './BackupControls.scss';

const BackupControlsComponent: React.FC = () => {
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
    <div className="backup-controls">
      <button
        className="backup-controls__btn backup-controls__btn--export"
        onClick={handleExportBackup}
        title="Экспорт резервной копии"
        aria-label="Экспорт резервной копии"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span>Backup</span>
      </button>
      <button
        className="backup-controls__btn backup-controls__btn--import"
        onClick={handleImportBackup}
        title="Импорт резервной копии"
        aria-label="Импорт резервной копии"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        <span>Restore</span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        aria-hidden="true"
      />
    </div>
  );
};

export const BackupControls = memo(BackupControlsComponent);
