export const HOLIDAYS_2027_Q1: Record<string, string> = {
  '2027-01-01': '신정',
  '2027-02-06': '설날 연휴',
  '2027-02-07': '설날',
  '2027-02-08': '설날 연휴',
  '2027-02-09': '대체공휴일',
  '2027-03-01': '삼일절',
};

export interface CalendarDay {
  dateStr: string; // '2027-01-01'
  dayNumber: number;
  month: number; // 1, 2, 3
  year: number; // 2027
  isCurrentMonth: boolean;
  isWeekend: boolean;
  holidayName?: string;
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
}

/**
 * Checks if a given date string is a working day (Mon-Fri and not a holiday)
 */
export function isWorkingDay(dateStr: string): boolean {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const dayOfWeek = d.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;
  if (HOLIDAYS_2027_Q1[dateStr]) return false;
  return true;
}

/**
 * Calculates total working days (excluding weekends and official holidays) between two dates inclusive
 */
export function countWorkingDays(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 0;
  const [sy, sm, sd] = startDateStr.split('-').map(Number);
  const [ey, em, ed] = endDateStr.split('-').map(Number);
  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 0;

  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const yStr = cur.getFullYear();
    const mStr = String(cur.getMonth() + 1).padStart(2, '0');
    const dStr = String(cur.getDate()).padStart(2, '0');
    const dateStr = `${yStr}-${mStr}-${dStr}`;

    if (isWorkingDay(dateStr)) {
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

/**
 * Add N working days to a start date, skipping weekends and holidays.
 * E.g., start 2027-01-04 (Mon) + 1 day => 2027-01-04 (same day)
 * + 5 days => 2027-01-08 (Fri)
 */
export function calculateWorkingDaysEndDate(startDateStr: string, requiredDays: number): string {
  const [year, month, day] = startDateStr.split('-').map(Number);
  let cur = new Date(year, month - 1, day);
  
  // Ceiling or round days, minimum 1 day
  const targetDays = Math.max(1, Math.ceil(requiredDays));
  let count = 0;

  // If start date is a working day, count it as day 1
  while (count < targetDays) {
    const yStr = cur.getFullYear();
    const mStr = String(cur.getMonth() + 1).padStart(2, '0');
    const dStr = String(cur.getDate()).padStart(2, '0');
    const dateStr = `${yStr}-${mStr}-${dStr}`;

    const dow = cur.getDay();
    const isWknd = dow === 0 || dow === 6;
    const isHol = !!HOLIDAYS_2027_Q1[dateStr];

    if (!isWknd && !isHol) {
      count++;
      if (count === targetDays) {
        return dateStr;
      }
    }

    // Move to next calendar day
    cur.setDate(cur.getDate() + 1);
  }

  const yStr = cur.getFullYear();
  const mStr = String(cur.getMonth() + 1).padStart(2, '0');
  const dStr = String(cur.getDate()).padStart(2, '0');
  return `${yStr}-${mStr}-${dStr}`;
}

/**
 * Checks if a date falls between start and end (inclusive)
 */
export function isDateInRange(targetDateStr: string, startDateStr?: string, endDateStr?: string): boolean {
  if (!startDateStr) return false;
  const end = endDateStr || startDateStr;
  return targetDateStr >= startDateStr && targetDateStr <= end;
}

/**
 * Generates the full 7-column calendar matrix for a given month in 2027
 */
export function getMonthGrid(year: number, month: number): CalendarDay[] {
  const days: CalendarDay[] = [];
  
  // First day of month
  const firstDay = new Date(year, month - 1, 1);
  const firstDayOfWeek = firstDay.getDay(); // 0=Sun, 1=Mon...
  
  // Total days in this month
  const lastDate = new Date(year, month, 0).getDate();
  
  // Days from previous month to fill the first row
  const prevMonthLastDate = new Date(year, month - 1, 0).getDate();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDate - i;
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dateObj = new Date(prevYear, prevMonth - 1, d);
    const dow = dateObj.getDay();

    days.push({
      dateStr,
      dayNumber: d,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false,
      isWeekend: dow === 0 || dow === 6,
      holidayName: HOLIDAYS_2027_Q1[dateStr],
      dayOfWeek: dow,
    });
  }

  // Days of current month
  for (let d = 1; d <= lastDate; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dateObj = new Date(year, month - 1, d);
    const dow = dateObj.getDay();

    days.push({
      dateStr,
      dayNumber: d,
      month,
      year,
      isCurrentMonth: true,
      isWeekend: dow === 0 || dow === 6,
      holidayName: HOLIDAYS_2027_Q1[dateStr],
      dayOfWeek: dow,
    });
  }

  // Days from next month to fill remaining cells up to multiple of 7
  const remainder = days.length % 7;
  if (remainder > 0) {
    const nextDaysNeeded = 7 - remainder;
    for (let d = 1; d <= nextDaysNeeded; d++) {
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dateObj = new Date(nextYear, nextMonth - 1, d);
      const dow = dateObj.getDay();

      days.push({
        dateStr,
        dayNumber: d,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
        isWeekend: dow === 0 || dow === 6,
        holidayName: HOLIDAYS_2027_Q1[dateStr],
        dayOfWeek: dow,
      });
    }
  }

  return days;
}
