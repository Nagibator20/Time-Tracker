import React, { useState, useCallback, useEffect } from 'react';
import { useDatabase } from '../../hooks/useDatabase';
import { CurrencyIcon } from '../icons/CurrencyIcon';
import './HourlyRate.scss';

interface HourlyRateModalProps {
  onClose: () => void;
}

export const HourlyRateModal: React.FC<HourlyRateModalProps> = ({ onClose }) => {
  const { settings, updateHourlyRate, updateStandardHours, updateLunchDuration } = useDatabase();
  const [rateInput, setRateInput] = useState((settings?.hourlyRate ?? 0).toString());
  const [hoursInput, setHoursInput] = useState((settings?.standardHours ?? 8).toString());
  const [lunchInput, setLunchInput] = useState((settings?.lunchDuration ?? 1).toString());

  useEffect(() => {
    setRateInput((settings?.hourlyRate ?? 0).toString());
    setHoursInput((settings?.standardHours ?? 8).toString());
    setLunchInput((settings?.lunchDuration ?? 1).toString());
  }, [settings]);

  const handleSave = useCallback(() => {
    const rate = parseFloat(rateInput);
    const hours = parseFloat(hoursInput);
    const lunch = parseFloat(lunchInput);

    if (!isNaN(rate) && rate >= 0) {
      updateHourlyRate(rate);
    }
    if (!isNaN(hours) && hours > 0) {
      updateStandardHours(hours);
    }
    if (!isNaN(lunch) && lunch >= 0) {
      updateLunchDuration(lunch);
    }

    onClose();
  }, [rateInput, hoursInput, lunchInput, updateHourlyRate, updateStandardHours, updateLunchDuration, onClose]);

  return (
    <div className="hourly-rate">
      <div className="hourly-rate__row">
        <div className="hourly-rate__group">
          <label className="hourly-rate__label">Стоимость часа:</label>
          <input
            type="number"
            className="hourly-rate__input"
            value={rateInput}
            onChange={(e) => setRateInput(e.target.value)}
            step="0.01"
            min="0"
          />
          <CurrencyIcon />
        </div>
        <div className="hourly-rate__group">
          <label className="hourly-rate__label">Рабочий день:</label>
          <input
            type="number"
            className="hourly-rate__input hourly-rate__input--small"
            value={hoursInput}
            onChange={(e) => setHoursInput(e.target.value)}
            step="0.5"
            min="1"
            max="24"
          />
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4.5px', opacity: 0.7 }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div className="hourly-rate__group">
          <label className="hourly-rate__label">Обед:</label>
          <input
            type="number"
            className="hourly-rate__input hourly-rate__input--small"
            value={lunchInput}
            onChange={(e) => setLunchInput(e.target.value)}
            step="0.25"
            min="0"
            max="4"
          />
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4.5px', opacity: 0.7 }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
      </div>
      <div className="hourly-rate__actions">
        <button className="hourly-rate__save-btn" onClick={handleSave}>
          Сохранить
        </button>
      </div>
    </div>
  );
};
