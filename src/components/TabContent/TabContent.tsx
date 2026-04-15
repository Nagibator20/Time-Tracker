import React, { useState, useCallback } from 'react';
import { Tab } from '../../types';
import { TimeTable } from '../TimeTable';
import { Earnings } from '../Earnings';
import { SettingsModal } from '../SettingsModal';
import { Modal } from '../Modal';
import { useTimeRecords } from '../../hooks/useTimeRecords';
import { useDatabase } from '../../hooks/useDatabase';
import { countWorkingDaysInMonth } from '../../services/dateUtils';
import './TabContent.scss';

interface TabContentProps {
  tab: Tab;
  showToast: (message: string, type?: 'error' | 'success' | 'warning') => void;
}

export const TabContent: React.FC<TabContentProps> = (props) => {
  const { showToast } = props;
  const { tab } = props;
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
        onSettings={() => setShowSettings(true)}
      />
      <TimeTable records={records} onUpdateRecord={handleUpdateRecord} />

      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Настройки"
        titleId="settings-modal-title"
      >
        <SettingsModal showToast={showToast} />
      </Modal>
    </div>
  );
};
