import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Zigzag from '../components/Zigzag';

export const ONBOARDED_KEY = 'todos:onboarded';

export default function Onboarding() {
  const navigate = useNavigate();

  const start = () => {
    try {
      localStorage.setItem(ONBOARDED_KEY, '1');
    } catch {
      /* storage unavailable — onboarding will simply show again */
    }
    navigate('/home', { replace: true });
  };

  return (
    <main className="flex min-h-dvh flex-col lg:min-h-[calc(100dvh-3rem)] lg:flex-row">
      <section className="relative flex flex-[1.4] items-center justify-center overflow-hidden bg-primary lg:flex-1">
        <div className="absolute -right-12 -top-12 size-32 rounded-full border-[18px] border-white/20" />
        <Zigzag className="absolute left-0 top-[18%] w-28 text-white/25" />
        <Zigzag className="absolute bottom-[14%] right-0 w-28 text-white/25" />

        {/* Floating preview card */}
        <div className="relative w-56 rotate-[-4deg] rounded-2xl bg-white/95 p-4 shadow-2xl shadow-primary-dark/40">
          <p className="text-[10px] font-medium text-muted">Tasks Today</p>
          {['Finishing Wireframe', 'Meeting with team', 'Buy a cat food'].map((title, i) => (
            <div key={title} className="mt-2.5 flex items-center gap-2.5">
              <span
                className={`grid size-4 place-items-center rounded-[3px] border-[1.5px] border-primary ${
                  i === 2 ? 'bg-primary-tint text-primary' : ''
                }`}
              >
                {i === 2 && <CheckCircle2 size={10} />}
              </span>
              <span className={`text-xs ${i === 2 ? 'text-muted line-through' : 'font-medium'}`}>{title}</span>
            </div>
          ))}
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-primary-soft">
            <div className="h-full w-2/3 bg-primary-dark" />
          </div>
        </div>
      </section>

      <section className="flex flex-1 flex-col justify-between bg-white px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-10 lg:justify-center lg:gap-16 lg:px-16">
        <div>
          <h1 className="text-[1.6rem] font-semibold leading-tight lg:text-4xl">Manage What To Do</h1>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            The best way to manage what you have to do, don't forget your plans
          </p>
        </div>
        <button type="button" onClick={start} className="btn-primary mt-10 lg:max-w-xs">
          Get Started
        </button>
      </section>
    </main>
  );
}
