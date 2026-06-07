import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Users, Briefcase, CheckCircle2, UserCheck, Map, Trophy,
  ChevronDown, RefreshCw, Calendar
} from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import { KpiCard } from '../components/cards/KpiCard';
import { HeatMap } from '../components/charts/HeatMap';
import { BarRanking } from '../components/charts/BarRanking';
import { INDUSTRIES, PROVINCES } from '../data/constants';
import { useState } from 'react';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    provinceData, hotJobs, selectedIndustry, selectedProvince,
    selectedDateRange, setFilters, setDateRange, getKpiSummary,
    refreshKpi, refreshProvinceData, refreshHotJobs
  } = useDataStore();
  const [industryOpen, setIndustryOpen] = useState(false);
  const [provinceOpen, setProvinceOpen] = useState(false);
  const kpi = useMemo(() => getKpiSummary(), [selectedIndustry, selectedProvince, selectedDateRange, getKpiSummary]);

  useEffect(() => {
    void refreshKpi();
    void refreshProvinceData();
    void refreshHotJobs();
  }, [refreshKpi, refreshProvinceData, refreshHotJobs]);

  useEffect(() => {
    void refreshKpi();
  }, [selectedIndustry, selectedProvince, selectedDateRange, refreshKpi]);

  const handleProvinceClick = (province: string) => {
    const prov = PROVINCES.find(p => p.name === province);
    if (prov && prov.cities.length > 0) {
      navigate(`/dashboard/city/${encodeURIComponent(prov.cities[0])}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slatePlus-900 tracking-tight">招聘核心看板</h1>
          <p className="text-sm text-slatePlus-500 mt-1">
            全国投递数据概览 · 实时计算指标 · 异常预警监测
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <button onClick={() => { setIndustryOpen(o => !o); setProvinceOpen(false); }}
              className="btn-secondary !py-2 text-sm">
              <FileText size={15} />
              <span>{selectedIndustry || '全部行业'}</span>
              <ChevronDown size={14} />
            </button>
            {industryOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIndustryOpen(false)} />
                <div className="absolute top-full mt-2 right-0 w-52 bg-white rounded-xl shadow-card-hover border border-slatePlus-200/60 py-2 z-20 max-h-72 overflow-auto scrollbar-thin">
                  <button onClick={() => { setFilters({ industry: null }); setIndustryOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slatePlus-50 ${!selectedIndustry ? 'text-brand-600 font-semibold' : 'text-slatePlus-700'}`}>
                    全部行业
                  </button>
                  {INDUSTRIES.map(ind => (
                    <button key={ind} onClick={() => { setFilters({ industry: ind }); setIndustryOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-slatePlus-50 ${selectedIndustry === ind ? 'text-brand-600 font-semibold' : 'text-slatePlus-700'}`}>
                      {ind}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button onClick={() => { setProvinceOpen(o => !o); setIndustryOpen(false); }}
              className="btn-secondary !py-2 text-sm">
              <Map size={15} />
              <span>{selectedProvince || '全国'}</span>
              <ChevronDown size={14} />
            </button>
            {provinceOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProvinceOpen(false)} />
                <div className="absolute top-full mt-2 right-0 w-52 bg-white rounded-xl shadow-card-hover border border-slatePlus-200/60 py-2 z-20 max-h-72 overflow-auto scrollbar-thin">
                  <button onClick={() => { setFilters({ province: null }); setProvinceOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slatePlus-50 ${!selectedProvince ? 'text-brand-600 font-semibold' : 'text-slatePlus-700'}`}>
                    全国
                  </button>
                  {PROVINCES.map(p => (
                    <button key={p.name} onClick={() => { setFilters({ province: p.name }); setProvinceOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-slatePlus-50 ${selectedProvince === p.name ? 'text-brand-600 font-semibold' : 'text-slatePlus-700'}`}>
                      {p.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button className="btn-secondary !py-2 text-sm">
            <Calendar size={15} />
            <span>{selectedDateRange.start.slice(5)} ~ {selectedDateRange.end.slice(5)}</span>
          </button>

          <button onClick={() => { setFilters({ industry: null, province: null }); setDateRange({ start: '', end: '' }); }}
            className="btn-secondary !py-2 text-sm">
            <RefreshCw size={15} />
            重置
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-5">
        <KpiCard
          title="投递总量"
          value={kpi.totalApplications}
          change={kpi.applicationChange}
          format="number"
          gradient="bg-gradient-to-br from-navy-800 to-brand-600"
          icon={<FileText size={22} />}
          delay={0}
        />
        <KpiCard
          title="在招职位"
          value={kpi.totalJobs}
          format="number"
          gradient="bg-gradient-to-br from-slate-700 to-slatePlus-800"
          icon={<Briefcase size={22} />}
          delay={80}
        />
        <KpiCard
          title="投递匹配率"
          value={kpi.matchRate}
          change={kpi.matchRateChange}
          format="percent"
          gradient="bg-gradient-to-br from-emerald-600 to-teal-500"
          icon={<UserCheck size={22} />}
          delay={160}
        />
        <KpiCard
          title="面试转化率"
          value={kpi.interviewConversionRate}
          change={kpi.interviewChange}
          format="percent"
          gradient="bg-gradient-to-br from-amber-500 to-orange-500"
          icon={<Users size={22} />}
          delay={240}
        />
        <KpiCard
          title="入职留存率"
          value={kpi.retentionRate}
          change={kpi.retentionChange}
          format="percent"
          gradient="bg-gradient-to-br from-rose-500 to-pink-600"
          icon={<CheckCircle2 size={22} />}
          delay={320}
        />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7 data-card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="section-title"><Map className="inline-block mr-2" size={20} />全国投递热力图</h2>
              <p className="section-subtitle">点击省份可下钻查看该省份热门城市详情</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-slatePlus-500">
              <span className="w-3 h-3 rounded bg-[#dbe6ff]"></span>
              <span>低</span>
              <span className="mx-2">→</span>
              <span className="w-3 h-3 rounded bg-[#0b3aab]"></span>
              <span>高</span>
            </div>
          </div>
          <div className="-mx-2">
            <HeatMap data={provinceData} onProvinceClick={handleProvinceClick} />
          </div>
        </div>

        <div className="col-span-5 data-card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="section-title"><Trophy className="inline-block mr-2" size={20} />职位热度TOP 10</h2>
              <p className="section-subtitle">按近7天累计投递量排名</p>
            </div>
          </div>
          <BarRanking data={hotJobs} />
        </div>
      </div>
    </div>
  );
}
