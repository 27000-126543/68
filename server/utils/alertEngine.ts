import { Database } from 'sql.js';
import { queryAll, queryOne, exec } from '../db';
import { getDateRange, getRegionByProvince, calcInterviewConversion } from './calculators';

function consecutiveDays(arr: boolean[]): number {
  let max = 0, cur = 0;
  for (const v of arr) { if (v) { cur++; max = Math.max(max, cur); } else cur = 0; }
  return max;
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};
const pick = <T>(arr: T[], seed: number): T => arr[Math.floor(seededRandom(seed) * arr.length)];

export function runAlertEngine(db: Database) {
  const { start } = getDateRange(14);

  const rows = queryAll(
    db,
    `SELECT date, industry, province, SUM(applications) as applications,
            SUM(matched_applications) as matched_applications,
            SUM(interviews) as interviews
     FROM daily_metrics
     WHERE date >= ?
     GROUP BY date, industry, province
     ORDER BY date`,
    [start]
  );

  const byIndustryDate = new Map<string, Map<string, { apps: number; matched: number; interviews: number; region: string }>>();
  for (const row of rows) {
    const industry = row.industry;
    const date = row.date;
    if (!byIndustryDate.has(industry)) {
      byIndustryDate.set(industry, new Map());
    }
    const dateMap = byIndustryDate.get(industry)!;
    const region = getRegionByProvince(row.province) || '全国';
    const existing = dateMap.get(date) || { apps: 0, matched: 0, interviews: 0, region };
    existing.apps += row.applications || 0;
    existing.matched += row.matched_applications || 0;
    existing.interviews += row.interviews || 0;
    dateMap.set(date, existing);
  }

  const industryTotals = new Map<string, { matched: number; interviews: number }>();
  for (const row of rows) {
    const ind = row.industry;
    const existing = industryTotals.get(ind) || { matched: 0, interviews: 0 };
    existing.matched += row.matched_applications || 0;
    existing.interviews += row.interviews || 0;
    industryTotals.set(ind, existing);
  }

  const globalAvgConv = Array.from(industryTotals.values()).reduce((s, v) => {
    return s + calcInterviewConversion(v.interviews, v.matched) * 100;
  }, 0) / Math.max(industryTotals.size, 1);

  const triggeredAlerts: any[] = [];

  byIndustryDate.forEach((dateMap, industry) => {
    const dates = Array.from(dateMap.keys()).sort();
    if (dates.length >= 7) {
      const drops: boolean[] = [];
      let maxDropRate = 0;
      for (let i = 1; i < dates.length; i++) {
        const prev = dateMap.get(dates[i - 1])!.apps;
        const curr = dateMap.get(dates[i])!.apps;
        const drop = prev === 0 ? 0 : ((prev - curr) / prev) * 100;
        drops.push(drop > 30);
        maxDropRate = Math.max(maxDropRate, drop);
      }

      const consecDays = consecutiveDays(drops.slice(-6));
      if (consecDays >= 3) {
        const level = consecDays >= 5 ? 2 : 1;
        const regions = new Set<string>();
        dateMap.forEach(v => regions.add(v.region));
        triggeredAlerts.push({
          type: 'delivery_drop',
          level,
          industry,
          region: regions.size > 0 ? Array.from(regions)[0] : '全国',
          delivery_drop_rate: Number(maxDropRate.toFixed(1)),
          conversion_gap: null,
          description: `${industry}行业连续${consecDays}天投递量环比下降${maxDropRate.toFixed(1)}%，${level === 2 ? '已升级为二级预警，请启动三级审批流程。' : '触发一级预警'}`
        });
      }
    }

    const total = industryTotals.get(industry) || { matched: 0, interviews: 0 };
    const conv = calcInterviewConversion(total.interviews, total.matched) * 100;
    const industryAvg = conv > 0 ? conv : globalAvgConv;
    const gap = ((conv - industryAvg) / Math.max(industryAvg, 0.1)) * 100;

    if (gap < -20) {
      const regions = new Set<string>();
      dateMap.forEach(v => regions.add(v.region));
      triggeredAlerts.push({
        type: 'conversion_low',
        level: 1,
        industry,
        region: regions.size > 0 ? Array.from(regions)[0] : '全国',
        delivery_drop_rate: null,
        conversion_gap: Number(gap.toFixed(1)),
        description: `${industry}行业面试转化率为${conv.toFixed(1)}%，低于行业均值${industryAvg.toFixed(1)}%的${Math.abs(gap).toFixed(1)}%，请优化简历筛选标准。`
      });
    }
  });

  return triggeredAlerts;
}

