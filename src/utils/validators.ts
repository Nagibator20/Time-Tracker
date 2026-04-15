import { parseTime } from '../services/dateUtils';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  formatted?: string;
}

export const validateTime = (input: string): ValidationResult => {
  if (!input.trim()) {
    return { isValid: true };
  }

  let normalized = input;
  
  if (/^\d{3,4}$/.test(input)) {
    normalized = input.slice(0, 2) + ':' + input.slice(2);
  }

  const timeRegex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/;
  
  if (!timeRegex.test(normalized)) {
    return { isValid: false, error: 'Неверный формат. Используйте ЧЧ:ММ' };
  }

  return { isValid: true, formatted: normalized };
};

export const validateTimeRange = (timeIn: string, timeOut: string): ValidationResult => {
  if (!timeIn || !timeOut) {
    return { isValid: true };
  }

  const inTime = parseTime(timeIn);
  const outTime = parseTime(timeOut);

  if (!inTime || !outTime) {
    return { isValid: false, error: 'Неверный формат времени' };
  }

  const inMinutes = inTime.hours * 60 + inTime.minutes;
  const outMinutes = outTime.hours * 60 + outTime.minutes;

  if (outMinutes <= inMinutes && (inMinutes - outMinutes) < 12 * 60) {
    return { isValid: false, error: 'Время ухода должно быть позже времени прихода' };
  }

  return { isValid: true };
};

export const validateHourlyRate = (value: string): ValidationResult => {
  if (!value.trim()) {
    return { isValid: true, formatted: '0' };
  }

  const num = parseFloat(value);
  
  if (isNaN(num) || num < 0) {
    return { isValid: false, error: 'Введите положительное число' };
  }

  return { isValid: true, formatted: num.toString() };
};
