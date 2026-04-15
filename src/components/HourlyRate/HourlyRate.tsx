import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDatabase } from '../../hooks/useDatabase';
import { useAppStore } from '../../store';
import { CurrencyIcon } from '../icons/CurrencyIcon';
import './HourlyRate.scss';

interface HourlyRateModalProps {
  onClose: () => void;
}

const formatLunchMinutes = (decimalHours: number): string => {
  const totalMinutes = Math.round(decimalHours * 60);
  return totalMinutes.toString();
};

const parseLunchMinutes = (input: string): number => {
  const trimmed = input.trim();
  if (!trimmed) return 0;
  const num = parseInt(trimmed, 10);
  if (isNaN(num) || num < 0 || num > 240) return 0;
  return num / 60;
};

export const HourlyRateModal: React.FC<HourlyRateModalProps> = ({ onClose }) => {
  const { settings, updateHourlyRate, updateStandardHours, updateLunchDuration } = useDatabase();
  const areEarningsVisible = useAppStore((s) => s.areEarningsVisible);
  const toggleEarningsVisibility = useAppStore((s) => s.toggleEarningsVisibility);
  const [rateInput, setRateInput] = useState((settings?.hourlyRate ?? 0).toString());
  const [hoursInput, setHoursInput] = useState((settings?.standardHours ?? 8).toString());
  const [lunchDisplay, setLunchDisplay] = useState(formatLunchMinutes(settings?.lunchDuration ?? 1));
  const lunchInputRef = useRef(lunchDisplay);
  const rateInputRef = useRef<HTMLInputElement>(null);
  const hoursInputRef = useRef<HTMLInputElement>(null);
  const lunchFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRateInput((settings?.hourlyRate ?? 0).toString());
    setHoursInput((settings?.standardHours ?? 8).toString());
    const lunchVal = settings?.lunchDuration ?? 1;
    setLunchDisplay(formatLunchMinutes(lunchVal));
    lunchInputRef.current = formatLunchMinutes(lunchVal);
  }, [settings]);

  useEffect(() => {
    const handleRateWheel = (e: globalThis.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.01 : 0.01;
      setRateInput((prev) => {
        const current = parseFloat(prev) || 0;
        return Math.max(0, Math.round((current + delta) * 100) / 100).toString();
      });
    };

    const handleHoursWheel = (e: globalThis.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -1 : 1;
      setHoursInput((prev) => {
        const current = parseInt(prev, 10) || 0;
        return Math.min(24, Math.max(1, current + delta)).toString();
      });
    };

    const handleLunchWheel = (e: globalThis.WheelEvent) => {
      e.preventDefault();
      const isScrollingUp = e.deltaY < 0;
      const currentMinutes = parseInt(lunchInputRef.current, 10) || 0;
      const newMinutes = isScrollingUp
        ? Math.min(240, currentMinutes + 5)
        : Math.max(0, currentMinutes - 5);
      setLunchDisplay(newMinutes.toString());
      lunchInputRef.current = newMinutes.toString();
    };

    const rateEl = rateInputRef.current;
    const hoursEl = hoursInputRef.current;
    const lunchEl = lunchFieldRef.current;

    rateEl?.addEventListener('wheel', handleRateWheel, { passive: false });
    hoursEl?.addEventListener('wheel', handleHoursWheel, { passive: false });
    lunchEl?.addEventListener('wheel', handleLunchWheel, { passive: false });

    return () => {
      rateEl?.removeEventListener('wheel', handleRateWheel);
      hoursEl?.removeEventListener('wheel', handleHoursWheel);
      lunchEl?.removeEventListener('wheel', handleLunchWheel);
    };
  }, []);

  const handleLunchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLunchDisplay(e.target.value);
    lunchInputRef.current = e.target.value;
  }, []);

  const handleSave = useCallback(() => {
    const rate = parseFloat(rateInput);
    const hours = parseFloat(hoursInput);
    const lunch = parseLunchMinutes(lunchDisplay);

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
  }, [rateInput, hoursInput, lunchDisplay, updateHourlyRate, updateStandardHours, updateLunchDuration, onClose]);

  return (
    <div className="hourly-rate">
      <div className="hourly-rate__row">
        <div className="hourly-rate__group">
          <label className="hourly-rate__label">Стоимость часа:</label>
          <input
            ref={rateInputRef}
            type="number"
            className="hourly-rate__input"
            value={rateInput}
            onChange={(e) => setRateInput(e.target.value)}
            step="0.01"
            min="0"
            lang="en-US"
            inputMode="decimal"
          />
          <CurrencyIcon />
        </div>
        <div className="hourly-rate__group">
          <label className="hourly-rate__label">Рабочий день:</label>
          <input
            ref={hoursInputRef}
            type="number"
            className="hourly-rate__input hourly-rate__input--small"
            value={hoursInput}
            onChange={(e) => setHoursInput(e.target.value)}
            step="1"
            min="1"
            max="24"
            lang="en-US"
          />
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div className="hourly-rate__group">
          <label className="hourly-rate__label">Обед:</label>
          <input
            ref={lunchFieldRef}
            type="number"
            className="hourly-rate__input hourly-rate__input--small"
            value={lunchDisplay}
            onChange={handleLunchChange}
            step="5"
            min="0"
            max="240"
            lang="en-US"
          />
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" fill="currentColor">
            <path d="M304 432 c-71 -67 -87 -93 -79 -130 5 -25 -3 -35 -80 -100 -90 -76 -141 -141 -131 -167 19 -50 85 -11 188 110 65 77 75 85 100 80 36 -8 62 8 132 82 l58 62 -21 34 c-18 29 -87 88 -102 87 -2 -1 -31 -27 -65 -58z m46 -27 c-24 -24 -41 -48 -37 -52 4 -4 29 14 55 40 38 37 50 45 60 35 10 -10 2 -22 -35 -60 -26 -26 -44 -51 -40 -55 4 -4 28 13 52 37 29 29 48 41 55 34 6 -6 -13 -33 -54 -78 -62 -67 -65 -68 -103 -62 -38 7 -39 7 -110 -77 -85 -101 -139 -145 -155 -129 -16 16 28 70 129 155 84 72 84 72 77 111 -6 38 -5 40 62 102 45 43 71 61 78 54 7 -7 -5 -25 -34 -55z"/>
          </svg>
        </div>
      </div>
      <div className="hourly-rate__actions">
        <button
          className={`hourly-rate__visibility-btn ${areEarningsVisible ? 'hourly-rate__visibility-btn--active' : ''}`}
          onClick={toggleEarningsVisibility}
          aria-label={areEarningsVisible ? 'Скрыть суммы' : 'Показать суммы'}
          title={areEarningsVisible ? 'Скрыть суммы' : 'Показать суммы'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="18" className="hourly-rate__eye-icon">
            <g transform="translate(0,512) scale(0.1,-0.1)">
              <path d="M1245 4612 c-149 -51 -260 -166 -309 -317 -12 -38 -236 -1506 -236
-1547 0 -4 -134 -8 -299 -8 -293 0 -299 0 -332 -23 -91 -61 -89 -181 5 -251
l27 -21 2459 0 2459 0 27 21 c94 70 96 190 5 251 -33 23 -39 23 -332 23 -165
0 -299 4 -299 8 0 41 -224 1509 -236 1547 -42 130 -129 232 -250 292 -71 35
-85 38 -179 41 -130 5 -149 0 -479 -140 -144 -60 -303 -121 -354 -134 -207
-53 -507 -54 -713 -3 -46 12 -205 72 -354 134 -148 62 -294 120 -324 129 -74
22 -221 21 -286 -2z m485 -401 c404 -172 504 -195 830 -195 328 0 426 23 831
195 224 95 274 113 329 116 56 4 70 1 100 -19 69 -47 76 -72 139 -495 l57
-388 -728 -3 c-400 -1 -1056 -1 -1456 0 l-728 3 57 388 c63 423 70 448 139
495 30 20 44 23 100 19 55 -3 105 -21 330 -116z m2331 -1093 c9 -42 54 -370
51 -373 -7 -7 -3097 -7 -3104 0 -3 3 42 331 51 373 1 1 676 2 1501 2 825 0
1500 -1 1501 -2z"/>
              <path d="M1420 2126 c-190 -40 -371 -150 -485 -295 l-46 -58 -130 -5 c-144 -5
-162 -12 -207 -79 -19 -28 -23 -44 -20 -85 7 -89 60 -134 168 -142 l66 -4 -8
-62 c-24 -163 30 -384 129 -533 157 -237 409 -373 690 -373 247 0 440 83 605
259 141 151 206 301 226 523 6 62 15 107 26 123 56 86 196 86 252 0 11 -16 20
-61 26 -123 20 -222 85 -372 226 -523 165 -176 359 -259 605 -259 436 0 785
327 822 770 3 41 2 103 -3 136 l-8 62 66 4 c108 8 161 53 168 142 3 41 -1 57
-20 85 -45 67 -64 74 -207 79 l-130 5 -51 63 c-256 316 -710 396 -1065 188
-93 -55 -222 -180 -275 -267 -25 -41 -39 -55 -50 -50 -8 3 -44 17 -80 29 -110
39 -273 28 -362 -24 -15 -9 -29 -14 -31 -11 -2 2 -24 33 -47 69 -113 168 -253
272 -450 335 -104 33 -294 43 -400 21z m343 -320 c128 -48 234 -146 292 -269
166 -347 -88 -747 -473 -747 -238 0 -441 153 -507 384 -24 82 -22 213 4 297
53 170 202 309 379 354 85 22 220 13 305 -19z m1895 19 c339 -80 505 -455 340
-767 -61 -114 -194 -219 -323 -252 -362 -95 -710 212 -657 578 44 305 342 511
640 441z"/>
            </g>
          </svg>
        </button>
        <button 
          className="hourly-rate__save-btn" 
          onClick={handleSave}
        >
          Сохранить
        </button>
      </div>
    </div>
  );
};
