import { useMemo, useState } from 'react';
import {
  FileBarChart2, Plus, Download, ChevronRight, TrendingUp, TrendingDown,
  Users, UserCheck, Target, Briefcase, Clock, Lightbulb, Megaphone,
  UserSearch, Compass
} from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import type { WeeklyReport } from '../types';
import { formatNumber, formatPercent, formatTrend } from '../hooks/useCountUp';

export default function Reports() {
  const { weeklyReports } = useDataStore();
  const [selectedId, setSelectedId] = useState<string | null>(weeklyReports[0]?.id ?? null);

  const selected = useMemo(
    () => weeklyReports.find(r => r.id === selectedId) ?? weeklyReports[0],
    [weeklyReports, selectedId]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slatePlus-900 tracking-tight">报表中心</h1>
          <p className="text-sm text-slatePlus-500 mt-1">智能周报自动生成 · 多维度 KPI 分析 · 优化策略建议</p>
        </div>
        <button className="btn-primary">
          <Plus size={16} />生成新报告
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4 data-card !p-0 overflow-hidden">
          <div className="p-5 border-b border-slatePlus-100">
            <h2 className="section-title text-lg flex items-center gap-2">
              <FileBarChart2 size={18} className="text-brand-600" />
              周报列表
            </h2>
            <p className="section-subtitle">共 {weeklyReports.length} 份报告</p>
          </div>
          <div className="divide-y divide-slatePlus-100 max-h-[640px] overflow-auto scrollbar-thin">
            {weeklyReports.map(report => (
              <button
                key={report.id}
                onClick={() => setSelectedId(report.id)}
                className={`w-full text-left p-5 transition-all hover:bg-slatePlus-50/80 ${
                  selected?.id === report.id
                    ? 'bg-brand-50/60 border-l-4 border-l-brand-500'
                    : 'border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="tag bg-brand-50 text-brand-700 border border-brand-100">
                        {report.scope}
                      </span>
                      <span className="text-xs text-slatePlus-400">
                        {report.generatedAt.slice(0, 10)}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slatePlus-800 mb-2">
                      {report.weekStart.slice(5)} ~ {report.weekEnd.slice(5)}
                    </p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-slatePlus-600">
                        <FileBarChart2 size={12} />
                        {formatNumber(report.summary.totalApplications)} 投递
                      </span>
                      <span className={`flex items-center gap-1 ${
                        report.summary.applicationsWow >= 0 ? 'text-emerald-600' : 'text-red-500'
                      }`}>
                        {report.summary.applicationsWow >= 0 ? (
                          <TrendingUp size={12} />
                        ) : (
                          <TrendingDown size={12} />
                        )}
                        {formatTrend(report.summary.applicationsWow)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); }}
                      className="p-2 rounded-lg hover:bg-slatePlus-100 text-slatePlus-400 hover:text-brand-600 transition-colors"
                      title="下载报告"
                    >
                      <Download size={16} />
                    </button>
                    <ChevronRight size={16} className="text-slatePlus-300" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-8 space-y-6">
          {selected ? (
            <>
              <div className="data-card">
                <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="tag bg-brand-50 text-brand-700 border border-brand-100">
                        {selected.scope}
                      </span>
                      <span className="tag bg-slatePlus-100 text-slatePlus-600 border border-slatePlus-200">
                        周报
                      </span>
                    </div>
                    <h2 className="section-title text-2xl">
                      {selected.weekStart} ~ {selected.weekEnd}
                    </h2>
                    <p className="section-subtitle">
                      生成时间：{selected.generatedAt.replace('T', ' ')}
                    </p>
                  </div>
                  <button className="btn-secondary">
                    <Download size={15} />下载 PDF
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slatePlus-800 mb-4">KPI 摘要</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <KpiSummaryCard
                      title="投递总量"
                      value={formatNumber(selected.summary.totalApplications)}
                      change={selected.summary.applicationsWow}
                      yoy={selected.summary.applicationsYoy}
                      gradient="from-navy-800 to-brand-600"
                      icon={<FileBarChart2 size={20} />}
                    />
                    <KpiSummaryCard
                      title="投递匹配率"
                      value={formatPercent(selected.summary.matchRate)}
                      change={selected.summary.matchRateWow}
                      gradient="from-emerald-600 to-teal-500"
                      icon={<UserCheck size={20} />}
                    />
                    <KpiSummaryCard
                      title="面试转化率"
                      value={formatPercent(selected.summary.interviewConversionRate)}
                      change={selected.summary.interviewConversionWow}
                      gradient="from-amber-500 to-orange-500"
                      icon={<Users size={20} />}
                    />
                    <KpiSummaryCard
                      title="Offer 接受率"
                      value={formatPercent(selected.summary.offerAcceptanceRate)}
                      change={selected.summary.offerAcceptanceWow}
                      gradient="from-sky-500 to-blue-600"
                      icon={<Target size={20} />}
                    />
                    <KpiSummaryCard
                      title="入职留存率"
                      value={formatPercent(selected.summary.retentionRate)}
                      change={selected.summary.retentionWow}
                      gradient="from-rose-500 to-pink-600"
                      icon={<Briefcase size={20} />}
                    />
                    <KpiSummaryCard
                      title="平均面试周期"
                      value={`${selected.summary.avgInterviewDays.toFixed(1)} 天`}
                      gradient="from-violet-500 to-purple-600"
                      icon={<Clock size={20} />}
                    />
                  </div>
                </div>
              </div>

              <div className="data-card">
                <h3 className="section-title flex items-center gap-2 mb-5">
                  <Lightbulb size={20} className="text-amber-500" />
                  优化建议
                </h3>
                <div className="grid grid-cols-3 gap-5">
                  <RecommendationSection
                    title="招聘渠道"
                    icon={<Megaphone size={16} />}
                    items={selected.recommendations.channels}
                    tagColor="bg-sky-50 text-sky-700 border-sky-100"
                  />
                  <RecommendationSection
                    title="人才画像"
                    icon={<UserSearch size={16} />}
                    items={selected.recommendations.talentProfile}
                    tagColor="bg-violet-50 text-violet-700 border-violet-100"
                  />
                  <RecommendationSection
                    title="优化策略"
                    icon={<Compass size={16} />}
                    items={selected.recommendations.strategies}
                    tagColor="bg-emerald-50 text-emerald-700 border-emerald-100"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="data-card h-[600px] flex flex-col items-center justify-center text-slatePlus-400">
              <FileBarChart2 size={48} className="opacity-30 mb-3" />
              <p>选择左侧周报查看详情</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiSummaryCard({
  title, value, change, yoy, gradient, icon
}: {
  title: string;
  value: string;
  change?: number;
  yoy?: number;
  gradient: string;
  icon: React.ReactNode;
}) {
  const isUp = (change ?? 0) >= 0;
  const isYoyUp = (yoy ?? 0) >= 0;

  return (
    <div className={`kpi-card bg-gradient-to-br ${gradient}`}>
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-sm font-medium text-white/85">{title}</p>
          <p className="mt-3 font-display text-2xl font-bold text-white tracking-tight">{value}</p>
          {(change !== undefined || yoy !== undefined) && (
            <div className="mt-2.5 flex flex-wrap items-center gap-3 text-sm">
              {change !== undefined && (
                <span className="inline-flex items-center gap-1 text-white/90 font-medium">
                  {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {formatTrend(change)}
                  <span className="text-white/60 font-normal">环比</span>
                </span>
              )}
              {yoy !== undefined && (
                <span className="inline-flex items-center gap-1 text-white/80 text-xs">
                  {isYoyUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {formatTrend(yoy)}
                  <span className="text-white/50">同比</span>
                </span>
              )}
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl bg-white/15 backdrop-blur-sm text-white">
          {icon}
        </div>
      </div>
      <div className="absolute -bottom-12 -right-8 w-40 h-40 rounded-full bg-white/10 blur-3xl pointer-events-none" />
    </div>
  );
}

function RecommendationSection({
  title, icon, items, tagColor
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  tagColor: string;
}) {
  return (
    <div className="p-5 rounded-xl bg-slatePlus-50/50 border border-slatePlus-100">
      <div className="flex items-center gap-2 mb-4">
        <span className={`p-1.5 rounded-lg tag ${tagColor}`}>{icon}</span>
        <h4 className="text-sm font-semibold text-slatePlus-800">{title}</h4>
      </div>
      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-sm text-slatePlus-600">
            <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
