import type { DailyMetric, Alert, AlertType, AlertLevel } from '../types';
import { groupByIndustry, getDateRange, filterMetrics, aggregateMetrics, calcInterviewConversion, calcIndustryAverages } from './calculators';
import { getRegionByProvince } from '../data/mockData';

export interface AlertRuleResult {
  triggered: boolean;
  type: AlertType;
  level: AlertLevel;
  industry: string;
  region: string;
  dropRate?: number;
  conversionGap?: number;
  description: string;
}

function consecutiveDays(arr: boolean[]): number {
  let max = 0, cur = 0;
  for (const v of arr) { if (v) { cur++; max = Math.max(max, cur); } else cur = 0; }
  return max;
}

export function checkDeliveryDropRule(metrics: DailyMetric[]): AlertRuleResult[] {
  const results: AlertRuleResult[] = [];
  const { start, end } = getDateRange(14);
  const recent = filterMetrics(metrics, { startDate: start, endDate: end });
  const byIndustry = groupByIndustry(recent);

  byIndustry.forEach((arr, industry) => {
    const byDate = new Map<string, { apps: number; region: string }>();
    arr.forEach(m => {
      const cur = byDate.get(m.date) || { apps: 0, region: getRegionByProvince(m.province) || '全国' };
      cur.apps += m.applications;
      byDate.set(m.date, cur);
    });
    const dates = Array.from(byDate.keys()).sort();
    if (dates.length < 7) return;

    const drops: boolean[] = [];
    let maxDropRate = 0;
    for (let i = 1; i < dates.length; i++) {
      const prev = byDate.get(dates[i - 1])!.apps;
      const curr = byDate.get(dates[i])!.apps;
      const drop = prev === 0 ? 0 : ((prev - curr) / prev) * 100;
      drops.push(drop > 30);
      maxDropRate = Math.max(maxDropRate, drop);
    }

    const consecDays = consecutiveDays(drops.slice(-6));
    if (consecDays >= 3) {
      const level = consecDays >= 5 ? 2 : 1;
      const regions = new Set(arr.map(m => getRegionByProvince(m.province)).filter(Boolean));
      results.push({
        triggered: true,
        type: 'delivery_drop',
        level: level as AlertLevel,
        industry,
        region: regions.size > 0 ? Array.from(regions)[0] as string : '全国',
        dropRate: Number(maxDropRate.toFixed(1)),
        description: `${industry}行业连续${consecDays}天投递量环比下降${maxDropRate.toFixed(1)}%，${level === 2 ? '已升级为二级预警' : '触发一级预警'}`
      });
    }
  });
  return results;
}

export function checkConversionLowRule(metrics: DailyMetric[]): AlertRuleResult[] {
  const results: AlertRuleResult[] = [];
  const industryAvgs = calcIndustryAverages(metrics);
  const byIndustry = groupByIndustry(metrics);
  const globalAvg = Array.from(industryAvgs.values()).reduce((s, v) => s + v.interviewConversion, 0) / Math.max(industryAvgs.size, 1);

  byIndustry.forEach((arr, industry) => {
    const agg = aggregateMetrics(arr);
    const conv = calcInterviewConversion(agg.interviews, agg.matchedApplications) * 100;
    const avg = industryAvgs.get(industry)?.interviewConversion || globalAvg;
    const gap = ((conv - avg) / Math.max(avg, 0.1)) * 100;

    if (gap < -20) {
      const regions = new Set(arr.map(m => getRegionByProvince(m.province)).filter(Boolean));
      results.push({
        triggered: true,
        type: 'conversion_low',
        level: 1,
        industry,
        region: regions.size > 0 ? Array.from(regions)[0] as string : '全国',
        conversionGap: Number(gap.toFixed(1)),
        description: `${industry}行业面试转化率为${conv.toFixed(1)}%，低于行业均值${avg.toFixed(1)}%的${Math.abs(gap).toFixed(1)}%`
      });
    }
  });
  return results;
}

export function runAlertEngine(metrics: DailyMetric[]): AlertRuleResult[] {
  return [...checkDeliveryDropRule(metrics), ...checkConversionLowRule(metrics)];
}

export function createAlertFromResult(r: AlertRuleResult): Alert {
  return {
    id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type: r.type,
    level: r.level,
    industry: r.industry,
    region: r.region,
    description: r.description,
    triggeredAt: new Date().toISOString(),
    status: 'pending',
    deliveryDropRate: r.dropRate,
    conversionGap: r.conversionGap,
    approvalSteps: [
      { role: 'operation', roleName: '运营主管', approved: false },
      { role: 'director', roleName: '区域总监', approved: false },
      { role: 'head', roleName: '总部招聘负责人', approved: false }
    ],
    currentStepIndex: 0,
    improvementDays: 0
  };
}

export function canApprove(alert: Alert, userRole: 'hq' | 'region' | 'enterprise'): boolean {
  if (alert.status === 'resolved' || alert.status === 'approved') return false;
  if (alert.level !== 2) return false;
  const step = alert.approvalSteps[alert.currentStepIndex];
  if (!step) return false;
  if (step.approved) return false;
  if (userRole === 'hq' && step.role === 'head') return true;
  if (userRole === 'region' && step.role === 'director') return true;
  if (userRole === 'enterprise' && step.role === 'operation') return true;
  return false;
}

export function nextStepRole(role: 'operation' | 'director' | 'head'): 'operation' | 'director' | 'head' | null {
  if (role === 'operation') return 'director';
  if (role === 'director') return 'head';
  return null;
}
