import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useAppStore } from "../../store";
import { getMonthNameShort, getMonthName } from "../../services/dateUtils";
import { formatHours } from "../../utils/formatters";
import { CurrencyValue } from "../CurrencyValue";
import { useDatabase } from "../../hooks/useDatabase";
import "./MonthlyReport.scss";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export const MonthlyReport: React.FC = () => {
  const { settings } = useDatabase();
  const timeRecords = useAppStore((s) => s.timeRecords);
  const tabs = useAppStore((s) => s.tabs);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectYear = useCallback((year: number) => {
    setSelectedYear(year);
    setIsDropdownOpen(false);
  }, []);

  const stats = useMemo(() => {
    const monthlyStats = [];
    for (let month = 0; month < 12; month++) {
      let totalHours = 0;
      let totalOvertime = 0;
      let totalUndertime = 0;
      let totalEarnings = 0;
      let workingDays = 0;

      const monthStr = (month + 1).toString().padStart(2, '0');
      
      timeRecords
        .filter(r => r.date.startsWith(`${selectedYear}-${monthStr}`))
        .forEach(r => {
          totalHours += r.hoursWorked;
          totalOvertime += r.overtimeHours;
          totalUndertime += r.undertimeHours;
          totalEarnings += r.dailyEarnings;
          if (r.timeIn && r.timeOut) workingDays++;
        });

      monthlyStats.push({
        year: selectedYear,
        month,
        totalHours,
        totalOvertime,
        totalUndertime,
        totalEarnings,
        workingDays
      });
    }
    return monthlyStats;
  }, [selectedYear, timeRecords]);

  const chartData = useMemo(
    () => ({
      labels: stats.map((s) => getMonthNameShort(s.month)),
      datasets: [
        {
          label: "Заработок",
          data: stats.map((s) => s.totalEarnings),
          backgroundColor: "rgba(54, 162, 235, 0.7)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    }),
    [stats],
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top" as const,
        },
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<'bar'>) => {
              const value = context.raw as number;
              return `Заработок: ${value.toLocaleString("ru-RU")} ${settings.currency}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value: number | string) => `${Number(value).toLocaleString("ru-RU")}`,
          },
        },
      },
    }),
    [settings.currency],
  );

  const totals = useMemo(() => {
    return stats.reduce(
      (acc, s) => ({
        totalHours: acc.totalHours + s.totalHours,
        totalOvertime: acc.totalOvertime + s.totalOvertime,
        totalEarnings: acc.totalEarnings + s.totalEarnings,
        workingDays: acc.workingDays + s.workingDays,
      }),
      { totalHours: 0, totalOvertime: 0, totalEarnings: 0, workingDays: 0 },
    );
  }, [stats]);

  const years = useMemo(() => {
    const tabYears = tabs.map((t) => t.year);
    const uniqueYears = Array.from(new Set([currentYear, ...tabYears]));
    return uniqueYears.sort((a, b) => a - b);
  }, [currentYear, tabs]);

  return (
    <div className="monthly-report">
      <div className="monthly-report__header">
        <h2 className="monthly-report__title">Отчёт по месяцам</h2>
        <div className="monthly-report__year-select" ref={dropdownRef}>
          <button
            className="monthly-report__year-select-trigger"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
          >
            {selectedYear}
            <svg className="monthly-report__year-select-arrow" width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {isDropdownOpen && (
            <ul className="monthly-report__year-select-dropdown" role="listbox">
              {years.map((year) => (
                <li
                  key={year}
                  className={`monthly-report__year-select-option ${year === selectedYear ? 'monthly-report__year-select-option--selected' : ''}`}
                  onClick={() => handleSelectYear(year)}
                  role="option"
                  aria-selected={year === selectedYear}
                >
                  {year}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="monthly-report__chart">
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div className="monthly-report__summary">
        <div className="monthly-report__summary-item">
          <span className="monthly-report__summary-label">Итого за год:</span>
          <span className="monthly-report__summary-value monthly-report__summary-value--earnings">
            <CurrencyValue amount={totals.totalEarnings} />
          </span>
        </div>
        <div className="monthly-report__summary-item">
          <span className="monthly-report__summary-label">Отработано:</span>
          <span className="monthly-report__summary-value">
            {formatHours(totals.totalHours)}
          </span>
        </div>
        <div className="monthly-report__summary-item">
          <span className="monthly-report__summary-label">Переработка:</span>
          <span className="monthly-report__summary-value monthly-report__summary-value--overtime">
            {formatHours(totals.totalOvertime)}
          </span>
        </div>
        <div className="monthly-report__summary-item">
          <span className="monthly-report__summary-label">Рабочих дней:</span>
          <span className="monthly-report__summary-value">
            {totals.workingDays}
          </span>
        </div>
      </div>

      <table className="monthly-report__table">
        <thead>
          <tr>
            <th>Месяц</th>
            <th>Рабочих дней</th>
            <th>Отработано</th>
            <th>Переработка</th>
            <th>Заработано</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((s) => (
            <tr key={s.month}>
              <td>{getMonthName(s.month)}</td>
              <td>{s.workingDays}</td>
              <td>{formatHours(s.totalHours)}</td>
              <td className={s.totalOvertime > 0 ? "text-success" : ""}>
                {formatHours(s.totalOvertime)}
              </td>
              <td>
                <CurrencyValue amount={s.totalEarnings} />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>
              <strong>ИТОГО</strong>
            </td>
            <td>
              <strong>{totals.workingDays}</strong>
            </td>
            <td>
              <strong>{formatHours(totals.totalHours)}</strong>
            </td>
            <td>
              <strong>{formatHours(totals.totalOvertime)}</strong>
            </td>
            <td>
              <strong>
                <CurrencyValue amount={totals.totalEarnings} />
              </strong>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
