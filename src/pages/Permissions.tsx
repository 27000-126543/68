import { useMemo, useState, useEffect } from 'react';
import {
  Shield, Plus, Search, Edit3, Ban, UserCheck, Building2,
  Users, Factory
} from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import type { PermissionUser, UserRole } from '../types';

type RoleFilter = 'all' | UserRole;

const ROLE_LABEL: Record<UserRole, string> = {
  hq: '总部',
  region: '区域',
  enterprise: '企业'
};

const ROLE_TAG: Record<UserRole, string> = {
  hq: 'bg-navy-50 text-navy-700 border-navy-100',
  region: 'bg-brand-50 text-brand-700 border-brand-100',
  enterprise: 'bg-emerald-50 text-emerald-700 border-emerald-100'
};

const ROLE_ICON: Record<UserRole, React.ReactNode> = {
  hq: <Building2 size={14} />,
  region: <Users size={14} />,
  enterprise: <Factory size={14} />
};

export default function Permissions() {
  const { permissionUsers, refreshPermissionUsers } = useDataStore();
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  useEffect(() => {
    void refreshPermissionUsers();
  }, [refreshPermissionUsers]);

  const filtered = useMemo(() => {
    let list = permissionUsers;
    if (roleFilter !== 'all') {
      list = list.filter(u => u.role === roleFilter);
    }
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      list = list.filter(u =>
        u.name.toLowerCase().includes(kw) || u.email.toLowerCase().includes(kw)
      );
    }
    return list;
  }, [permissionUsers, keyword, roleFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slatePlus-900 tracking-tight">权限管理</h1>
          <p className="text-sm text-slatePlus-500 mt-1">
            仅总部可见 · 用户角色分配 · 访问权限管控
          </p>
        </div>
        <button className="btn-primary">
          <Plus size={16} />新增用户
        </button>
      </div>

      <div className="data-card">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slatePlus-400" />
            <input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="按姓名或邮箱搜索..."
              className="input-field pl-9"
            />
          </div>
          <div className="flex items-center gap-1 bg-slatePlus-100 rounded-lg p-1">
            {(['all', 'hq', 'region', 'enterprise'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  roleFilter === r
                    ? 'bg-white text-navy-800 shadow-sm'
                    : 'text-slatePlus-500 hover:text-slatePlus-700'
                }`}
              >
                {r === 'all' ? '全部' : ROLE_LABEL[r]}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slatePlus-100">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slatePlus-500 uppercase tracking-wider">
                  姓名
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slatePlus-500 uppercase tracking-wider">
                  邮箱
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slatePlus-500 uppercase tracking-wider">
                  角色
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slatePlus-500 uppercase tracking-wider">
                  管辖范围
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slatePlus-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slatePlus-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slatePlus-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slatePlus-50">
              {filtered.map(user => (
                <UserRow key={user.id} user={user} />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slatePlus-400">
                    <Shield size={40} className="mx-auto mb-3 opacity-30" />
                    <p>暂无符合条件的用户</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UserRow({ user }: { user: PermissionUser }) {
  const isActive = user.status === 'active';

  return (
    <tr className="hover:bg-slatePlus-50/50 transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy-800 to-brand-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {user.name.slice(0, 1)}
          </div>
          <div>
            <p className="text-sm font-semibold text-slatePlus-800">{user.name}</p>
            <p className="text-xs text-slatePlus-500">{user.roleName}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <span className="text-sm text-slatePlus-600">{user.email}</span>
      </td>
      <td className="py-4 px-4">
        <span className={`tag inline-flex items-center gap-1 ${ROLE_TAG[user.role]}`}>
          {ROLE_ICON[user.role]}
          {ROLE_LABEL[user.role]}
        </span>
      </td>
      <td className="py-4 px-4">
        <span className="text-sm text-slatePlus-600">{user.scope}</span>
      </td>
      <td className="py-4 px-4">
        <span className={`tag inline-flex items-center gap-1 ${
          isActive
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-slatePlus-100 text-slatePlus-500 border-slatePlus-200'
        }`}>
          <UserCheck size={12} />
          {isActive ? '正常' : '已禁用'}
        </span>
      </td>
      <td className="py-4 px-4">
        <span className="text-sm text-slatePlus-500">{user.createdAt}</span>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center justify-end gap-1">
          <button
            className="p-2 rounded-lg hover:bg-slatePlus-100 text-slatePlus-400 hover:text-brand-600 transition-colors"
            title="编辑"
          >
            <Edit3 size={15} />
          </button>
          <button
            className={`p-2 rounded-lg transition-colors ${
              isActive
                ? 'hover:bg-red-50 text-slatePlus-400 hover:text-red-500'
                : 'hover:bg-emerald-50 text-slatePlus-400 hover:text-emerald-600'
            }`}
            title={isActive ? '禁用' : '启用'}
          >
            <Ban size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}
