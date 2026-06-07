import type { UserRole } from '../types';

export interface PermissionCheck {
  canView: boolean;
  canEdit: boolean;
  canApprove: boolean;
  canExport: boolean;
  canManageUsers: boolean;
}

export function getPermissions(role: UserRole): PermissionCheck {
  switch (role) {
    case 'hq':
      return { canView: true, canEdit: true, canApprove: true, canExport: true, canManageUsers: true };
    case 'region':
      return { canView: true, canEdit: true, canApprove: true, canExport: true, canManageUsers: false };
    case 'enterprise':
      return { canView: true, canEdit: true, canApprove: false, canExport: true, canManageUsers: false };
    default:
      return { canView: false, canEdit: false, canApprove: false, canExport: false, canManageUsers: false };
  }
}

export function canAccessRoute(role: UserRole, route: string): boolean {
  const perms = getPermissions(role);
  if (route === '/permissions') return perms.canManageUsers;
  if (route === '/campus') return role === 'hq' || role === 'region';
  return perms.canView;
}

export function filterDataByScope<T extends { region?: string; province?: string; enterpriseId?: string; enterpriseName?: string }>(
  data: T[],
  role: UserRole,
  scope: { regions?: string[]; enterprises?: string[] }
): T[] {
  if (role === 'hq') return data;
  if (role === 'region') {
    if (!scope.regions?.length) return [];
    return data.filter(d => {
      if (d.region) return scope.regions!.includes(d.region);
      return true;
    });
  }
  if (role === 'enterprise') {
    if (!scope.enterprises?.length) return [];
    return data.filter(d => {
      if (d.enterpriseName) return scope.enterprises!.includes(d.enterpriseName);
      if (d.enterpriseId) return scope.enterprises!.includes(d.enterpriseId);
      return true;
    });
  }
  return [];
}

export function getRoleName(role: UserRole): string {
  switch (role) {
    case 'hq': return '总部招聘负责人';
    case 'region': return '区域招聘总监';
    case 'enterprise': return '企业招聘运营';
    default: return '未知角色';
  }
}

export function getScopeDescription(role: UserRole, scope: { regions?: string[]; enterprises?: string[] }): string {
  switch (role) {
    case 'hq': return '全国';
    case 'region': return scope.regions?.join('、') || '未分配区域';
    case 'enterprise': return scope.enterprises?.join('、') || '未分配企业';
    default: return '无权限';
  }
}
