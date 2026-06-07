import { create } from 'zustand';
import type { Alert, AlertStatus, UserRole } from '../types';
import { generateAlerts } from '../data/mockData';
import { canApprove } from '../utils/alertEngine';

interface AlertState {
  alerts: Alert[];
  selectedAlertId: string | null;
  statusFilter: AlertStatus | 'all';
  levelFilter: 1 | 2 | 'all';
  setSelectedAlert: (id: string | null) => void;
  setStatusFilter: (s: AlertStatus | 'all') => void;
  setLevelFilter: (l: 1 | 2 | 'all') => void;
  approveStep: (alertId: string, role: UserRole, comment?: string, approverName?: string) => boolean;
  escalateAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  addAlert: (alert: Alert) => void;
  getFilteredAlerts: () => Alert[];
  getAlertCount: () => { level1: number; level2: number; pending: number };
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: generateAlerts(),
  selectedAlertId: null,
  statusFilter: 'all',
  levelFilter: 'all',

  setSelectedAlert: (id) => set({ selectedAlertId: id }),
  setStatusFilter: (s) => set({ statusFilter: s }),
  setLevelFilter: (l) => set({ levelFilter: l }),

  approveStep: (alertId, role, comment, approverName) => {
    const alert = get().alerts.find(a => a.id === alertId);
    if (!alert) return false;
    if (!canApprove(alert, role)) return false;

    const stepIdx = alert.currentStepIndex;
    const step = alert.approvalSteps[stepIdx];
    if (!step || step.approved) return false;

    const newSteps = [...alert.approvalSteps];
    newSteps[stepIdx] = {
      ...step,
      approved: true,
      approverName: approverName || '当前用户',
      approvedAt: new Date().toISOString(),
      comment
    };

    const allApproved = newSteps.every(s => s.approved);
    const newStatus: AlertStatus = allApproved ? 'approved' : 'processing';

    set(state => ({
      alerts: state.alerts.map(a =>
        a.id === alertId
          ? {
              ...a,
              approvalSteps: newSteps,
              currentStepIndex: allApproved ? stepIdx + 1 : stepIdx + 1,
              status: newStatus,
              resolvedAt: allApproved ? new Date().toISOString() : undefined
            }
          : a
      )
    }));
    return true;
  },

  escalateAlert: (alertId) => {
    set(state => ({
      alerts: state.alerts.map(a =>
        a.id === alertId && a.level === 1
          ? { ...a, level: 2, status: 'processing' }
          : a
      )
    }));
  },

  resolveAlert: (alertId) => {
    set(state => ({
      alerts: state.alerts.map(a =>
        a.id === alertId
          ? { ...a, status: 'resolved', resolvedAt: new Date().toISOString() }
          : a
      )
    }));
  },

  addAlert: (alert) => set(state => ({ alerts: [alert, ...state.alerts] })),

  getFilteredAlerts: () => {
    const { alerts, statusFilter, levelFilter } = get();
    return alerts.filter(a => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (levelFilter !== 'all' && a.level !== levelFilter) return false;
      return true;
    });
  },

  getAlertCount: () => {
    const { alerts } = get();
    return {
      level1: alerts.filter(a => a.level === 1 && a.status !== 'resolved').length,
      level2: alerts.filter(a => a.level === 2 && a.status !== 'resolved').length,
      pending: alerts.filter(a => a.status === 'pending' || a.status === 'processing').length
    };
  }
}));
