import React, { memo, useMemo } from 'react';
import { formatHours } from '../../utils/formatters';
import { CurrencyValue } from '../CurrencyValue';
import './Earnings.scss';

interface EarningsProps {
  totalHours: number;
  totalEarnings: number;
  totalOvertime: number;
  totalUndertime: number;
  workingDaysCount: number;
  workingHoursInMonth: number;
}

const EarningsComponent: React.FC<EarningsProps> = ({
  totalHours,
  totalEarnings,
  totalOvertime,
  totalUndertime,
  workingDaysCount,
  workingHoursInMonth,
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
        <span className="earnings__label">Заработано:</span>
        <span className="earnings__total">
          <CurrencyValue amount={totalEarnings} />
        </span>
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
      <div className="earnings__details">
        <div className="earnings__item">
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
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Отработано:
          </span>
          <span className="earnings__item-value">{formatHours(totalHours)}</span>
        </div>
        <div className="earnings__item earnings__item--overtime">
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
            >
              <path d="M16 7h6v6"></path>
              <path d="m22 7-8.5 8.5-5-5L2 17"></path>
            </svg>
            Переработка:
          </span>
          <span className="earnings__item-value">{formatHours(totalOvertime)}</span>
        </div>
        <div className="earnings__item earnings__item--undertime">
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
            >
              <path d="M16 17h6v-6"></path>
              <path d="m22 17-8.5-8.5-5 5L2 7"></path>
            </svg>
            Недоработка:
          </span>
          <span className="earnings__item-value">{formatHours(totalUndertime)}</span>
        </div>
        <div className="earnings__item">
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
        <div className="earnings__item">
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
            >
              <path d="M12 2v20"></path>
              <path d="m17 5-5-3-5 3"></path>
              <path d="m17 19-5 3-5-3"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            Норма в месяце:
          </span>
          <span className="earnings__item-value">{formatHours(workingHoursInMonth)}</span>
        </div>
      </div>
    </div>
  );
};

export const Earnings = memo(EarningsComponent);
