import { useState } from 'react';
import { format } from 'date-fns';
import { ChevronDown } from 'lucide-react';
import { api } from '../lib/api';
import { weekLabel, weekRange, weekSpan } from '../lib/dates';
import { useAsync } from '../lib/useAsync';
import { useTasks } from '../context/TaskContext';
import ProgressBar from './ProgressBar';
import TaskItem from './TaskItem';

export default function WeekCard({ week, defaultOpen = false }) {
  const { version } = useTasks();
  const [open, setOpen] = useState(defaultOpen);
  const weekStart = new Date(week.weekStart);
  const label = weekLabel(weekStart);
  const isCurrent = label === 'This week';

  const { data: tasks, loading } = useAsync(
    () => (open ? api.list(weekRange(weekStart)) : Promise.resolve(null)),
    [open, week.weekStart, version],
  );

  // Group the week's tasks by day for readability
  const byDay = (tasks ?? []).reduce((acc, task) => {
    const key = format(new Date(task.startAt), 'yyyy-MM-dd');
    (acc[key] ??= []).push(task);
    return acc;
  }, {});

  return (
    <article
      className={`overflow-hidden rounded-xl border bg-white transition ${
        open ? 'border-primary/30 shadow-lg shadow-primary/5' : 'border-line hover:border-primary/30'
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">{label}</h3>
            {isCurrent && <span className="size-1.5 rounded-full bg-primary" />}
          </div>
          <p className="mt-0.5 text-[11px] text-muted">{weekSpan(weekStart)}</p>

          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium">
            <span className="rounded-full bg-danger-tint px-2.5 py-1 text-danger">{week.open} Open</span>
            <span className="rounded-full bg-primary-tint px-2.5 py-1 text-primary">{week.completed} Completed</span>
          </div>
          <div className="mt-3">
            <ProgressBar value={week.completed} total={week.total} size="sm" />
          </div>
        </div>
        <ChevronDown size={20} className={`mt-0.5 shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-line px-4 pb-2">
          {loading && !tasks ? (
            <div className="space-y-3 py-4">
              {[0, 1].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded-md bg-slate-100" />
              ))}
            </div>
          ) : (
            Object.entries(byDay).map(([day, items]) => (
              <section key={day} className="pt-3">
                <h4 className="text-[11px] font-medium uppercase tracking-wide text-muted">
                  {format(new Date(`${day}T00:00`), 'EEEE, d MMM')}
                </h4>
                <ul>
                  {items.map((task) => (
                    <TaskItem key={task._id} task={task} />
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      )}
    </article>
  );
}
