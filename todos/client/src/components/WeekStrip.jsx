import { addDays, format, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function WeekStrip({ weekStart, selected, onSelect, busyDays }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium">{format(selected, 'MMMM yyyy')}</h2>
        <div className="flex items-center gap-1">
          {!isToday(selected) && (
            <button
              type="button"
              onClick={() => onSelect(new Date())}
              className="mr-1 rounded-full px-3 py-1 text-xs font-medium text-primary hover:bg-primary-tint"
            >
              Today
            </button>
          )}
          <button type="button" className="icon-btn size-8" onClick={() => onSelect(addDays(selected, -7))} aria-label="Previous week">
            <ChevronLeft size={18} />
          </button>
          <button type="button" className="icon-btn size-8" onClick={() => onSelect(addDays(selected, 7))} aria-label="Next week">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1" role="listbox" aria-label="Select day">
        {days.map((day) => {
          const active = isSameDay(day, selected);
          const today = isToday(day);
          const hasTasks = busyDays.has(format(day, 'yyyy-MM-dd'));
          return (
            <button
              key={day.toISOString()}
              type="button"
              role="option"
              aria-selected={active}
              onClick={() => onSelect(day)}
              className={`flex flex-col items-center gap-1 rounded-sm py-2.5 transition ${
                active ? 'bg-primary text-white shadow-md shadow-primary/30' : 'text-muted hover:bg-primary-tint'
              }`}
            >
              <span className="text-[10px]">{format(day, 'EEE')}</span>
              <span className={`text-sm font-medium ${!active && today ? 'text-primary' : ''}`}>{format(day, 'dd')}</span>
              <span
                className={`size-1 rounded-full ${hasTasks ? (active ? 'bg-white' : 'bg-primary') : 'bg-transparent'}`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
