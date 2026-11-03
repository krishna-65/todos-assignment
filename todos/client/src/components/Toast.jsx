export default function Toast({ toast, onDismiss }) {
  if (!toast) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[60] flex justify-center px-4" role="status" aria-live="polite">
      <div
        key={toast.id}
        className="pointer-events-auto flex animate-pop items-center gap-4 rounded-xl bg-ink px-4 py-3 text-sm text-white shadow-lg"
      >
        <span>{toast.message}</span>
        {toast.action && (
          <button
            type="button"
            className="font-semibold text-primary-soft hover:text-white"
            onClick={() => {
              // Dismiss first so the action can show its own progress toast
              onDismiss();
              toast.action.onClick();
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>
    </div>
  );
}
