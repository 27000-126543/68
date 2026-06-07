import type { DailyMetric, KpiSummary } from '../types';

const safeDiv = (a: number, b: number, fallback = 0) => (b === 0 ? fallback : a / b);

export const calcMatchRate = (matched: number, total: number) => safeDiv(matched, total);
export const calcInterviewConversion = (interviews: number, matched: number) => safeDiv(interviews, matched);
export const calcOfferAcceptance = (accepted: number, offers: number) => safeDiv(accepted, offers);
export const calcRetention = (retained: number, onboardings: number) => safeDiv(retained, onboardings);

export interface MetricFilters {
  industries?: string[];
  provinces?: string[];
  cities?: string[];
  startDate?: string;
  endDate?: string;
}

export function filterMetrics(metrics: DailyMetric[], filters: MetricFilters = {}): DailyMetric[] {
  return metrics.filter(m => {
    if (filters.industries?.length && !filters.industries.includes(m.industry)) return false;
    if (filters.provinces?.length && !filters.provinces.includes(m.province)) return false;
    if (filters.cities?.length && !filters.cities.includes(m.city)) return false;
    if (filters.startDate && m.date < filters.startDate) return false;
    if (filters.endDate && m.date > filters.endDate) return false;
    return true;
  });
}

export function aggregateMetrics(metrics: DailyMetric[]): {
  applications: number;
  matchedApplications: number;
  interviews: number;
  offers: number;
  acceptedOffers: number;
  onboardings: number;
  retainedOnboardings: number;
} {
  return metrics.reduce(
    (acc, m) => ({
      applications: acc.applications + m.applications,
      matchedApplications: acc.matchedApplications + m.matchedApplications,
      interviews: acc.interviews + m.interviews,
      offers: acc.offers + m.offers,
      acceptedOffers: acc.acceptedOffers + m.acceptedOffers,
      onboardings: acc.onboardings + m.onboardings,
      retainedOnboardings: acc.retainedOnboardings + m.retainedOnboardings
    }),
    { applications: 0, matchedApplications: 0, interviews: 0, offers: 0, acceptedOffers: 0, onboardings: 0, retainedOnboardings: 0 }
  );
}

export function calcKpiSummary(metrics: DailyMetric[], prevMetrics?: DailyMetric[]): KpiSummary {
  const agg = aggregateMetrics(metrics);
  const prev = prevMetrics ? aggregateMetrics(prevMetrics) : null;

  const kpi: KpiSummary = {
    totalApplications: agg.applications,
    matchRate: calcMatchRate(agg.matchedApplications, agg.applications) * 100,
    interviewConversionRate: calcInterviewConversion(agg.interviews, agg.matchedApplications) * 100,
    offerAcceptanceRate: calcOfferAcceptance(agg.acceptedOffers, agg.offers) * 100,
    retentionRate: calcRetention(agg.retainedOnboardings, agg.onboardings) * 100,
    totalJobs: Math.floor(agg.applications / 8),
    applicationChange: 0,
    matchRateChange: 0,
    interviewChange: 0,
    offerChange: 0,
    retentionChange: 0
  };

  if (prev) {
    kpi.applicationChange = ((agg.applications - prev.applications) / Math.max(prev.applications, 1)) * 100;
    const prevMatch = calcMatchRate(prev.matchedApplications, prev.applications) * 100;
    const prevInt = calcInterviewConversion(prev.interviews, prev.matchedApplications) * 100;
    const prevOff = calcOfferAcceptance(prev.acceptedOffers, prev.offers) * 100;
    const prevRet = calcRetention(prev.retainedOnboardings, prev.onboardings) * 100;
    kpi.matchRateChange = kpi.matchRate - prevMatch;
    kpi.interviewChange = kpi.interviewConversionRate - prevInt;
    kpi.offerChange = kpi.offerAcceptanceRate - prevOff;
    kpi.retentionChange = kpi.retentionRate - prevRet;
  }

  return kpi;
}

export function groupByDate(metrics: DailyMetric[]): Map<string, DailyMetric[]> {
  const map = new Map<string, DailyMetric[]>();
  metrics.forEach(m => {
    const arr = map.get(m.date) || [];
    arr.push(m);
    map.set(m.date, arr);
  });
  return map;
}

export function groupByIndustry(metrics: DailyMetric[]): Map<string, DailyMetric[]> {
  const map = new Map<string, DailyMetric[]>();
  metrics.forEach(m => {
    const arr = map.get(m.industry) || [];
    arr.push(m);
    map.set(m.industry, arr);
  });
  return map;
}

export function groupByCity(metrics: DailyMetric[]): Map<string, DailyMetric[]> {
  const map = new Map<string, DailyMetric[]>();
  metrics.forEach(m => {
    const key = `${m.province}|${m.city}`;
    const arr = map.get(key) || [];
    arr.push(m);
    map.set(key, arr);
  });
  return map;
}

export function getDateRange(days: number): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
}

export function calcIndustryAverages(metrics: DailyMetric[]): Map<string, { interviewConversion: number; deliveryTrend: number[] }> {
  const result = new Map();
  const byIndustry = groupByIndustry(metrics);
  byIndustry.forEach((arr, ind) => {
    const byDate = new Map<string, DailyMetric[]>();
    arr.forEach(m => {
      const a = byDate.get(m.date) || [];
      a.push(m);
      byDate.set(m.date, a);
    });
    const dates = Array.from(byDate.keys()).sort();
    const deliveryTrend = dates.slice(-7).map(d => {
      const day = byDate.get(d)!;
      return day.reduce((s, m) => s + m.applications, 0);
    });
    const agg = aggregateMetrics(arr);
    result.set(ind, {
      interviewConversion: calcInterviewConversion(agg.interviews, agg.matchedApplications) * 100,
      deliveryTrend
    });
  });
  return result;
}
