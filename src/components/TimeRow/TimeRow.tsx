import React, { useState, useCallback, useEffect, useRef, memo, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { TimeRecord } from '../../types';
import { formatDateShort, getDayNameShort } from '../../services/dateUtils';
import { validateTime, validateTimeRange } from '../../utils/validators';
import { formatHours } from '../../utils/formatters';
import { sanitizeComment } from '../../utils/htmlEscaping';
import { useDatabase } from '../../hooks/useDatabase';
import { TimeInput } from '../TimeInput';
import { CurrencyValue } from '../CurrencyValue';

type TimeRowProps = {
  record: TimeRecord;
  onUpdate: (
    date: string,
    timeIn: string | undefined,
    timeOut: string | undefined,
    comment?: string
  ) => void;
};

const TimeRowComponent: React.FC<TimeRowProps> = ({ record, onUpdate }) => {
  const { settings } = useDatabase();
  const [timeIn, setTimeIn] = useState(record.timeIn || '');
  const [timeOut, setTimeOut] = useState(record.timeOut || '');
  const [comment, setComment] = useState(record.comment || '');
  const [timeInError, setTimeInError] = useState<string | null>(null);
  const [timeOutError, setTimeOutError] = useState<string | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [modalSize, setModalSize] = useState({ width: 400, height: 150 });

  const timeInRef = useRef<HTMLInputElement>(null);
  const timeOutRef = useRef<HTMLInputElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const commentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizeStartRef = useRef<{ x: number; y: number; width: number; height: number } | null>(
    null
  );
  const isResizingRef = useRef(false);

  useEffect(() => {
    setTimeIn(record.timeIn || '');
    setTimeOut(record.timeOut || '');
    setComment(record.comment || '');
    setTimeInError(null);
    setTimeOutError(null);
  }, [record.id, record.timeIn, record.timeOut, record.comment]);

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

  const saveAndUpdate = useCallback(
    (finalTimeIn: string | undefined, finalTimeOut: string | undefined, finalComment?: string) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      onUpdate(record.date, finalTimeIn, finalTimeOut, finalComment);
    },
    [record.date, onUpdate]
  );

  const validateAndSave = useCallback(
    (valTimeIn: string, valTimeOut: string) => {
      if (!valTimeIn) {
        saveAndUpdate(undefined, undefined);
        return;
      }

      const result = validateTime(valTimeIn);
      if (!result.isValid) {
        setTimeInError(result.error || 'Неверный формат времени');
        return;
      }

      const finalTimeIn = result.formatted || valTimeIn;
      if (finalTimeIn && valTimeOut) {
        const rangeResult = validateTimeRange(finalTimeIn, valTimeOut);
        if (!rangeResult.isValid) {
          setTimeOutError(rangeResult.error || 'Ошибка валидации');
          return;
        }
      }
      saveAndUpdate(finalTimeIn, finalTimeIn ? valTimeOut : undefined);
    },
    [saveAndUpdate]
  );

  const handleTimeInBlur = useCallback(() => {
    validateAndSave(timeIn, timeOut);
  }, [timeIn, timeOut, validateAndSave]);

  const validateAndSaveOut = useCallback(
    (valTimeIn: string, valTimeOut: string) => {
      if (!valTimeOut) {
        saveAndUpdate(valTimeIn || undefined, undefined);
        return;
      }

      const result = validateTime(valTimeOut);
      if (!result.isValid) {
        setTimeOutError(result.error || 'Неверный формат времени');
        return;
      }

      const finalTimeOut = result.formatted || valTimeOut;
      if (finalTimeOut && valTimeIn) {
        const rangeResult = validateTimeRange(valTimeIn, finalTimeOut);
        if (!rangeResult.isValid) {
          setTimeOutError(rangeResult.error || 'Ошибка валидации');
          return;
        }
      }
      saveAndUpdate(valTimeIn || undefined, finalTimeOut);
    },
    [saveAndUpdate]
  );

  const handleTimeOutBlur = useCallback(() => {
    validateAndSaveOut(timeIn, timeOut);
  }, [timeIn, timeOut, validateAndSaveOut]);

  const handleTimeInKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const currentValue = (e.target as HTMLInputElement).value;
        validateAndSave(currentValue, timeOut);
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
    },
    [timeOut, validateAndSave]
  );

  const handleTimeOutKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const currentValue = (e.target as HTMLInputElement).value;
        validateAndSaveOut(timeIn, currentValue);
        (e.target as HTMLInputElement).blur();
      } else if (e.key === 'ArrowLeft') {
        const input = e.target as HTMLInputElement;
        const length = input.value.length;
        if (length === 0 || (length === 1 && input.selectionStart === 0)) {
          e.preventDefault();
          timeInRef.current?.focus();
        }
      }
    },
    [timeIn, validateAndSaveOut]
  );

  const handleCommentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setComment(e.target.value);
  }, []);

  const handleCommentBlur = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    const sanitizedComment = sanitizeComment(comment);
    if (sanitizedComment !== comment) {
      setComment(sanitizedComment);
    }
    saveAndUpdate(timeIn || undefined, timeOut || undefined, sanitizedComment);
  }, [timeIn, timeOut, comment, saveAndUpdate]);

  const handleCommentKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleCommentBlur();
        (e.target as HTMLInputElement).blur();
      }
    },
    [handleCommentBlur]
  );

  const handleCommentClick = useCallback(() => {
    if (!commentInputRef.current || !comment) return;
    const isOverflowing = commentInputRef.current.scrollWidth > commentInputRef.current.clientWidth;
    if (isOverflowing) {
      setCommentText(comment);
      setShowCommentModal(true);
    }
  }, [comment]);

  const handleCommentTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentText(e.target.value);
  }, []);

  const handleModalSave = useCallback(() => {
    const sanitizedComment = sanitizeComment(commentText);
    setComment(sanitizedComment);
    setShowCommentModal(false);
    saveAndUpdate(timeIn || undefined, timeOut || undefined, sanitizedComment);
  }, [commentText, timeIn, timeOut, saveAndUpdate]);

  const handleModalClose = useCallback(() => {
    if (isResizingRef.current) {
      isResizingRef.current = false;
      return;
    }
    setShowCommentModal(false);
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizingRef.current = true;

    const modal = (e.target as HTMLElement).closest('.time-row__comment-modal') as HTMLElement;
    if (!modal) return;

    const rect = modal.getBoundingClientRect();
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: rect.width,
      height: rect.height,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizeStartRef.current) return;
      const deltaX = moveEvent.clientX - resizeStartRef.current.x;
      const deltaY = moveEvent.clientY - resizeStartRef.current.y;
      setModalSize({
        width: Math.min(700, Math.max(400, resizeStartRef.current.width + deltaX)),
        height: Math.max(200, resizeStartRef.current.height + deltaY),
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      resizeStartRef.current = null;
      setTimeout(() => {
        isResizingRef.current = false;
      }, 0);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  const { statusClass, statusLabel, statusIcon } = useMemo(() => {
    const getStatusClass = (): string => {
      if (!record.timeIn || !record.timeOut) return '';
      if (record.hoursWorked > settings.standardHours) return 'time-row__status--overtime';
      if (record.hoursWorked < settings.standardHours) return 'time-row__status--undertime';
      return 'time-row__status--normal';
    };

    const getStatusLabel = (): string => {
      if (!record.timeIn || !record.timeOut) return 'Нет данных';
      if (record.hoursWorked > settings.standardHours)
        return `Сверхурочно: ${formatHours(record.overtimeHours)}`;
      if (record.hoursWorked < settings.standardHours)
        return `Недоработка: ${formatHours(record.undertimeHours)}`;
      return 'Норма';
    };

    const getStatusIcon = (): string => {
      if (!record.timeIn || !record.timeOut) return '';
      if (record.hoursWorked > settings.standardHours) return '↑';
      if (record.hoursWorked < settings.standardHours) return '↓';
      return '✓';
    };

    return {
      statusClass: getStatusClass(),
      statusLabel: getStatusLabel(),
      statusIcon: getStatusIcon(),
    };
  }, [
    record.timeIn,
    record.timeOut,
    record.hoursWorked,
    record.overtimeHours,
    record.undertimeHours,
    settings.standardHours,
  ]);

  const date = useMemo(() => new Date(record.date), [record.date]);

  return (
    <tr className="time-row">
      <td className="time-row__cell time-row__cell--date">
        <span className="time-row__date-combined">
          <span className="time-row__day-short">{getDayNameShort(date)}</span>
          <span className="time-row__date-short">{formatDateShort(date)}</span>
        </span>
      </td>
      <td className="time-row__cell">
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
            <div className="time-row__tooltip time-row__tooltip--top">{timeInError}</div>
          )}
        </div>
      </td>
      <td className="time-row__cell">
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
            <div className="time-row__tooltip time-row__tooltip--top">{timeOutError}</div>
          )}
        </div>
      </td>
      <td className="time-row__cell time-row__cell--hours">
        {record.hoursWorked > 0 ? (
          formatHours(record.hoursWorked)
        ) : (
          <span className="time-row__cell--hours-placeholder">—</span>
        )}
      </td>
      <td className="time-row__cell">
        <span className={`time-row__status ${statusClass}`} aria-label={statusLabel}>
          {statusIcon && (
            <span className="time-row__status-icon" aria-hidden="true">
              {statusIcon}
            </span>
          )}
          {record.overtimeHours > 0 && (
            <span aria-hidden="true">{formatHours(record.overtimeHours)}</span>
          )}
          {record.undertimeHours > 0 && (
            <span aria-hidden="true">{formatHours(record.undertimeHours)}</span>
          )}
        </span>
      </td>
      <td className="time-row__cell time-row__cell--earnings">
        {record.dailyEarnings > 0 ? <CurrencyValue amount={record.dailyEarnings} /> : <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
      </td>
      <td className="time-row__cell">
        <input
          ref={commentInputRef}
          type="text"
          className="time-row__comment-input"
          value={comment}
          onChange={handleCommentChange}
          onBlur={handleCommentBlur}
          onKeyDown={handleCommentKeyDown}
          onClick={handleCommentClick}
          placeholder="—"
          aria-label="Комментарий"
        />
        {showCommentModal &&
          ReactDOM.createPortal(
            <div className="time-row__comment-modal-overlay" onClick={handleModalClose}>
              <div
                className="time-row__comment-modal"
                onClick={e => e.stopPropagation()}
                style={{ width: modalSize.width, height: modalSize.height }}
              >
                <textarea
                  ref={commentTextareaRef}
                  className="time-row__comment-modal-textarea"
                  value={commentText}
                  onChange={handleCommentTextChange}
                  autoFocus
                  placeholder="Введите комментарий..."
                />
                <div className="time-row__comment-modal-actions">
                  <button
                    type="button"
                    className="time-row__comment-modal-btn time-row__comment-modal-btn--cancel"
                    onClick={handleModalClose}
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    className="time-row__comment-modal-btn time-row__comment-modal-btn--save"
                    onClick={handleModalSave}
                  >
                    Сохранить
                  </button>
                </div>
                <div className="time-row__comment-modal-resize" onMouseDown={handleResizeStart} />
              </div>
            </div>,
            document.body
          )}
      </td>
    </tr>
  );
};

export const TimeRow = memo(TimeRowComponent);
