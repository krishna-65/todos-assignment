import { Check } from 'lucide-react';

export default function Checkbox({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`grid size-5 shrink-0 place-items-center rounded-[3px] border-[1.5px] transition ${
        checked ? 'border-primary bg-primary-tint text-primary' : 'border-primary/70 bg-white hover:bg-primary-tint'
      }`}
    >
      {checked && <Check size={13} strokeWidth={3} />}
    </button>
  );
}
