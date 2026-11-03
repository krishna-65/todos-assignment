import { Check, X } from 'lucide-react';

export default function StatCards({ completed, pending, label = 'This Week' }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard
        tone="bg-primary-tint"
        iconTone="border-primary-dark/70 bg-primary-soft text-primary-dark"
        icon={<Check size={14} strokeWidth={2.5} />}
        title="Task Complete"
        value={completed}
        label={label}
      />
      <StatCard
        tone="bg-danger-tint"
        iconTone="border-danger/70 bg-red-200/70 text-danger"
        icon={<X size={14} strokeWidth={2.5} />}
        title="Task Pending"
        value={pending}
        label={label}
      />
    </div>
  );
}

function StatCard({ tone, iconTone, icon, title, value, label }) {
  return (
    <div className={`rounded-sm p-4 ${tone}`}>
      <div className="flex items-center gap-3">
        <span className={`grid size-6 place-items-center rounded-[3px] border-[1.5px] ${iconTone}`}>{icon}</span>
        <span className="text-xs font-medium">{title}</span>
      </div>
      <p className="mt-3 flex items-baseline gap-2 pl-1">
        <span className="text-2xl font-semibold tabular-nums">{String(value).padStart(2, '0')}</span>
        <span className="text-[10px] text-muted">{label}</span>
      </p>
    </div>
  );
}
