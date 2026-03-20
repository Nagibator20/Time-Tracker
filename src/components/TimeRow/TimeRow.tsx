import React, { useState, useCallback, useEffect, useRef, memo } from 'react';
import { TimeRecord } from '../../types';
import { formatDateShort, getDayNameShort } from '../../services/dateUtils';
import { validateTime, validateTimeRange } from '../../utils/validators';
import { formatHours } from '../../utils/formatters';
import { useDatabase } from '../../hooks/useDatabase';
import { TimeInput } from '../TimeInput';
import { CurrencyValue } from '../CurrencyValue';

interface TimeRowProps {
  record: TimeRecord;
  onUpdate: (date: string, timeIn: string | undefined, timeOut: string | undefined) => void;
}

const TimeRowComponent: React.FC<TimeRowProps> = ({ record, onUpdate }) => {
  const { settings } = useDatabase();
  const [timeIn, setTimeIn] = useState(record.timeIn || '');
  const [timeOut, setTimeOut] = useState(record.timeOut || '');
  const [timeInError, setTimeInError] = useState<string | null>(null);
  const [timeOutError, setTimeOutError] = useState<string | null>(null);
  
  const timeInRef = useRef<HTMLInputElement>(null);
  const timeOutRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTimeIn(record.timeIn || '');
    setTimeOut(record.timeOut || '');
    setTimeInError(null);
    setTimeOutError(null);
  }, [record]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleTimeInChange = useCallback((value: string) => {
    setTimeIn(value);
    setTimeInError(null);
  }, []);

  const handleTimeOutChange = useCallback((value: string) => {
    setTimeOut(value);
    setTimeOutError(null);
  }, []);

  const saveAndUpdate = useCallback((finalTimeIn: string | undefined, finalTimeOut: string | undefined) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    onUpdate(record.date, finalTimeIn, finalTimeOut);
  }, [record.date, onUpdate]);

  const handleTimeInBlur = useCallback(() => {
    if (!timeIn) {
      saveAndUpdate(undefined, undefined);
      return;
    }

    const result = validateTime(timeIn);
    if (!result.isValid) {
      setTimeInError(result.error || 'Неверный формат времени');
      return;
    }
    
    const finalTime = result.formatted || timeIn;
    if (finalTime && timeOut) {
      const rangeResult = validateTimeRange(finalTime, timeOut);
      if (!rangeResult.isValid) {
        setTimeOutError(rangeResult.error || 'Ошибка валидации');
        return;
      }
    }
    saveAndUpdate(finalTime, finalTime ? timeOut : undefined);
  }, [timeIn, timeOut, record.date, saveAndUpdate]);

  const handleTimeOutBlur = useCallback(() => {
    if (!timeOut) {
      saveAndUpdate(timeIn || undefined, undefined);
      return;
    }

    const result = validateTime(timeOut);
    if (!result.isValid) {
      setTimeOutError(result.error || 'Неверный формат времени');
      return;
    }
    
    const finalTime = result.formatted || timeOut;
    if (finalTime && timeIn) {
      const rangeResult = validateTimeRange(timeIn, finalTime);
      if (!rangeResult.isValid) {
        setTimeOutError(rangeResult.error || 'Ошибка валидации');
        return;
      }
    }
    saveAndUpdate(timeIn || undefined, finalTime);
  }, [timeIn, timeOut, record.date, saveAndUpdate]);

  const handleTimeInKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTimeInBlur();
      timeOutRef.current?.focus();
    } else if (e.key === 'ArrowRight') {
      const input = e.target as HTMLInputElement;
      const length = input.value.length;
      if (length === 2 && !input.value.includes(':')) {
        return;
      }
      if (length === 5) {
        e.preventDefault();
        timeOutRef.current?.focus();
      }
    }
  }, [handleTimeInBlur]);

  const handleTimeOutKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTimeOutBlur();
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'ArrowLeft') {
      const input = e.target as HTMLInputElement;
      const length = input.value.length;
      if (length === 0 || (length === 1 && input.selectionStart === 0)) {
        e.preventDefault();
        timeInRef.current?.focus();
      }
    }
  }, [handleTimeOutBlur]);

  const getStatusClass = (): string => {
    if (!record.timeIn || !record.timeOut) return '';
    if (record.hoursWorked > settings.standardHours) return 'time-row__status--overtime';
    if (record.hoursWorked < settings.standardHours) return 'time-row__status--undertime';
    return 'time-row__status--normal';
  };

  const getStatusIcon = (): string => {
    if (!record.timeIn || !record.timeOut) return '';
    if (record.hoursWorked > settings.standardHours) return '↑';
    if (record.hoursWorked < settings.standardHours) return '↓';
    return '✓';
  };

  const date = new Date(record.date);

  return (
    <div 
      className="time-row"
      role="row"
    >
      <div className="time-row__cell time-row__cell--date">
        <span className="time-row__date-combined">
          <span className="time-row__day-short">{getDayNameShort(date)}</span>
          <span className="time-row__date-short">{formatDateShort(date)}</span>
        </span>
      </div>
      <div className="time-row__cell">
        <div className="time-row__input-wrapper">
          <TimeInput
            ref={timeInRef}
            value={timeIn}
            onChange={handleTimeInChange}
            onBlur={handleTimeInBlur}
            onKeyDown={handleTimeInKeyDown}
            aria-label="Время прихода"
          />
          {timeInError && (
            <div className="time-row__tooltip time-row__tooltip--top">
              {timeInError}
            </div>
          )}
        </div>
      </div>
      <div className="time-row__cell">
        <div className="time-row__input-wrapper">
          <TimeInput
            ref={timeOutRef}
            value={timeOut}
            onChange={handleTimeOutChange}
            onBlur={handleTimeOutBlur}
            onKeyDown={handleTimeOutKeyDown}
            aria-label="Время ухода"
          />
          {timeOutError && (
            <div className="time-row__tooltip time-row__tooltip--top">
              {timeOutError}
            </div>
          )}
        </div>
      </div>
      <div className="time-row__cell time-row__cell--hours" role="cell">
        {record.hoursWorked > 0 ? formatHours(record.hoursWorked) : '—'}
      </div>
      <div className="time-row__cell">
        <span className={`time-row__status ${getStatusClass()}`}>
          {getStatusIcon() && <span className="time-row__status-icon">{getStatusIcon()}</span>}
          {record.overtimeHours > 0 && <span>{formatHours(record.overtimeHours)}</span>}
          {record.undertimeHours > 0 && <span>{formatHours(record.undertimeHours)}</span>}
        </span>
      </div>
      <div className="time-row__cell time-row__cell--earnings" role="cell">
        {record.dailyEarnings > 0 ? <CurrencyValue amount={record.dailyEarnings} /> : '—'}
      </div>
    </div>
  );
};

export const TimeRow = memo(TimeRowComponent);
