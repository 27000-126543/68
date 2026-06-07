import { useAuthStore } from '../../store/useAuthStore';
import { getRoleName, getScopeDescription } from '../../utils/permissions';
import { AlertTriangle, Bell, LogOut, User, ChevronDown } from 'lucide-react';
import { useAlertStore } from '../../store/useAlertStore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const { user, logout } = useAuthStore();
  const counts = useAlertStore(s => s.getAlertCount());
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slatePlus-200/60 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-navy-800 to-brand-500 flex items-center justify-center shadow-glow">
            <span className="text-white font-bold font-display text-lg">招</span>
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold text-slatePlus-900 tracking-tight leading-none">招聘智能分析平台</h1>
            <p className="text-xs text-slatePlus-400 mt-0.5">Recruitment Intelligence System</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/alerts')}
          className="relative p-2.5 rounded-xl text-slatePlus-500 hover:bg-slatePlus-100 hover:text-navy-800 transition-all"
        >
          <Bell size={20} />
          {counts.pending > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse-soft">
              {counts.pending > 9 ? '9+' : counts.pending}
            </span>
          )}
        </button>

        <div className="h-8 w-px bg-slatePlus-200 mx-2" />

        <div className="relative">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="flex items-center gap-3 pl-1 pr-3 py-1.5 rounded-xl hover:bg-slatePlus-100 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-navy-700 to-brand-600 flex items-center justify-center text-white font-semibold">
              <User size={17} />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slatePlus-800 leading-tight">{user.name}</p>
              <p className="text-xs text-slatePlus-500">{getRoleName(user.role)} · {getScopeDescription(user.role, user.scope)}</p>
            </div>
            <ChevronDown size={14} className="text-slatePlus-400" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl shadow-card-hover border border-slatePlus-200/60 py-2 animate-fade-in-up z-40">
                <div className="px-4 py-3 border-b border-slatePlus-100">
                  <p className="text-sm font-semibold text-slatePlus-800">{user.name}</p>
                  <p className="text-xs text-slatePlus-500 mt-0.5">{user.email}</p>
                </div>
                <button
                  onClick={() => navigate('/alerts')}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slatePlus-700 hover:bg-slatePlus-50 transition-all"
                >
                  <AlertTriangle size={16} className="text-amber-600" />
                  <span>预警中心</span>
                  {counts.pending > 0 && <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">{counts.pending}待处理</span>}
                </button>
                <div className="my-1 border-t border-slatePlus-100" />
                <button
                  onClick={() => { logout(); navigate('/login'); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all"
                >
                  <LogOut size={16} />
                  <span>退出登录</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
