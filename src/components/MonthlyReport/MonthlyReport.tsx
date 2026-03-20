import React, { useState, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { db } from "../../services/database";
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
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const stats = useMemo(() => {
    return db.getMonthlyStats(selectedYear);
  }, [selectedYear]);

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
            label: (context: any) => {
              const value = context.raw as number;
              return `Заработок: ${value.toLocaleString("ru-RU")}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value: any) => `${value.toLocaleString("ru-RU")}`,
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
    const tabYears = db.getTabs().map((t) => t.year);
    const uniqueYears = Array.from(new Set([currentYear, ...tabYears]));
    return uniqueYears.sort((a, b) => a - b);
  }, [currentYear]);

  return (
    <div className="monthly-report">
      <div className="monthly-report__header">
        <h2 className="monthly-report__title">Отчёт по месяцам</h2>
        <select
          className="monthly-report__year-select"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
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
