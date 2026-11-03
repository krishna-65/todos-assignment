export default function ProgressBar({ value, total, size = 'lg' }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={`${pct}% complete`}
      className={`w-full overflow-hidden bg-primary-soft ${size === 'lg' ? 'h-5 rounded-[2px]' : 'h-1.5 rounded-full'}`}
    >
      <div className="h-full bg-primary-dark transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
    </div>
  );
}
