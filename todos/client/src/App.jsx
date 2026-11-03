import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { TaskProvider } from './context/TaskContext';
import Onboarding, { ONBOARDED_KEY } from './pages/Onboarding';
import Home from './pages/Home';
import Search from './pages/Search';

function hasOnboarded() {
  try {
    return localStorage.getItem(ONBOARDED_KEY) === '1';
  } catch {
    return false;
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <TaskProvider>
        {/* Phone-width column on mobile, wider card layout on desktop */}
        <div className="mx-auto min-h-dvh max-w-md bg-white lg:my-6 lg:min-h-[calc(100dvh-3rem)] lg:max-w-5xl lg:overflow-hidden lg:rounded-3xl lg:shadow-xl lg:shadow-slate-300/50">
          <Routes>
            <Route path="/" element={hasOnboarded() ? <Navigate to="/home" replace /> : <Onboarding />} />
            <Route path="/home" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </TaskProvider>
    </BrowserRouter>
  );
}
