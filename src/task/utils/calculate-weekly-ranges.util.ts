import { DateRange } from '../interface/data-range.interface';

export const calculateWeeklyRanges = (month: Date): DateRange[] => {
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
  const ranges = [];

  while (start < end) {
    let weekEnd = new Date(start);
    weekEnd.setDate(weekEnd.getDate() + 6); // Sumar 6 para completar la semana
    if (weekEnd > end) weekEnd = end;

    ranges.push({ start: new Date(start), end: new Date(weekEnd) });
    start.setDate(start.getDate() + 7);
  }

  return ranges;
};
