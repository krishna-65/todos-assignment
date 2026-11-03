import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search as SearchIcon, SearchX, X } from 'lucide-react';
import { api } from '../lib/api';
import { useAsync, useDebounced } from '../lib/useAsync';
import { useTasks } from '../context/TaskContext';
import TaskItem from '../components/TaskItem';
import EmptyState from '../components/EmptyState';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export default function Search() {
  const navigate = useNavigate();
  const { version } = useTasks();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const status = params.get('status') ?? '';
  const debouncedQ = useDebounced(q.trim());

  const { data: results, loading } = useAsync(() => api.list({ q: debouncedQ, status }), [debouncedQ, status, version]);

  const update = (key, value) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        value ? next.set(key, value) : next.delete(key);
        return next;
      },
      { replace: true },
    );

  return (
    <main className="mx-auto max-w-2xl px-5 pb-12 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6 lg:pt-8">
      <button
        type="button"
        onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/home'))}
        className="icon-btn -ml-2 mb-4"
        aria-label="Back"
      >
        <ArrowLeft size={22} />
      </button>

      <label className="relative block">
        <span className="sr-only">Search tasks</span>
        <input
          autoFocus
          type="search"
          value={q}
          onChange={(e) => update('q', e.target.value)}
          placeholder="Search by title or description"
          className="field py-3.5 pl-4 pr-12 [&::-webkit-search-cancel-button]:hidden"
        />
        {q ? (
          <button
            type="button"
            onClick={() => update('q', '')}
            className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-slate-100"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        ) : (
          <SearchIcon size={20} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
        )}
      </label>

      <div className="mt-4 flex gap-2" role="group" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={status === f.value}
            onClick={() => update('status', f.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              status === f.value ? 'bg-primary text-white' : 'bg-slate-100 text-ink hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="mb-1 mt-5 text-xs text-muted" aria-live="polite">
        {results && (debouncedQ ? `${results.length} result${results.length === 1 ? '' : 's'} for “${debouncedQ}”` : `All tasks · ${results.length}`)}
        {loading && !results && 'Searching…'}
      </p>

      {results?.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon={SearchX} title="No tasks found" message="Try a different keyword or filter." />
        </div>
      ) : (
        <ul>{(results ?? []).map((task) => <TaskItem key={task._id} task={task} showDate />)}</ul>
      )}
    </main>
  );
}
