export const PRIORITY_STYLES = {
  low: { label: 'Low', badge: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500' },
  medium: { label: 'Medium', badge: 'bg-amber-50 text-amber-600', dot: 'bg-amber-500' },
  high: { label: 'High', badge: 'bg-red-50 text-red-600', dot: 'bg-red-500' },
};

export default function PriorityBadge({ priority }) {
  const style = PRIORITY_STYLES[priority];
  if (!style) return null;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${style.badge}`}>
      <span className={`size-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}
