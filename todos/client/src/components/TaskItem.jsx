import { useRef, useState } from 'react';
import { format } from 'date-fns';
import { Clock, SquarePen, Trash2 } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { timeRange } from '../lib/dates';
import Checkbox from './Checkbox';
import PriorityBadge from './PriorityBadge';

const REVEAL = 88; // width of the swipe-to-delete action

export default function TaskItem({ task, showDate = false }) {
  const { toggleStatus, deleteTask, openEdit, openView } = useTasks();
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef(null);
  const suppressClick = useRef(false);
  const done = task.status === 'completed';

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    suppressClick.current = false;
    drag.current = { x: e.clientX, y: e.clientY, base: offset, axis: null };
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.axis) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      d.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (d.axis === 'x') {
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
      }
    }
    if (d.axis === 'x') setOffset(Math.max(-REVEAL - 24, Math.min(0, d.base + dx)));
  };

  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d?.axis !== 'x') return;
    suppressClick.current = true;
    setDragging(false);
    setOffset((o) => (o < -REVEAL / 2 ? -REVEAL : 0));
  };

  const onRowClick = () => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (offset !== 0) return setOffset(0);
    openView(task);
  };

  return (
    <li className="relative overflow-hidden border-b border-line last:border-b-0">
      <button
        type="button"
        onClick={() => deleteTask(task)}
        tabIndex={offset ? 0 : -1}
        aria-hidden={!offset}
        className="absolute inset-y-0 right-0 flex items-center justify-center gap-1.5 bg-danger text-sm font-medium text-white"
        style={{ width: REVEAL }}
      >
        <Trash2 size={16} /> Delete
      </button>

      <div
        role="button"
        tabIndex={0}
        onClick={onRowClick}
        onKeyDown={(e) => e.key === 'Enter' && e.target === e.currentTarget && openView(task)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ transform: `translateX(${offset}px)`, touchAction: 'pan-y' }}
        className={`relative flex cursor-pointer select-none items-center gap-3.5 bg-white py-4 pr-1 outline-none focus-visible:bg-primary-tint/60 ${
          dragging ? '' : 'transition-transform duration-200'
        }`}
      >
        <Checkbox
          checked={done}
          onChange={() => toggleStatus(task)}
          label={done ? `Mark "${task.title}" as in progress` : `Mark "${task.title}" as completed`}
        />

        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-medium ${done ? 'text-muted line-through decoration-ink/60' : 'text-ink'}`}>
            {task.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted">
            <span className="inline-flex items-center gap-1">
              <Clock size={11} />
              {showDate && `${format(new Date(task.startAt), 'EEE, d MMM')} · `}
              {timeRange(task)}
            </span>
            <PriorityBadge priority={task.priority} />
          </div>
        </div>

        <div className="flex shrink-0 items-center text-slate-300">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              deleteTask(task);
            }}
            className="grid size-9 place-items-center rounded-full transition hover:bg-red-50 hover:text-danger"
            aria-label={`Delete "${task.title}"`}
          >
            <Trash2 size={19} strokeWidth={1.6} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openEdit(task);
            }}
            className="grid size-9 place-items-center rounded-full transition hover:bg-primary-tint hover:text-primary"
            aria-label={`Edit "${task.title}"`}
          >
            <SquarePen size={19} strokeWidth={1.6} />
          </button>
        </div>
      </div>
    </li>
  );
}
