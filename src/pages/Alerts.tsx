import { useMemo, useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Clock, CheckCircle2, XCircle,
  Filter, Search, ArrowUpRight, ChevronRight, UserCheck } from 'lucide-react';
import { useAlertStore } from '../store/useAlertStore';
import { useAuthStore } from '../store/useAuthStore';
import { canApprove } from '../utils/alertEngine';
import type { Alert, AlertStatus } from '../types';

const STATUS_LABEL: Record<AlertStatus, string> = {
  pending: '待处理', processing: '处理中', approved: '已批准', resolved: '已解决'
};

export default function Alerts() {
  const { alerts, getFilteredAlerts, setStatusFilter, setLevelFilter, statusFilter, levelFilter,
    setSelectedAlert, selectedAlertId, approveStep, fetchAlerts, fetchAlertCount, getAlertCount } = useAlertStore();
  const { user } = useAuthStore();
  const [keyword, setKeyword] = useState('');
  const [approveComment, setApproveComment] = useState('');

  useEffect(() => {
    void fetchAlerts();
    void fetchAlertCount();
  }, [fetchAlerts, fetchAlertCount]);

  useEffect(() => {
    void fetchAlerts();
  }, [statusFilter, levelFilter, fetchAlerts]);

  const apiCounts = useMemo(() => getAlertCount(), [getAlertCount, alerts]);
  const counts = useMemo(() => ({
    level1: apiCounts.level1,
    level2: apiCounts.level2,
    pending: apiCounts.pending
  }), [apiCounts]);

  const filtered = useMemo(() => {
    const list = getFilteredAlerts();
    if (!keyword.trim()) return list;
    return list.filter(a => a.description.includes(keyword) || a.industry.includes(keyword) || a.region.includes(keyword));
  }, [getFilteredAlerts, keyword, alerts, statusFilter, levelFilter]);

  const selected = alerts.find(a => a.id === selectedAlertId) || filtered[0];

  const handleApprove = () => {
    if (!selected || !user) return;
    approveStep(selected.id, user.role, approveComment, user.name);
    setApproveComment('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slatePlus-900 tracking-tight">预警中心</h1>
          <p className="text-sm text-slatePlus-500 mt-1">实时监控招聘异常 · 三级审批流程 · 自动预警升级</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slatePlus-400" />
            <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="搜索行业/区域..."
              className="input-field pl-9 w-64 !py-2 text-sm" />
          </div>
          <button className="btn-secondary !py-2 text-sm"><Filter size={15} />更多筛选</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {[
          { label: '待处理预警', value: counts.pending, color: 'from-amber-500 to-orange-500', icon: <Clock size={22} />, hint: '需要关注的预警总数' },
          { label: '一级预警', value: counts.level1, color: 'from-amber-500 to-amber-600', icon: <AlertCircle size={22} />, hint: '连续3天异常触发' },
          { label: '二级预警', value: counts.level2, color: 'from-red-500 to-rose-600', icon: <AlertTriangle size={22} />, hint: '5天未改善，需三级审批' }
        ].map(s => (
          <div key={s.label} className={`kpi-card bg-gradient-to-br ${s.color}`}>
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-white/85">{s.label}</p>
                <p className="mt-2 font-display text-3xl font-bold text-white">{s.value}</p>
                <p className="mt-2 text-xs text-white/70">{s.hint}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/15 backdrop-blur text-white">{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-5 data-card !p-0 overflow-hidden">
          <div className="p-5 border-b border-slatePlus-100 flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slatePlus-100 rounded-lg p-1">
              {(['all', 1, 2] as const).map(l => (
                <button key={String(l)} onClick={() => setLevelFilter(l)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    levelFilter === l ? 'bg-white text-navy-800 shadow-sm' : 'text-slatePlus-500 hover:text-slatePlus-700'
                  }`}>
                  {l === 'all' ? '全部级别' : `L${l} 预警`}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 bg-slatePlus-100 rounded-lg p-1 ml-auto">
              {(['all', 'pending', 'processing', 'approved', 'resolved'] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    statusFilter === s ? 'bg-white text-navy-800 shadow-sm' : 'text-slatePlus-500 hover:text-slatePlus-700'
                  }`}>
                  {s === 'all' ? '全部' : STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-slatePlus-100 max-h-[640px] overflow-auto scrollbar-thin">
            {filtered.map(alert => (
              <button key={alert.id} onClick={() => setSelectedAlert(alert.id)}
                className={`w-full text-left p-5 transition-all hover:bg-slatePlus-50/80 ${
                  selected?.id === alert.id ? 'bg-brand-50/60 border-l-4 border-l-brand-500' : 'border-l-4 border-l-transparent'
                }`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${alert.level === 2 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'} shrink-0`}>
                    <AlertTriangle size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`tag ${alert.level === 2 ? 'tag-level2' : 'tag-level1'}`}>L{alert.level} {alert.type === 'delivery_drop' ? '投递异常' : '转化异常'}</span>
                      <span className={`tag tag-${alert.status}`}>{STATUS_LABEL[alert.status]}</span>
                      <span className="text-xs text-slatePlus-400 ml-auto">{alert.improvementDays}天前触发</span>
                    </div>
                    <p className="text-sm font-semibold text-slatePlus-800 line-clamp-2 mb-1">{alert.description}</p>
                    <div className="flex items-center gap-3 text-xs text-slatePlus-500">
                      <span>{alert.industry}</span><span>·</span><span>{alert.region}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slatePlus-300 shrink-0 mt-1" />
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="p-12 text-center text-slatePlus-400">
                <AlertCircle size={36} className="mx-auto mb-3 opacity-40" />
                <p>暂无符合条件的预警</p>
              </div>
            )}
          </div>
        </div>

        <div className="col-span-7 data-card">
          {selected ? <AlertDetail alert={selected} userRole={user?.role ?? 'enterprise'} userName={user?.name}
            approveComment={approveComment} setApproveComment={setApproveComment} onApprove={handleApprove} /> : (
            <div className="h-[600px] flex flex-col items-center justify-center text-slatePlus-400">
              <AlertTriangle size={48} className="opacity-30 mb-3" />
              <p>选择左侧预警查看详情</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AlertDetail({ alert, userRole, userName, approveComment, setApproveComment, onApprove }: {
  alert: Alert; userRole: 'hq' | 'region' | 'enterprise'; userName?: string;
  approveComment: string; setApproveComment: (s: string) => void; onApprove: () => void;
}) {
  const canDo = canApprove(alert, userRole);
  const curStep = alert.approvalSteps[alert.currentStepIndex];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className={`tag ${alert.level === 2 ? 'tag-level2' : 'tag-level1'}`}>L{alert.level} 预警</span>
            <span className={`tag tag-${alert.status}`}>{STATUS_LABEL[alert.status]}</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-slatePlus-900 leading-snug">{alert.description}</h2>
          <div className="flex items-center gap-4 mt-3 text-sm text-slatePlus-500">
            <span className="flex items-center gap-1.5"><AlertCircle size={14} />{alert.industry}</span>
            <span className="flex items-center gap-1.5"><ArrowUpRight size={14} />{alert.region}</span>
            <span className="flex items-center gap-1.5"><Clock size={14} />触发于 {alert.triggeredAt.slice(0, 16).replace('T', ' ')}</span>
          </div>
        </div>
        <div className={`p-4 rounded-2xl ${alert.level === 2 ? 'bg-red-50 border border-red-100' : 'bg-amber-50 border border-amber-100'}`}>
          <p className="text-xs text-slatePlus-500 mb-1">{alert.type === 'delivery_drop' ? '投递量下降' : '转化率偏差'}</p>
          <p className={`font-display text-2xl font-bold ${alert.level === 2 ? 'text-red-600' : 'text-amber-600'}`}>
            {alert.type === 'delivery_drop' ? `-${alert.deliveryDropRate}%` : `${alert.conversionGap}%`}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slatePlus-800 mb-4 flex items-center gap-2">
          <UserCheck size={16} className="text-brand-600" />三级审批流程
        </h3>
        <div className="relative pl-3">
          <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-slatePlus-200" />
          {alert.approvalSteps.map((step, idx) => {
            const isCurrent = idx === alert.currentStepIndex && !step.approved;
            const isPast = step.approved;
            const isFuture = idx > alert.currentStepIndex && !step.approved;
            return (
              <div key={idx} className="relative flex items-start gap-4 pb-6 last:pb-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 z-10 shrink-0 ${
                  isPast ? 'bg-emerald-500 border-emerald-500 text-white' :
                  isCurrent ? 'bg-white border-brand-500 text-brand-600 ring-4 ring-brand-100 animate-pulse-soft' :
                  'bg-white border-slatePlus-200 text-slatePlus-300'
                }`}>
                  {isPast ? <CheckCircle2 size={16} /> : isFuture ? <XCircle size={16} /> : <Clock size={16} />}
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${isPast || isCurrent ? 'text-slatePlus-800' : 'text-slatePlus-400'}`}>{step.roleName}</p>
                    {isCurrent && <span className="tag tag-processing">当前步骤</span>}
                    {isPast && <span className="tag tag-approved">已通过</span>}
                  </div>
                  {step.approverName && (
                    <p className="text-xs text-slatePlus-500 mt-1">
                      审批人：{step.approverName} · {step.approvedAt?.slice(0, 16).replace('T', ' ')}
                    </p>
                  )}
                  {step.comment && (
                    <p className="mt-2 p-3 rounded-lg bg-slatePlus-50 border border-slatePlus-100 text-sm text-slatePlus-600">
                      {step.comment}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {canDo && (
        <div className="p-5 rounded-2xl bg-brand-50/60 border border-brand-100">
          <p className="text-sm font-semibold text-navy-800 mb-3">请填写审批意见（{userName} · {curStep?.roleName}）</p>
          <textarea value={approveComment} onChange={e => setApproveComment(e.target.value)}
            className="input-field min-h-[90px] resize-none" placeholder="请输入审批意见..." />
          <div className="flex items-center justify-end gap-3 mt-4">
            <button className="btn-secondary !py-2 text-sm">驳回</button>
            <button onClick={onApprove} className="btn-primary !py-2 text-sm">
              <CheckCircle2 size={15} />确认通过
            </button>
          </div>
        </div>
      )}

      {!canDo && alert.status !== 'resolved' && alert.status !== 'approved' && (
        <div className="p-4 rounded-xl bg-slatePlus-50 border border-slatePlus-200 text-sm text-slatePlus-500 text-center">
          当前步骤需由 <b className="text-slatePlus-700">{curStep?.roleName}</b> 完成审批，您的权限暂不支持此操作
        </div>
      )}

      {alert.status === 'approved' && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-700 text-center flex items-center justify-center gap-2">
          <CheckCircle2 size={18} />
          三级审批已全部通过，可执行职位描述调整或筛选策略优化
        </div>
      )}
    </div>
  );
}
