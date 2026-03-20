import React, { useState, useCallback } from 'react';
import { Tab } from '../../types';
import { TimeTable } from '../TimeTable';
import { Earnings } from '../Earnings';
import { SettingsModal } from '../SettingsModal';
import { useTimeRecords } from '../../hooks/useTimeRecords';
import { useDatabase } from '../../hooks/useDatabase';
import { countWorkingDaysInMonth } from '../../services/dateUtils';
import './TabContent.scss';

interface TabContentProps {
  tab: Tab;
}

export const TabContent: React.FC<TabContentProps> = ({ tab }) => {
  const [showSettings, setShowSettings] = useState(false);
  const { settings } = useDatabase();
  const { records, updateRecord, getTotals } = useTimeRecords({
    tabId: tab.id,
    year: tab.year,
    month: tab.month
  });
  
  const handleUpdateRecord = useCallback((date: string, timeIn: string | undefined, timeOut: string | undefined) => {
    updateRecord(date, { timeIn, timeOut });
  }, [updateRecord]);

  const handleExport = useCallback(() => {
    import('../../utils/csvExport').then(({ exportToCSV }) => {
      exportToCSV(records, tab.name);
    });
  }, [records, tab.name]);

  const totals = getTotals();
  const workingDaysCount = countWorkingDaysInMonth(tab.year, tab.month);
  const workingHoursInMonth = workingDaysCount * settings.standardHours;

  return (
    <div className="tab-content">
      <div className="tab-content__header">
        <h2 className="tab-content__title">{tab.name}</h2>
        <div className="tab-content__header-actions">
          <button 
            className="tab-content__export-btn"
            onClick={handleExport}
            title="Экспорт в CSV"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
          <button 
            className="tab-content__settings-btn"
            onClick={() => setShowSettings(true)}
            title="Настройки"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>
      </div>
      <div className="tab-content__controls">
        <Earnings
          totalHours={totals.totalHours}
          totalEarnings={totals.totalEarnings}
          totalOvertime={totals.totalOvertime}
          totalUndertime={totals.totalUndertime}
          workingDaysCount={workingDaysCount}
          workingHoursInMonth={workingHoursInMonth}
        />
      </div>
      <TimeTable records={records} onUpdateRecord={handleUpdateRecord} />

      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title">Настройки</h3>
              <button 
                className="modal__close"
                onClick={() => setShowSettings(false)}
              >
                ×
              </button>
            </div>
            <div className="modal__content">
              <SettingsModal />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
