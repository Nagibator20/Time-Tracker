import React, { memo } from 'react';
import { useAppStore } from '../../store';
import { HourlyRateModal } from '../HourlyRate';
import { useBackup } from '../../hooks/useBackup';
import './SettingsModal.scss';

interface SettingsModalProps {
  onClose?: () => void;
  showToast: (message: string, type?: 'error' | 'success' | 'warning') => void;
}

const SettingsModalComponent: React.FC<SettingsModalProps> = ({ showToast }) => {
  const { theme, toggleTheme } = useAppStore();
  const { handleExportBackup, handleImportBackup, FileInput } = useBackup({ showToast });

  return (
    <div className="settings-modal">
      <div className="settings-modal__section">
        <h4 className="settings-modal__section-title">Оплата труда</h4>
        <HourlyRateModal onClose={() => { }} />
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
                Тёмная
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
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
        <h4 className="settings-modal__section-title">Сохранение и вывод</h4>
        <div className="settings-modal__buttons">
          <button
            className="settings-modal__btn settings-modal__btn--export"
            onClick={handleExportBackup}
            aria-label="Экспорт резервной копии"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Backup
          </button>
          <button
            className="settings-modal__btn settings-modal__btn--import"
            onClick={handleImportBackup}
            aria-label="Импорт резервной копии"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Restore
          </button>
          <button
            className="settings-modal__btn settings-modal__btn--csv"
            onClick={() => {
              import('../../utils/csvExport').then(({ exportToCSV }) => {
                const state = useAppStore.getState();
                const activeTab = state.tabs.find(t => t.id === state.activeTabId) || state.tabs[0];

                if (activeTab) {
                  const records = state.timeRecords
                    .filter(r => r.tabId === activeTab.id)
                    .sort((a, b) => a.date.localeCompare(b.date));
                  exportToCSV(records, activeTab.name);
                  showToast('CSV файл экспортирован', 'success');
                } else {
                  showToast('Нет активного таба', 'warning');
                }
              });
            }}
            aria-label="Экспорт в CSV"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="8" y1="13" x2="16" y2="13"></line>
              <line x1="8" y1="17" x2="16" y2="17"></line>
            </svg>
            CSV
          </button>
          <button
            className="settings-modal__btn settings-modal__btn--pdf"
            onClick={() => {
              import('../../utils/pdfExport').then(({ exportToPDF }) => {
                const state = useAppStore.getState();
                const activeTab = state.tabs.find(t => t.id === state.activeTabId) || state.tabs[0];

                if (activeTab) {
                  const records = state.timeRecords
                    .filter(r => r.tabId === activeTab.id)
                    .sort((a, b) => a.date.localeCompare(b.date));
                  exportToPDF({ records, tab: activeTab, settings: state.settings });
                  showToast('PDF формируется...', 'success');
                } else {
                  showToast('Нет активного таба', 'warning');
                }
              });
            }}
            aria-label="Экспорт в PDF"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <text
                x="7"
                y="17"
                fontSize="6"
                fontWeight="bold"
                fill="currentColor"
                stroke="none"
                fontFamily="Arial, sans-serif"
              >
                PDF
              </text>
            </svg>
            PDF
          </button>
        </div>
        <FileInput />
      </div>
    </div>
  );
};

export const SettingsModal = memo(SettingsModalComponent);
