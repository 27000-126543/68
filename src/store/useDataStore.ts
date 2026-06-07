import { create } from 'zustand';
import type {
  DailyMetric, JobPost, ProvinceData, HotJob, KpiSummary,
  WeeklyReport, PermissionUser, DistributionData, TrendPoint
} from '../types';
import { getDateRange } from '../utils/calculators';
import { useAuthStore } from './useAuthStore';
import {
  getKpi, getDeliveryMap, getHotJobs, getReports, getPermissionUsers,
  getTrend, getEducationDist, getExperienceDist,
  type KpiParams
} from '../utils/api';

interface DataState {
  dailyMetrics: DailyMetric[];
  jobs: JobPost[];
  provinceData: ProvinceData[];
  hotJobs: HotJob[];
  weeklyReports: WeeklyReport[];
  permissionUsers: PermissionUser[];
  kpiSummary: KpiSummary | null;
  trendData: TrendPoint[];
  educationDist: DistributionData[];
  experienceDist: DistributionData[];
  loading: {
    kpi: boolean;
    province: boolean;
    hotJobs: boolean;
    reports: boolean;
    permissionUsers: boolean;
    trend: boolean;
    educationDist: boolean;
    experienceDist: boolean;
  };
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
  refreshKpi: () => Promise<void>;
  refreshProvinceData: () => Promise<void>;
  refreshHotJobs: () => Promise<void>;
  refreshReports: () => Promise<void>;
  refreshPermissionUsers: () => Promise<void>;
  refreshCityTrend: (city?: string) => Promise<void>;
  refreshEducationDist: (city?: string) => Promise<void>;
  refreshExperienceDist: (city?: string) => Promise<void>;
  refreshAll: () => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
  dailyMetrics: [],
  jobs: [],
  provinceData: [],
  hotJobs: [],
  weeklyReports: [],
  permissionUsers: [],
  kpiSummary: null,
  trendData: [],
  educationDist: [],
  experienceDist: [],
  loading: {
    kpi: false,
    province: false,
    hotJobs: false,
    reports: false,
    permissionUsers: false,
    trend: false,
    educationDist: false,
    experienceDist: false
  },
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
    return get().dailyMetrics;
  },

  getKpiSummary: () => {
    const { kpiSummary, selectedIndustry, selectedProvince, selectedDateRange } = get();
    if (kpiSummary) return kpiSummary;

    const params: KpiParams = {
      startDate: selectedDateRange.start,
      endDate: selectedDateRange.end
    };
    if (selectedIndustry) params.industry = selectedIndustry;
    if (selectedProvince) params.province = selectedProvince;

    const user = useAuthStore.getState().user;
    if (user?.role === 'region' && user.scope.regions && user.scope.regions.length > 0) {
      // Region scope handled by backend via province filter if needed
    }

    void getKpi(params).then(data => {
      set({ kpiSummary: data });
    }).catch(() => {
      // ignore
    });

    return {
      totalApplications: 0,
      matchRate: 0,
      interviewConversionRate: 0,
      offerAcceptanceRate: 0,
      retentionRate: 0,
      totalJobs: 0,
      applicationChange: 0,
      matchRateChange: 0,
      interviewChange: 0,
      offerChange: 0,
      retentionChange: 0
    };
  },

  getCityTrend: (city) => {
    return get().trendData;
  },

  getEducationDist: (city) => {
    return get().educationDist;
  },

  getExperienceDist: (city) => {
    return get().experienceDist;
  },

  addMockData: () => {
    // no-op for backward compatibility
  },

  refreshKpi: async () => {
    set(state => ({ loading: { ...state.loading, kpi: true } }));
    try {
      const { selectedIndustry, selectedProvince, selectedDateRange } = get();
      const params: KpiParams = {
        startDate: selectedDateRange.start,
        endDate: selectedDateRange.end
      };
      if (selectedIndustry) params.industry = selectedIndustry;
      if (selectedProvince) params.province = selectedProvince;
      const data = await getKpi(params);
      set({ kpiSummary: data });
    } finally {
      set(state => ({ loading: { ...state.loading, kpi: false } }));
    }
  },

  refreshProvinceData: async () => {
    set(state => ({ loading: { ...state.loading, province: true } }));
    try {
      const data = await getDeliveryMap();
      set({ provinceData: data });
    } finally {
      set(state => ({ loading: { ...state.loading, province: false } }));
    }
  },

  refreshHotJobs: async () => {
    set(state => ({ loading: { ...state.loading, hotJobs: true } }));
    try {
      const data = await getHotJobs();
      set({ hotJobs: data });
    } finally {
      set(state => ({ loading: { ...state.loading, hotJobs: false } }));
    }
  },

  refreshReports: async () => {
    set(state => ({ loading: { ...state.loading, reports: true } }));
    try {
      const data = await getReports();
      set({ weeklyReports: data });
    } finally {
      set(state => ({ loading: { ...state.loading, reports: false } }));
    }
  },

  refreshPermissionUsers: async () => {
    set(state => ({ loading: { ...state.loading, permissionUsers: true } }));
    try {
      const data = await getPermissionUsers();
      set({ permissionUsers: data });
    } finally {
      set(state => ({ loading: { ...state.loading, permissionUsers: false } }));
    }
  },

  refreshCityTrend: async (city) => {
    set(state => ({ loading: { ...state.loading, trend: true } }));
    try {
      const data = await getTrend(city);
      set({ trendData: data });
    } finally {
      set(state => ({ loading: { ...state.loading, trend: false } }));
    }
  },

  refreshEducationDist: async (city) => {
    set(state => ({ loading: { ...state.loading, educationDist: true } }));
    try {
      const data = await getEducationDist(city);
      set({ educationDist: data });
    } finally {
      set(state => ({ loading: { ...state.loading, educationDist: false } }));
    }
  },

  refreshExperienceDist: async (city) => {
    set(state => ({ loading: { ...state.loading, experienceDist: true } }));
    try {
      const data = await getExperienceDist(city);
      set({ experienceDist: data });
    } finally {
      set(state => ({ loading: { ...state.loading, experienceDist: false } }));
    }
  },

  refreshAll: async () => {
    await Promise.all([
      get().refreshKpi(),
      get().refreshProvinceData(),
      get().refreshHotJobs()
    ]);
  }
}));
