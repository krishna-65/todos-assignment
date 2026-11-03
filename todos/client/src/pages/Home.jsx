import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, isSameDay, isToday, startOfDay } from 'date-fns';
import { CalendarRange, Plus, Search } from 'lucide-react';
import { api } from '../lib/api';
import { weekRange, weekStartOf } from '../lib/dates';
import { useAsync } from '../lib/useAsync';
import { useTasks } from '../context/TaskContext';
import WeekStrip from '../components/WeekStrip';
import StatCards from '../components/StatCards';
import ProgressBar from '../components/ProgressBar';
import TaskItem from '../components/TaskItem';
import WeekCard from '../components/WeekCard';
import EmptyState from '../components/EmptyState';

export default function Home() {
  const { version, openCreate } = useTasks();
  const [selected, setSelected] = useState(() => startOfDay(new Date()));
  const weekStart = weekStartOf(selected);
  const weekKey = weekStart.getTime();

  const { data: weekTasks, error } = useAsync(() => api.list(weekRange(weekStart)), [weekKey, version]);
  const { data: weeks } = useAsync(() => api.weeks(), [version]);

  const tasks = weekTasks ?? [];
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const dayTasks = tasks.filter((t) => isSameDay(new Date(t.startAt), selected));
  const busyDays = useMemo(() => new Set(tasks.map((t) => format(new Date(t.startAt), 'yyyy-MM-dd'))), [tasks]);
  const thisWeekKey = weekStartOf(new Date()).getTime();

  return (
    <main className="px-5 pb-32 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6 lg:px-10 lg:pt-8">
      <header className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted">{format(new Date(), 'EEEE, d MMMM')}</p>
          <h1 className="text-xl font-semibold">My Tasks</h1>
        </div>
        <span className="grid size-10 place-items-center rounded-full bg-primary text-sm font-semibold text-white">
          <CalendarRange size={18} />
        </span>
      </header>

      <Link
        to="/search"
        className="mb-6 flex items-center justify-between rounded-md border border-line bg-white px-4 py-3 text-sm text-muted transition hover:border-primary/40"
      >
        Search for a task
        <Search size={20} className="text-ink" />
      </Link>

      {error && (
        <p className="mb-4 rounded-md bg-danger-tint px-4 py-3 text-sm text-danger">
          Couldn't reach the server. Is the API running?
        </p>
      )}

      <div className="grid gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div className="space-y-7">
          <WeekStrip weekStart={weekStart} selected={selected} onSelect={(d) => setSelected(startOfDay(d))} busyDays={busyDays} />

          <StatCards
            completed={completed}
            pending={tasks.length - completed}
            label={weekKey === thisWeekKey ? 'This Week' : 'That Week'}
          />

          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-base font-semibold">Weekly Progress</h2>
              <span className="text-xs text-muted">
                {completed}/{tasks.length} done
              </span>
            </div>
            <ProgressBar value={completed} total={tasks.length} />
          </section>

          <section>
            <div className="mb-1 flex items-baseline justify-between">
              <h2 className="text-base font-semibold">
                {isToday(selected) ? 'Tasks Today' : `Tasks on ${format(selected, 'EEE, d MMM')}`}
              </h2>
              <Link to="/search" className="text-xs font-medium text-primary hover:underline">
                View All
              </Link>
            </div>
            {weekTasks && dayTasks.length === 0 ? (
              <div className="mt-3">
                <EmptyState
                  title="Nothing planned"
                  message="Enjoy the free time, or add something to do."
                  action={
                    <button
                      type="button"
                      onClick={() => openCreate(selected)}
                      className="mt-4 text-xs font-medium text-primary hover:underline"
                    >
                      + Add a task
                    </button>
                  }
                />
              </div>
            ) : (
              <ul>
                {!weekTasks
                  ? [0, 1, 2].map((i) => <li key={i} className="my-3 h-11 animate-pulse rounded-md bg-slate-100" />)
                  : dayTasks.map((task) => <TaskItem key={task._id} task={task} />)}
              </ul>
            )}
            {dayTasks.length > 0 && (
              <p className="mt-2 text-center text-[11px] text-slate-400 sm:hidden">Swipe left on a task to delete</p>
            )}
          </section>
        </div>

        <section aria-labelledby="weeks-heading">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 id="weeks-heading" className="text-base font-semibold">
              Weekly Overview
            </h2>
            <span className="text-xs text-muted">Mon – Sun</span>
          </div>
          {weeks?.length === 0 ? (
            <EmptyState title="No tasks yet" message="Tap + to create your first task." />
          ) : (
            <div className="space-y-3">
              {(weeks ?? []).map((week) => (
                <WeekCard
                  key={week.weekStart}
                  week={week}
                  defaultOpen={new Date(week.weekStart).getTime() === thisWeekKey}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-30 flex justify-center lg:justify-end lg:pr-[max(2.5rem,calc(50vw-32rem+2.5rem))]">
        <button
          type="button"
          onClick={() => openCreate(selected)}
          className="pointer-events-auto grid size-16 place-items-center rounded-full bg-primary text-white shadow-xl shadow-primary/40 transition hover:scale-105 active:scale-95"
          aria-label="Add task"
        >
          <Plus size={30} strokeWidth={1.75} />
        </button>
      </div>
    </main>
  );
}
