import { create } from 'zustand';
import type {
  DailyMetric, JobPost, ProvinceData, HotJob, KpiSummary,
  WeeklyReport, PermissionUser, DistributionData, TrendPoint
} from '../types';
import {
  generateDailyMetrics, generateMockJobs, generateProvinceDeliveryData,
  generateHotJobs, generateWeeklyReports, generatePermissionUsers,
  generateTrendData, generateEducationDistribution, generateExperienceDistribution
} from '../data/mockData';
import { calcKpiSummary, filterMetrics, getDateRange } from '../utils/calculators';
import { useAuthStore } from './useAuthStore';

interface DataState {
  dailyMetrics: DailyMetric[];
  jobs: JobPost[];
  provinceData: ProvinceData[];
  hotJobs: HotJob[];
  weeklyReports: WeeklyReport[];
  permissionUsers: PermissionUser[];
  selectedIndustry: string | null;
  selectedProvince: string | null;
  selectedDateRange: { start: string; end: string };
  setFilters: (filters: { industry?: string | null; province?: string | null }) => void;
  setDateRange: (range: { start: string; end: string }) => void;
  getKpiSummary: () => KpiSummary;
  getFilteredMetrics: () => DailyMetric[];
  getCityTrend: (city?: string) => TrendPoint[];
  getEducationDist: (city?: string) => DistributionData[];
  getExperienceDist: (city?: string) => DistributionData[];
  addMockData: () => void;
}

const initMetrics = generateDailyMetrics(30);
const initJobs = generateMockJobs(300);

export const useDataStore = create<DataState>((set, get) => ({
  dailyMetrics: initMetrics,
  jobs: initJobs,
  provinceData: generateProvinceDeliveryData(),
  hotJobs: generateHotJobs(10),
  weeklyReports: generateWeeklyReports(8),
  permissionUsers: generatePermissionUsers(),
  selectedIndustry: null,
  selectedProvince: null,
  selectedDateRange: getDateRange(7),

  setFilters: (filters) => {
    set(state => ({
      selectedIndustry: filters.industry !== undefined ? filters.industry : state.selectedIndustry,
      selectedProvince: filters.province !== undefined ? filters.province : state.selectedProvince
    }));
  },

  setDateRange: (range) => set({ selectedDateRange: range }),

  getFilteredMetrics: () => {
    const { dailyMetrics, selectedIndustry, selectedProvince, selectedDateRange } = get();
    const user = useAuthStore.getState().user;
    const filters: { industries?: string[]; provinces?: string[]; startDate: string; endDate: string } = {
      startDate: selectedDateRange.start,
      endDate: selectedDateRange.end
    };
    if (selectedIndustry) filters.industries = [selectedIndustry];
    if (selectedProvince) filters.provinces = [selectedProvince];

    if (user?.role === 'region' && user.scope.regions) {
      // Region scope handled in component layer via province list
    }
    return filterMetrics(dailyMetrics, filters);
  },

  getKpiSummary: () => {
    const metrics = get().getFilteredMetrics();
    const { selectedDateRange } = get();
    const { start, end } = selectedDateRange;
    const daysDiff = Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000));
    const prevStart = new Date(start);
    prevStart.setDate(prevStart.getDate() - daysDiff);
    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevMetrics = filterMetrics(get().dailyMetrics, {
      startDate: prevStart.toISOString().split('T')[0],
      endDate: prevEnd.toISOString().split('T')[0]
    });
    return calcKpiSummary(metrics, prevMetrics);
  },

  getCityTrend: (city) => generateTrendData(city),
  getEducationDist: (city) => generateEducationDistribution(city),
  getExperienceDist: (city) => generateExperienceDistribution(city),

  addMockData: () => {
    const newMetrics = generateDailyMetrics(1);
    set(state => ({
      dailyMetrics: [...newMetrics, ...state.dailyMetrics].slice(0, 60)
    }));
  }
}));
