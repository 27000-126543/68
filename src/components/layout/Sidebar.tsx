import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, AlertTriangle, GraduationCap, FileBarChart, Users, Shield
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { getPermissions } from '../../utils/permissions';

const MENU = [
  { path: '/dashboard', label: '核心看板', icon: LayoutDashboard, roles: ['hq', 'region', 'enterprise'] as const },
  { path: '/alerts', label: '预警中心', icon: AlertTriangle, roles: ['hq', 'region', 'enterprise'] as const },
  { path: '/campus', label: '校招规划', icon: GraduationCap, roles: ['hq', 'region'] as const },
  { path: '/reports', label: '报表中心', icon: FileBarChart, roles: ['hq', 'region', 'enterprise'] as const },
  { path: '/permissions', label: '权限管理', icon: Shield, roles: ['hq'] as const },
  { path: '/users', label: '用户列表', icon: Users, roles: ['hq'] as const }
];

export function Sidebar() {
  const location = useLocation();
  const user = useAuthStore(s => s.user);
  const perms = getPermissions(user?.role ?? 'enterprise');

  const visible = MENU.filter(m => {
    const role = user?.role ?? 'enterprise';
    return (m.roles as readonly string[]).includes(role);
  });
  void perms;

  return (
    <aside className="w-64 shrink-0 bg-white/50 backdrop-blur-sm border-r border-slatePlus-200/60 flex flex-col py-6 px-4">
      <div className="px-4 mb-2">
        <p className="text-xs font-semibold text-slatePlus-400 uppercase tracking-wider">主导航</p>
      </div>
      <nav className="flex-1 space-y-1">
        {visible.map(item => {
          const Icon = item.icon;
          const active = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`sidebar-item ${active ? 'sidebar-item-active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-6 px-4 py-4 rounded-xl bg-gradient-to-br from-navy-800 to-brand-600 text-white">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <FileBarChart size={16} />
          </div>
          <p className="text-sm font-semibold">健康度诊断</p>
        </div>
        <p className="text-xs text-white/70 leading-relaxed">每周一 08:00 自动生成招聘健康报告，包含渠道优化建议。</p>
      </div>
    </aside>
  );
}