export function getAlertsFromDb(db: Database, filters?: { status?: string; level?: string; keyword?: string }) {
  let sql = 'SELECT * FROM alerts';
  const conditions: string[] = [];
  const params: any[] = [];

  if (filters?.status) {
    conditions.push('status = ?');
    params.push(filters.status);
  }
  if (filters?.level) {
    conditions.push('level = ?');
    params.push(Number(filters.level));
  }
  if (filters?.keyword) {
    conditions.push('(description LIKE ? OR industry LIKE ?)');
    params.push(`%${filters.keyword}%`, `%${filters.keyword}%`);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(' AND ')}`;
  }
  sql += ' ORDER BY triggered_at DESC';

  const alerts = queryAll(db, sql, params);

  for (const alert of alerts) {
    alert.approvalSteps = queryAll(
      db,
      'SELECT * FROM approval_steps WHERE alert_id = ? ORDER BY step_order',
      [alert.id]
    ).map(step => ({
      role: step.role,
      roleName: step.role_name,
      approved: step.approved === 1,
      approverId: step.approver_id,
      approverName: step.approver_name,
      approvedAt: step.approved_at,
      comment: step.comment
    }));
    alert.currentStepIndex = alert.current_step_index;
    alert.deliveryDropRate = alert.delivery_drop_rate;
    alert.conversionGap = alert.conversion_gap;
    alert.triggeredAt = alert.triggered_at;
    alert.resolvedAt = alert.resolved_at;
    alert.improvementDays = alert.improvement_days;

    delete alert.current_step_index;
    delete alert.delivery_drop_rate;
    delete alert.conversion_gap;
    delete alert.triggered_at;
    delete alert.resolved_at;
    delete alert.improvement_days;
  }

  return alerts;
}

export function approveAlert(
  db: Database,
  alertId: string,
  role: string,
  comment: string,
  approverName: string
) {
  const alert = queryOne(db, 'SELECT * FROM alerts WHERE id = ?', [alertId]);
  if (!alert) {
    throw new Error('预警不存在');
  }

  if (alert.status === 'resolved' || alert.status === 'approved') {
    throw new Error('预警已处理完成');
  }

  const steps = queryAll(
    db,
    'SELECT * FROM approval_steps WHERE alert_id = ? ORDER BY step_order',
    [alertId]
  );

  const currentIdx = alert.current_step_index || 0;
  const currentStep = steps[currentIdx];

  if (!currentStep) {
    throw new Error('已完成所有审批步骤');
  }

  if (currentStep.approved === 1) {
    throw new Error('当前步骤已审批');
  }

  const roleMap: Record<string, string> = {
    operation: 'enterprise',
    director: 'region',
    head: 'hq'
  };

  if (roleMap[currentStep.role] !== role) {
    throw new Error(`当前步骤需要${currentStep.role_name}角色审批`);
  }

  const now = new Date().toISOString();
  exec(
    db,
    `UPDATE approval_steps
     SET approved = 1, approver_name = ?, comment = ?, approved_at = ?
     WHERE id = ?`,
    [approverName, comment, now, currentStep.id]
  );

  const nextIdx = currentIdx + 1;
  if (nextIdx >= steps.length) {
    exec(
      db,
      'UPDATE alerts SET status = ?, current_step_index = ?, resolved_at = ? WHERE id = ?',
      ['approved', nextIdx, now, alertId]
    );
  } else {
    exec(
      db,
      'UPDATE alerts SET status = ?, current_step_index = ? WHERE id = ?',
      ['processing', nextIdx, alertId]
    );
  }

  return getAlertsFromDb(db).find(a => a.id === alertId) || null;
}

export function escalateAlert(db: Database, alertId: string) {
  const alert = queryOne(db, 'SELECT * FROM alerts WHERE id = ?', [alertId]);
  if (!alert) {
    throw new Error('预警不存在');
  }

  if (alert.level >= 2) {
    throw new Error('预警已是最高级别');
  }

  exec(
    db,
    'UPDATE alerts SET level = ?, status = ? WHERE id = ?',
    [2, 'processing', alertId]
  );

  return getAlertsFromDb(db).find(a => a.id === alertId) || null;
}

export function resolveAlert(db: Database, alertId: string) {
  const alert = queryOne(db, 'SELECT * FROM alerts WHERE id = ?', [alertId]);
  if (!alert) {
    throw new Error('预警不存在');
  }

  const now = new Date().toISOString();
  exec(
    db,
    'UPDATE alerts SET status = ?, resolved_at = ? WHERE id = ?',
    ['resolved', now, alertId]
  );

  return getAlertsFromDb(db).find(a => a.id === alertId) || null;
}

export function getAlertCounts(db: Database) {
  const rows = queryAll(
    db,
    `SELECT status, COUNT(*) as count FROM alerts GROUP BY status`
  );

  const result: Record<string, number> = {
    pending: 0,
    processing: 0,
    approved: 0,
    resolved: 0,
    total: 0
  };

  for (const row of rows) {
    result[row.status] = row.count;
    result.total += row.count;
  }

  return result;
}
