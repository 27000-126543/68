import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Building2, Globe2, UserCircle2, ArrowRight, ShieldCheck, TrendingUp, Zap } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { getRoleName, getScopeDescription } from '../utils/permissions';

export default function Login() {
  const { user, isAuthenticated, login, availableUsers } = useAuthStore();
  const [selectedId, setSelectedId] = useState<string>(availableUsers[0]?.id ?? '');
  const navigate = useNavigate();

  if (isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = () => {
    if (selectedId) {
      login(selectedId);
      navigate('/dashboard', { replace: true });
    }
  };

  const getIcon = (role: string) => {
    if (role === 'hq') return <Globe2 size={24} />;
    if (role === 'region') return <Building2 size={24} />;
    return <UserCircle2 size={24} />;
  };

  const getGradient = (role: string) => {
    if (role === 'hq') return 'from-navy-800 to-brand-600';
    if (role === 'region') return 'from-emerald-600 to-teal-500';
    return 'from-amber-500 to-orange-500';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-hero-gradient bg-grid-slate bg-[size:32px_32px] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-brand-500/10 blur-3xl -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-navy-800/10 blur-3xl translate-x-1/4 translate-y-1/4 pointer-events-none" />

      <div className="relative w-full max-w-6xl grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slatePlus-200 text-xs font-medium text-navy-800 shadow-card mb-8 w-fit">
            <ShieldCheck size={14} className="text-brand-600" />
            企业级招聘智能决策系统
          </div>
          <h1 className="font-display text-5xl font-bold text-slatePlus-900 leading-tight tracking-tight mb-6">
            数据驱动的<br />
            <span className="bg-gradient-to-r from-navy-800 via-brand-600 to-brand-500 bg-clip-text text-transparent">招聘智能分析平台</span>
          </h1>
          <p className="text-lg text-slatePlus-500 leading-relaxed max-w-lg mb-10">
            实时接入职位、投递、面试、Offer与入职全链路数据，自动识别招聘异常，智能预测人才缺口，助力您做出更科学的招聘决策。
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-lg">
            {[
              { icon: <TrendingUp size={18} />, title: '实时指标计算', desc: '投递匹配率 / 转化率' },
              { icon: <Zap size={18} />, title: '智能预警引擎', desc: '三级审批工作流' },
              { icon: <ShieldCheck size={18} />, title: '分级权限管理', desc: '总部 / 区域 / 企业' }
            ].map(f => (
              <div key={f.title} className="p-4 rounded-xl bg-white border border-slatePlus-200/60 shadow-card">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-navy-800 to-brand-500 text-white flex items-center justify-center mb-3">
                  {f.icon}
                </div>
                <p className="text-sm font-semibold text-slatePlus-800">{f.title}</p>
                <p className="text-xs text-slatePlus-500 mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-card-hover border border-slatePlus-200/60 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-navy-800/10 to-brand-500/10 blur-2xl rounded-full pointer-events-none" />

            <h2 className="font-display text-2xl font-semibold text-slatePlus-900 mb-2">欢迎回来</h2>
            <p className="text-sm text-slatePlus-500 mb-8">请选择您的身份登录系统</p>

            <div className="space-y-3 mb-8">
              {availableUsers.map(u => {
                const active = u.id === selectedId;
                return (
                  <button
                    key={u.id}
                    onClick={() => setSelectedId(u.id)}
                    className={`w-full p-4 rounded-2xl border-2 transition-all text-left group ${
                      active
                        ? 'border-brand-500 bg-brand-50/50 shadow-glow'
                        : 'border-slatePlus-200 bg-white hover:border-brand-300 hover:bg-slatePlus-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getGradient(u.role)} text-white flex items-center justify-center shrink-0`}>
                        {getIcon(u.role)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-slatePlus-800">{u.name}</p>
                        <p className="text-xs text-slatePlus-500 mt-0.5">
                          {getRoleName(u.role)} · {getScopeDescription(u.role, u.scope)}
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                        active ? 'border-brand-500 bg-brand-500' : 'border-slatePlus-300 group-hover:border-brand-400'
                      } flex items-center justify-center`}>
                        {active && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleLogin}
              className="w-full btn-primary py-3 text-base justify-center rounded-xl bg-gradient-to-r from-navy-800 to-brand-600 hover:from-navy-900 hover:to-brand-700 shadow-glow"
            >
              进入系统
              <ArrowRight size={18} />
            </button>

            <p className="text-xs text-center text-slatePlus-400 mt-6">
              演示系统 · 选择身份即可体验不同层级的数据与功能权限
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
