import { Check } from 'lucide-react';
import Spinner from './Spinner';

export default function Checkbox({ checked, onChange, label, loading = false, disabled = false }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      aria-busy={loading}
      disabled={disabled || loading}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`grid size-5 shrink-0 place-items-center rounded-[3px] border-[1.5px] transition disabled:cursor-not-allowed ${
        checked ? 'border-primary bg-primary-tint text-primary' : 'border-primary/70 bg-white text-primary hover:bg-primary-tint'
      }`}
    >
      {loading ? <Spinner size={12} /> : checked && <Check size={13} strokeWidth={3} />}
    </button>
  );
}
