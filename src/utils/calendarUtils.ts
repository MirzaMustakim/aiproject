import { Holiday, Process } from '../types/roster';

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getDayOfWeek(year: number, month: number, day: number): number {
  return new Date(year, month - 1, day).getDay();
}

export function formatDateStr(year: number, month: number, day: number): string {
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export function getHolidayOnDay(year: number, month: number, day: number, holidays: Holiday[]): Holiday | undefined {
  const dateStr = formatDateStr(year, month, day);
  return holidays.find(h => h.date === dateStr);
}

/**
 * Checks if a process needs operational coverage on a specific day
 */
export function isProcessOperating(
  year: number,
  month: number,
  day: number,
  process: Process,
  holidays: Holiday[]
): boolean {
  const dow = getDayOfWeek(year, month, day);
  const holiday = getHolidayOnDay(year, month, day, holidays);

  switch (process.calendarType) {
    case '365_DAYS':
      // 365 days operations: never takes Sunday or Public Holiday off
      return true;

    case 'DAILY_EXCEPT_HOLIDAYS':
      // Operates daily, off ONLY on official public holidays
      return !holiday;

    case 'SUNDAYS_AND_HOLIDAYS_OFF':
      // Sundays off (dow === 0) AND official public holidays off
      return dow !== 0 && !holiday;

    default:
      return true;
  }
}
