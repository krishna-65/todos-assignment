import { ClipboardList } from 'lucide-react';

export default function EmptyState({ title, message, action, icon: Icon = ClipboardList }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-line px-6 py-8 text-center">
      <span className="mb-3 grid size-12 place-items-center rounded-full bg-primary-tint text-primary">
        <Icon size={22} />
      </span>
      <p className="text-sm font-medium">{title}</p>
      {message && <p className="mt-1 text-xs text-muted">{message}</p>}
      {action}
    </div>
  );
}
