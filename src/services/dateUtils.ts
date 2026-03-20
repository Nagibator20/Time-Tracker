import { format, getDay, startOfMonth, endOfMonth, eachDayOfInterval, getDaysInMonth as getDaysInMonthFromDateFns } from 'date-fns';
import { ru } from 'date-fns/locale';

export const formatDate = (date: Date): string => {
  return format(date, 'dd.MM.yyyy', { locale: ru });
};

export const formatDateShort = (date: Date): string => {
  return format(date, 'dd.MM.yy', { locale: ru });
};

export const formatDateISO = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const getDayName = (date: Date): string => {
  const names = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  return names[getDay(date)];
};

export const getDayNameShort = (date: Date): string => {
  const names = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  return names[getDay(date)];
};

export const isWorkingDay = (date: Date): boolean => {
  const dayOfWeek = getDay(date);
  return dayOfWeek !== 0 && dayOfWeek !== 6;
};

export const getDaysInMonth = (date: Date): number => {
  return getDaysInMonthFromDateFns(date);
};

export const getWorkingDaysInMonth = (year: number, month: number): Date[] => {
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(new Date(year, month));
  const allDays = eachDayOfInterval({ start, end });
  return allDays.filter(isWorkingDay);
};

export const countWorkingDaysInMonth = (year: number, month: number): number => {
  return getWorkingDaysInMonth(year, month).length;
};

export const getMonthName = (month: number): string => {
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  return months[month];
};

export const getMonthNameShort = (month: number): string => {
  const months = [
    'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
    'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
  ];
  return months[month];
};

export const parseTime = (time: string): { hours: number; minutes: number } | null => {
  const regex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/;
  const match = time.match(regex);
  if (!match) return null;
  return {
    hours: parseInt(match[1], 10),
    minutes: parseInt(match[2], 10)
  };
};

export const formatTime = (time: string): string => {
  const parsed = parseTime(time);
  if (!parsed) return time;
  return `${parsed.hours.toString().padStart(2, '0')}:${parsed.minutes.toString().padStart(2, '0')}`;
};
