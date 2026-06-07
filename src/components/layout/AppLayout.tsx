import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuthStore } from '../../store/useAuthStore';
import { CountUpProvider } from '../../hooks/useCountUp';
import { useEffect } from 'react';
import { registerChinaMap } from '../../data/chinaMap';

export function AppLayout() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    registerChinaMap();
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <CountUpProvider>
      <div className="flex h-screen bg-slatePlus-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-auto scrollbar-thin p-8 bg-hero-gradient bg-grid-slate bg-[size:32px_32px]">
            <div className="max-w-[1680px] mx-auto animate-fade-in-up">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </CountUpProvider>
  );
}
