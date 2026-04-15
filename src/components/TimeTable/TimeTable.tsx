import React, { useCallback, memo } from 'react';
import { TimeRecord } from '../../types';
import { TimeRow } from '../TimeRow';
import './TimeTable.scss';

type TimeTableProps = {
  records: TimeRecord[];
  onUpdateRecord: (date: string, timeIn: string | undefined, timeOut: string | undefined, comment?: string) => void;
};

const TimeTableComponent: React.FC<TimeTableProps> = ({ records, onUpdateRecord }) => {
  const handleUpdate = useCallback((date: string, timeIn: string | undefined, timeOut: string | undefined, comment?: string) => {
    onUpdateRecord(date, timeIn, timeOut, comment);
  }, [onUpdateRecord]);

  const renderRow = useCallback((record: TimeRecord) => (
    <TimeRow
      key={record.id}
      record={record}
      onUpdate={handleUpdate}
    />
  ), [handleUpdate]);

  return (
    <div className="time-table-wrapper">
      <table className="time-table" aria-label="Табель учёта времени">
        <thead>
          <tr>
            <th className="time-table__col--date">Дата</th>
            <th className="time-table__col--time">Приход</th>
            <th className="time-table__col--time">Уход</th>
            <th className="time-table__col--hours">Часы</th>
            <th className="time-table__col--status">Статус</th>
            <th className="time-table__col--earnings">Заработок</th>
            <th className="time-table__col--comment">Комментарий</th>
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td colSpan={7} className="time-table__empty">
                <p>Нет записей для отображения</p>
                <p className="time-table__empty-hint">Создайте вкладку для начала работы</p>
              </td>
            </tr>
          ) : (
            records.map(renderRow)
          )}
        </tbody>
      </table>
    </div>
  );
};

export const TimeTable = memo(TimeTableComponent);
