import { Database } from 'sql.js';
import { queryAll } from '../db';

const safeDiv = (a: number, b: number, fallback = 0) => (b === 0 ? fallback : a / b);

export const calcMatchRate = (matched: number, total: number) => safeDiv(matched, total);
export const calcInterviewConversion = (interviews: number, matched: number) => safeDiv(interviews, matched);
export const calcOfferAcceptance = (accepted: number, offers: number) => safeDiv(accepted, offers);
export const calcRetention = (retained: number, onboardings: number) => safeDiv(retained, onboardings);

export interface MetricFilters {
  industry?: string;
  province?: string;
  city?: string;
  startDate?: string;
  endDate?: string;
}

export function buildWhereClause(filters: MetricFilters): { sql: string; params: any[] } {
  const conditions: string[] = [];
  const params: any[] = [];

  if (filters.industry) {
    conditions.push('industry = ?');
    params.push(filters.industry);
  }
  if (filters.province) {
    conditions.push('province = ?');
    params.push(filters.province);
  }
  if (filters.city) {
    conditions.push('city = ?');
    params.push(filters.city);
  }
  if (filters.startDate) {
    conditions.push('date >= ?');
    params.push(filters.startDate);
  }
  if (filters.endDate) {
    conditions.push('date <= ?');
    params.push(filters.endDate);
  }

  return {
    sql: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params
  };
}

export function aggregateMetricsFromDb(
  db: Database,
  filters: MetricFilters = {}
): {
  applications: number;
  matchedApplications: number;
  interviews: number;
  offers: number;
  acceptedOffers: number;
  onboardings: number;
  retainedOnboardings: number;
} {
  const { sql, params } = buildWhereClause(filters);
  const rows = queryAll(
    db,
    `SELECT
      SUM(applications) as applications,
      SUM(matched_applications) as matched_applications,
      SUM(interviews) as interviews,
      SUM(offers) as offers,
      SUM(accepted_offers) as accepted_offers,
      SUM(onboardings) as onboardings,
      SUM(retained_onboardings) as retained_onboardings
    FROM daily_metrics
    ${sql}`,
    params
  );

  const row = rows[0] || {};
  return {
    applications: row.applications || 0,
    matchedApplications: row.matched_applications || 0,
    interviews: row.interviews || 0,
    offers: row.offers || 0,
    acceptedOffers: row.accepted_offers || 0,
    onboardings: row.onboardings || 0,
    retainedOnboardings: row.retained_onboardings || 0
  };
}

export function calcKpiSummaryFromDb(db: Database, filters: MetricFilters = {}) {
  const agg = aggregateMetricsFromDb(db, filters);

  const startDate = filters.startDate ? new Date(filters.startDate) : new Date();
  const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
  const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 7);

  const prevStart = new Date(startDate);
  prevStart.setDate(prevStart.getDate() - days);
  const prevEnd = new Date(startDate);
  prevEnd.setDate(prevEnd.getDate() - 1);

  const prevFilters: MetricFilters = {
    ...filters,
    startDate: prevStart.toISOString().split('T')[0],
    endDate: prevEnd.toISOString().split('T')[0]
  };
  const prev = aggregateMetricsFromDb(db, prevFilters);

  const kpi = {
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

  if (prev.applications > 0 || prev.matchedApplications > 0) {
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

export function getDateRange(days: number): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
}

export const REGIONS = [
  { id: 'north', name: '华北', provinces: ['北京', '天津', '河北', '山西', '内蒙古'] },
  { id: 'east', name: '华东', provinces: ['上海', '江苏', '浙江', '安徽', '福建', '江西', '山东'] },
  { id: 'south', name: '华南', provinces: ['广东', '广西', '海南'] },
  { id: 'central', name: '华中', provinces: ['河南', '湖北', '湖南'] },
  { id: 'southwest', name: '西南', provinces: ['重庆', '四川', '贵州', '云南', '西藏'] },
  { id: 'northwest', name: '西北', provinces: ['陕西', '甘肃', '青海', '宁夏', '新疆'] },
  { id: 'northeast', name: '东北', provinces: ['辽宁', '吉林', '黑龙江'] }
];

export function getRegionByProvince(province: string): string | undefined {
  return REGIONS.find(r => r.provinces.includes(province))?.name;
}
