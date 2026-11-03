import { format } from 'date-fns';
import { CalendarDays, CheckCircle2, Circle, Clock, SquarePen, Trash2 } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { timeRange } from '../lib/dates';
import PriorityBadge from './PriorityBadge';
import Spinner from './Spinner';

export default function TaskDetail({ task }) {
  const { pending, toggleStatus, openEdit, deleteTask } = useTasks();
  const done = task.status === 'completed';
  const busy = pending[task._id];

  return (
    <div className="space-y-5 pt-2">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
              done ? 'bg-primary-tint text-primary' : 'bg-danger-tint text-danger'
            }`}
          >
            {done ? 'Completed' : 'In Progress'}
          </span>
          <PriorityBadge priority={task.priority} />
        </div>
        <h3 className={`text-xl font-semibold leading-snug ${done ? 'text-muted line-through' : ''}`}>{task.title}</h3>
      </div>

      <dl className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="flex items-center gap-1.5 text-[11px] text-muted">
            <CalendarDays size={13} /> Date
          </dt>
          <dd className="mt-1 text-sm font-medium">{format(new Date(task.startAt), 'EEEE, d MMM')}</dd>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="flex items-center gap-1.5 text-[11px] text-muted">
            <Clock size={13} /> Time
          </dt>
          <dd className="mt-1 text-sm font-medium">{timeRange(task)}</dd>
        </div>
      </dl>

      <div>
        <h4 className="label">Description</h4>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/80">
          {task.description || <span className="text-muted">No description</span>}
        </p>
      </div>

      <button
        type="button"
        onClick={() => toggleStatus(task)}
        disabled={!!busy}
        className={`flex w-full items-center justify-center gap-2 rounded-md border py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
          done ? 'border-line text-ink hover:bg-slate-50' : 'border-primary bg-primary-tint text-primary hover:bg-primary-soft'
        }`}
      >
        {busy === 'toggle' ? <Spinner size={17} /> : done ? <Circle size={17} /> : <CheckCircle2 size={17} />}
        {busy === 'toggle' ? 'Updating…' : done ? 'Mark as In Progress' : 'Mark as Completed'}
      </button>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => deleteTask(task)}
          disabled={!!busy}
          className="flex items-center justify-center gap-2 rounded-md bg-danger-tint py-3 text-sm font-medium text-danger transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy === 'delete' ? <Spinner /> : <Trash2 size={16} />}
          {busy === 'delete' ? 'Deleting…' : 'Delete'}
        </button>
        <button type="button" onClick={() => openEdit(task)} disabled={!!busy} className="btn-primary">
          <SquarePen size={16} /> Edit
        </button>
      </div>
    </div>
  );
}
