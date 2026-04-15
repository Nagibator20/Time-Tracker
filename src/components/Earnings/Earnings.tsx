import React, { memo, useMemo } from 'react';
import { formatHours } from '../../utils/formatters';
import { CurrencyValue } from '../CurrencyValue';
import './Earnings.scss';

interface EarningsProps {
  tabName: string;
  totalHours: number;
  totalEarnings: number;
  totalOvertime: number;
  totalUndertime: number;
  workingDaysCount: number;
  workingHoursInMonth: number;
  onSettings: () => void;
}

const EarningsComponent: React.FC<EarningsProps> = ({
  tabName,
  totalHours,
  totalEarnings,
  totalOvertime,
  totalUndertime,
  workingDaysCount,
  workingHoursInMonth,
  onSettings,
}) => {
  const progress = useMemo(() => {
    if (workingHoursInMonth === 0) return 0;
    return Math.min(100, Math.round((totalHours / workingHoursInMonth) * 100));
  }, [totalHours, workingHoursInMonth]);

  const progressColor = useMemo(() => {
    if (progress >= 100) return 'var(--color-success)';
    if (progress >= 80) return 'var(--color-primary)';
    if (progress >= 50) return 'var(--color-warning)';
    return 'var(--color-danger)';
  }, [progress]);

  return (
    <div className="earnings">
      <div className="earnings__main">
        <div className="earnings__header">
          <h2 className="earnings__title">{tabName}</h2>
          <div className="earnings__total-wrapper">
            <span className="earnings__label">Заработано:</span>
            <span className="earnings__total">
              <CurrencyValue amount={totalEarnings} />
            </span>
          </div>
          <div className="earnings__header-actions">
            <button
              className="earnings__settings-btn"
              onClick={onSettings}
              title="Настройки"
              aria-label="Открыть настройки"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
        </div>
        <div className="earnings__progress-wrapper">
          <div
            className="earnings__progress"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Выполнение нормы: ${progress}%`}
          >
            <div
              className="earnings__progress-bar"
              style={{
                width: `${progress}%`,
                backgroundColor: progressColor,
              }}
            />
            <span className="earnings__progress-text">{progress}%</span>
          </div>
        </div>
      </div>
      <div className="earnings__details" role="list" aria-label="Детализация">
        <div className="earnings__item" role="listitem">
          <span className="earnings__item-label">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Отработано:
          </span>
          <span className="earnings__item-value">{formatHours(totalHours)}</span>
        </div>
        <div className="earnings__item earnings__item--overtime" role="listitem">
          <span className="earnings__item-label">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4CAF50"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M16 7h6v6"></path>
              <path d="m22 7-8.5 8.5-5-5L2 17"></path>
            </svg>
            Переработка:
          </span>
          <span className="earnings__item-value">{formatHours(totalOvertime)}</span>
        </div>
        <div className="earnings__item earnings__item--undertime" role="listitem">
          <span className="earnings__item-label">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#F44336"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M16 17h6v-6"></path>
              <path d="m22 17-8.5-8.5-5 5L2 7"></path>
            </svg>
            Недоработка:
          </span>
          <span className="earnings__item-value">{formatHours(totalUndertime)}</span>
        </div>
        <div className="earnings__item" role="listitem">
          <span className="earnings__item-label">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Рабочих дней:
          </span>
          <span className="earnings__item-value">{workingDaysCount}</span>
        </div>
        <div className="earnings__item" role="listitem">
          <span className="earnings__item-label">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 2v20"></path>
              <path d="m17 5-5-3-5 3"></path>
              <path d="m17 19-5 3-5-3"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            Норма в месяце:
          </span>
          <span className="earnings__item-value">{workingHoursInMonth}</span>
        </div>
      </div>
    </div>
  );
};

export const Earnings = memo(EarningsComponent);
