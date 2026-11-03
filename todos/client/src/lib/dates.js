import { addDays, differenceInCalendarWeeks, format, isSameMonth, startOfWeek } from 'date-fns';

// Weeks run Monday → Sunday
export const WEEK_OPTS = { weekStartsOn: 1 };

export const weekStartOf = (date) => startOfWeek(date, WEEK_OPTS);

export function weekRange(weekStart) {
  return { from: weekStart.toISOString(), to: addDays(weekStart, 7).toISOString() };
}

export function weekLabel(weekStart) {
  const diff = differenceInCalendarWeeks(weekStart, new Date(), WEEK_OPTS);
  if (diff === 0) return 'This week';
  if (diff === 1) return 'Next week';
  if (diff === -1) return 'Last week';
  return diff > 0 ? `In ${diff} weeks` : `${-diff} weeks ago`;
}

export function weekSpan(weekStart) {
  const end = addDays(weekStart, 6);
  return isSameMonth(weekStart, end)
    ? `${format(weekStart, 'd')} – ${format(end, 'd MMM yyyy')}`
    : `${format(weekStart, 'd MMM')} – ${format(end, 'd MMM yyyy')}`;
}

export function timeRange(task) {
  const start = format(new Date(task.startAt), 'h:mm a');
  return task.endAt ? `${start} – ${format(new Date(task.endAt), 'h:mm a')}` : start;
}
