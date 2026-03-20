import React, { useCallback, memo } from 'react';
import { TimeRecord } from '../../types';
import { TimeRow } from '../TimeRow';
import './TimeTable.scss';

interface TimeTableProps {
  records: TimeRecord[];
  onUpdateRecord: (date: string, timeIn: string | undefined, timeOut: string | undefined) => void;
}

const TimeTableComponent: React.FC<TimeTableProps> = ({ records, onUpdateRecord }) => {
  const handleUpdate = useCallback((date: string, timeIn: string | undefined, timeOut: string | undefined) => {
    onUpdateRecord(date, timeIn, timeOut);
  }, [onUpdateRecord]);

  return (
    <div className="time-table-wrapper">
      <div className="time-table">
        <div className="time-table__header" role="row">
          <div className="time-table__cell" role="columnheader">Дата</div>
          <div className="time-table__cell" role="columnheader">Приход</div>
          <div className="time-table__cell" role="columnheader">Уход</div>
          <div className="time-table__cell" role="columnheader">Часы</div>
          <div className="time-table__cell" role="columnheader">Статус</div>
          <div className="time-table__cell time-table__cell--earnings" role="columnheader">Заработок</div>
        </div>
        <div className="time-table__body" role="rowgroup">
          {records.map((record) => (
            <TimeRow
              key={record.id}
              record={record}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      </div>
      {records.length === 0 && (
        <div className="time-table__empty">
          <p>Нет записей для отображения</p>
          <p className="time-table__empty-hint">Создайте вкладку для начала работы</p>
        </div>
      )}
    </div>
  );
};

export const TimeTable = memo(TimeTableComponent);
