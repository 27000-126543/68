import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, TrendingUp, GraduationCap, Briefcase } from 'lucide-react';
import { useMemo, useEffect } from 'react';
import { useDataStore } from '../store/useDataStore';
import { TrendLine } from '../components/charts/TrendLine';
import { PieDistribution } from '../components/charts/PieDistribution';
import { KpiCard } from '../components/cards/KpiCard';
import { Users, FileText, UserCheck, CheckCircle2 } from 'lucide-react';
import { INDUSTRIES } from '../data/constants';

export default function CityDetail() {
  const { cityId } = useParams();
  const city = decodeURIComponent(cityId || '北京');
  const navigate = useNavigate();
  const {
    getCityTrend, getEducationDist, getExperienceDist, getKpiSummary, setFilters,
    refreshCityTrend, refreshEducationDist, refreshExperienceDist, refreshKpi
  } = useDataStore();

  useEffect(() => {
    setFilters({ province: null });
    void refreshCityTrend(city);
    void refreshEducationDist(city);
    void refreshExperienceDist(city);
    void refreshKpi();
  }, [city, refreshCityTrend, refreshEducationDist, refreshExperienceDist, refreshKpi, setFilters]);

  const trendData = useMemo(() => getCityTrend(city), [city, getCityTrend]);
  const eduDist = useMemo(() => getEducationDist(city), [city, getEducationDist]);
  const expDist = useMemo(() => getExperienceDist(city), [city, getExperienceDist]);
  const kpi = useMemo(() => getKpiSummary(), [getKpiSummary]);

  const displayIndustries = INDUSTRIES.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="btn-secondary !py-2 !px-3 text-sm">
            <ArrowLeft size={16} />
            返回看板
          </button>
          <div>
            <h1 className="font-display text-3xl font-bold text-slatePlus-900 tracking-tight flex items-center gap-2">
              <MapPin size={24} className="text-brand-600" />
              {city}
            </h1>
            <p className="text-sm text-slatePlus-500 mt-1">城市级招聘数据详情 · 近7天趋势分析</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <KpiCard title="投递总量" value={Math.floor(kpi.totalApplications * 0.15)} change={kpi.applicationChange} format="number"
          gradient="bg-gradient-to-br from-navy-800 to-brand-600" icon={<FileText size={22} />} />
        <KpiCard title="投递匹配率" value={kpi.matchRate + 3} change={kpi.matchRateChange} format="percent"
          gradient="bg-gradient-to-br from-emerald-600 to-teal-500" icon={<UserCheck size={22} />} delay={80} />
        <KpiCard title="面试转化率" value={kpi.interviewConversionRate + 2} change={kpi.interviewChange} format="percent"
          gradient="bg-gradient-to-br from-amber-500 to-orange-500" icon={<Users size={22} />} delay={160} />
        <KpiCard title="Offer接受率" value={kpi.offerAcceptanceRate} change={kpi.offerChange} format="percent"
          gradient="bg-gradient-to-br from-rose-500 to-pink-600" icon={<CheckCircle2 size={22} />} delay={240} />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 data-card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="section-title"><TrendingUp className="inline-block mr-2" size={20} />近7天各行业投递趋势</h2>
              <p className="section-subtitle">展示主要行业的每日投递量变动</p>
            </div>
          </div>
          <TrendLine data={trendData} industries={displayIndustries} height={380} />
        </div>

        <div className="col-span-4 data-card">
          <h2 className="section-title flex items-center gap-2 mb-5">
            <GraduationCap size={20} /> 学历分布
          </h2>
          <PieDistribution data={eduDist} type="pie" height={260} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-6 data-card">
          <h2 className="section-title flex items-center gap-2 mb-5">
            <Briefcase size={20} /> 工作经验分布
          </h2>
          <PieDistribution data={expDist} type="bar" height={320} />
        </div>

        <div className="col-span-6 data-card">
          <h2 className="section-title flex items-center gap-2 mb-5">
            <GraduationCap size={20} /> 学历占比详情
          </h2>
          <PieDistribution data={eduDist} type="bar" height={320} />
        </div>
      </div>
    </div>
  );
}
