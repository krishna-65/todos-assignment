import { useState } from 'react';
import { addHours, format, startOfHour } from 'date-fns';
import { Clock } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { PRIORITY_STYLES } from './PriorityBadge';
import Spinner from './Spinner';

const SERVER_FIELD = { startAt: 'start', endAt: 'end' };

function initialValues(task, defaultDate) {
  if (task) {
    const start = new Date(task.startAt);
    return {
      title: task.title,
      description: task.description ?? '',
      date: format(start, 'yyyy-MM-dd'),
      start: format(start, 'HH:mm'),
      end: task.endAt ? format(new Date(task.endAt), 'HH:mm') : '',
      priority: task.priority ?? '',
    };
  }
  return {
    title: '',
    description: '',
    date: format(defaultDate ?? new Date(), 'yyyy-MM-dd'),
    start: format(startOfHour(addHours(new Date(), 1)), 'HH:mm'),
    end: '',
    priority: '',
  };
}

function validate(v) {
  const errors = {};
  if (!v.title.trim()) errors.title = 'Please enter a task title';
  if (!v.date) errors.date = 'Please pick a date';
  if (!v.start) errors.start = 'Start time is required';
  if (v.start && v.end && v.end <= v.start) errors.end = 'Must be after start';
  return errors;
}

export default function TaskForm({ task, defaultDate }) {
  const { saveTask } = useTasks();
  const [values, setValues] = useState(() => initialValues(task, defaultDate));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    setErrors((errs) => ({ ...errs, [field]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    setFormError('');
    try {
      await saveTask(
        {
          title: values.title.trim(),
          description: values.description.trim(),
          startAt: new Date(`${values.date}T${values.start}`).toISOString(),
          endAt: values.end ? new Date(`${values.date}T${values.end}`).toISOString() : null,
          priority: values.priority || null,
        },
        task?._id,
      );
    } catch (err) {
      const fieldErrors = Object.fromEntries(
        Object.entries(err.fields ?? {}).map(([k, msg]) => [SERVER_FIELD[k] ?? k, msg]),
      );
      setErrors(fieldErrors);
      setFormError(Object.keys(fieldErrors).length ? '' : err.message);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5 pt-3">
      <div>
        <label htmlFor="title" className="label">
          Task title <span className="text-danger">*</span>
        </label>
        <input
          id="title"
          autoFocus={!task}
          value={values.title}
          onChange={set('title')}
          maxLength={120}
          placeholder="e.g. Doing Homework"
          className={`field ${errors.title ? 'field-error' : ''}`}
          aria-invalid={!!errors.title}
        />
        <FieldError message={errors.title} />
      </div>

      <div>
        <span className="label">
          Set Time <span className="text-danger">*</span>
        </span>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="relative block">
              <span className="sr-only">Start time</span>
              <Clock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink" />
              <input
                type="time"
                value={values.start}
                onChange={set('start')}
                className={`field pl-9 ${errors.start ? 'field-error' : ''}`}
              />
            </label>
            <FieldError message={errors.start} />
          </div>
          <div>
            <label className="relative block">
              <span className="sr-only">End time (optional)</span>
              <Clock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink" />
              <input
                type="time"
                value={values.end}
                onChange={set('end')}
                className={`field pl-9 ${values.end ? '' : 'text-muted'} ${errors.end ? 'field-error' : ''}`}
              />
            </label>
            <FieldError message={errors.end} hint="Ends (optional)" />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="date" className="label">
          Set Date <span className="text-danger">*</span>
        </label>
        <input
          id="date"
          type="date"
          value={values.date}
          onChange={set('date')}
          className={`field ${errors.date ? 'field-error' : ''}`}
        />
        <FieldError message={errors.date} />
      </div>

      <fieldset>
        <legend className="label">Priority</legend>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(PRIORITY_STYLES).map(([key, style]) => {
            const active = values.priority === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => setValues((v) => ({ ...v, priority: active ? '' : key }))}
                className={`flex items-center justify-center gap-2 rounded-md border py-2.5 text-sm transition ${
                  active ? 'border-primary bg-primary-tint font-medium text-primary' : 'border-line text-ink hover:bg-slate-50'
                }`}
              >
                <span className={`size-2 rounded-full ${style.dot}`} />
                {style.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="description" className="label">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          value={values.description}
          onChange={set('description')}
          maxLength={1000}
          placeholder="Add Description"
          className="field resize-none"
        />
      </div>

      {formError && <p className="rounded-md bg-danger-tint px-3 py-2 text-sm text-danger">{formError}</p>}

      <button type="submit" disabled={saving} aria-busy={saving} className="btn-primary disabled:cursor-not-allowed">
        {saving && <Spinner />}
        {saving ? (task ? 'Saving…' : 'Creating…') : task ? 'Save changes' : 'Create task'}
      </button>
    </form>
  );
}

function FieldError({ message, hint }) {
  if (message) return <p className="mt-1.5 text-xs text-danger">{message}</p>;
  if (hint) return <p className="mt-1.5 text-xs text-muted">{hint}</p>;
  return null;
}
