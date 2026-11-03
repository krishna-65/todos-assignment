import { LoaderCircle } from 'lucide-react';

export default function Spinner({ size = 16, className = '' }) {
  return <LoaderCircle size={size} className={`animate-spin ${className}`} aria-hidden="true" />;
}
