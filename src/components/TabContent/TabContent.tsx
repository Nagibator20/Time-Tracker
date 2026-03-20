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
  
  const handleUpdateRecord = useCallback((date: string, timeIn: string | undefined, timeOut: string | undefined, comment?: string) => {
    updateRecord(date, { timeIn, timeOut, comment });
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
      <Earnings
        tabName={tab.name}
        totalHours={totals.totalHours}
        totalEarnings={totals.totalEarnings}
        totalOvertime={totals.totalOvertime}
        totalUndertime={totals.totalUndertime}
        workingDaysCount={workingDaysCount}
        workingHoursInMonth={workingHoursInMonth}
        onExport={handleExport}
        onSettings={() => setShowSettings(true)}
      />
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
