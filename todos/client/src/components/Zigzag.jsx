// Decorative chevron pattern from the onboarding illustration
export default function Zigzag({ className = '', rows = 4 }) {
  const width = 110;
  const step = 11;
  return (
    <svg viewBox={`0 0 ${width} ${rows * 14 + 10}`} className={className} fill="none" aria-hidden="true">
      {Array.from({ length: rows }, (_, r) => {
        const y = 6 + r * 14;
        const points = Array.from({ length: width / step + 1 }, (_, i) => `${i * step},${i % 2 ? y : y + 9}`).join(' ');
        return <polyline key={r} points={points} stroke="currentColor" strokeWidth="2.5" strokeLinejoin="miter" />;
      })}
    </svg>
  );
}
