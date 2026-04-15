import React, { memo } from 'react';
import { useBackup } from '../../hooks/useBackup';
import './BackupControls.scss';

interface BackupControlsProps {
  showToast?: (message: string, type: 'error' | 'success' | 'warning') => void;
}

const BackupControlsComponent: React.FC<BackupControlsProps> = ({ showToast }) => {
  const { handleExportBackup, handleImportBackup, FileInput } = useBackup({ showToast });

  return (
    <div className="backup-controls">
      <button
        className="backup-controls__btn backup-controls__btn--export"
        onClick={handleExportBackup}
        title="Экспорт резервной копии"
        aria-label="Экспорт резервной копии"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        <span>Restore</span>
      </button>
      <FileInput />
    </div>
  );
};

export const BackupControls = memo(BackupControlsComponent);
