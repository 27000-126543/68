import { INDUSTRIES, PROVINCES, EDUCATIONS, EXPERIENCES, JOB_TITLES, ENTERPRISES, UNIVERSITIES, REGIONS } from './constants';
import type {
  JobPost, Application, Interview, Offer, Onboarding,
  DailyMetric, Alert, ProvinceData, HotJob, TrendPoint,
  DistributionData, GapForecast, UniversityRecommendation,
  WeeklyReport, PermissionUser, User
} from '../types';

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const pick = <T>(arr: T[], seed: number): T => arr[Math.floor(seededRandom(seed) * arr.length)];
const randInt = (min: number, max: number, seed: number) => Math.floor(seededRandom(seed) * (max - min + 1)) + min;
const randFloat = (min: number, max: number, seed: number) => seededRandom(seed) * (max - min) + min;

const formatDate = (d: Date) => d.toISOString().split('T')[0];
const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };

export function generateMockJobs(count: number = 500): JobPost[] {
  const jobs: JobPost[] = [];
  for (let i = 0; i < count; i++) {
    const province = pick(PROVINCES, i * 7 + 1);
    const city = pick(province.cities, i * 11 + 3);
    const ent = pick(ENTERPRISES, i * 13 + 5);
    jobs.push({
      id: `job_${i + 1}`,
      title: pick(JOB_TITLES, i * 3 + 2),
      industry: pick(INDUSTRIES, i * 5 + 1),
      city: city,
      province: province.name,
      education: pick(EDUCATIONS, i * 17 + 2),
      experience: pick(EXPERIENCES, i * 19 + 4),
      salaryMin: randInt(8, 40, i * 23) * 1000,
      salaryMax: randInt(20, 80, i * 29) * 1000,
      enterpriseId: ent.id,
      enterpriseName: ent.name,
      publishedAt: formatDate(daysAgo(randInt(0, 60, i * 31)))
    });
  }
  return jobs;
}

export function generateDailyMetrics(days: number = 30): DailyMetric[] {
  const metrics: DailyMetric[] = [];
  for (let d = days - 1; d >= 0; d--) {
    const date = formatDate(daysAgo(d));
    PROVINCES.forEach((prov, pi) => {
      prov.cities.forEach((city, ci) => {
        INDUSTRIES.forEach((ind, ii) => {
          const seed = d * 1000 + pi * 100 + ci * 10 + ii;
          const baseApplications = Math.floor(
            (ind.includes('互联网') ? 120 : ind.includes('金融') ? 80 : 50)
            * (['北京', '上海', '广东', '浙江', '江苏'].includes(prov.name) ? 1.5 : 0.6)
            * (d < 3 ? 1 : 0.85 + seededRandom(seed) * 0.3)
          );
          const apps = Math.max(5, baseApplications + randInt(-20, 30, seed));
          metrics.push({
            date,
            industry: ind,
            city,
            province: prov.name,
            applications: apps,
            matchedApplications: Math.floor(apps * randFloat(0.35, 0.65, seed + 1)),
            interviews: Math.floor(apps * randFloat(0.15, 0.35, seed + 2)),
            offers: Math.floor(apps * randFloat(0.08, 0.2, seed + 3)),
            acceptedOffers: Math.floor(apps * randFloat(0.05, 0.15, seed + 4)),
            onboardings: Math.floor(apps * randFloat(0.04, 0.12, seed + 5)),
            retainedOnboardings: Math.floor(apps * randFloat(0.03, 0.1, seed + 6))
          });
        });
      });
    });
  }
  return metrics;
}

export function generateProvinceDeliveryData(): ProvinceData[] {
  return PROVINCES.map((prov, i) => {
    const seed = i * 47 + 11;
    const multiplier = ['北京', '上海', '广东'].includes(prov.name) ? 3 :
      ['浙江', '江苏', '四川', '湖北', '福建', '山东'].includes(prov.name) ? 2 : 1;
    const base = randInt(800, 5000, seed) * multiplier;
    return {
      name: prov.name,
      value: base,
      cities: prov.cities.map((c, ci) => ({
        name: c,
        value: Math.floor(base / prov.cities.length * randFloat(0.7, 1.3, seed + ci))
      }))
    };
  });
}

export function generateHotJobs(count: number = 10): HotJob[] {
  const used = new Set<string>();
  const jobs: HotJob[] = [];
  for (let i = 0; i < count; i++) {
    const seed = i * 53 + 7;
    let title = pick(JOB_TITLES, seed);
    while (used.has(title)) { title = pick(JOB_TITLES, seed + i); }
    used.add(title);
    const prov = pick(PROVINCES.filter(p => p.cities.length > 0), seed + 1);
    jobs.push({
      rank: i + 1,
      title,
      industry: pick(INDUSTRIES, seed + 2),
      city: pick(prov.cities, seed + 3),
      applications: randInt(500, 5000, seed + 4),
      trend: randFloat(-25, 35, seed + 5)
    });
  }
  return jobs.sort((a, b) => b.applications - a.applications).map((j, i) => ({ ...j, rank: i + 1 }));
}

export function generateTrendData(city?: string): TrendPoint[] {
  const industries = ['互联网/IT', '金融', '制造业', '教育/培训', '医疗/健康'];
  const points: TrendPoint[] = [];
  for (let d = 6; d >= 0; d--) {
    const date = formatDate(daysAgo(d));
    const pt: TrendPoint = { date };
    industries.forEach((ind, i) => {
      const seed = d * 100 + i * 7 + (city ? city.length : 0);
      const cityFactor = city ? 0.3 : 1;
      pt[ind] = Math.floor(
        randInt(200, 800, seed) * cityFactor
        * (i === 0 ? 2 : i === 1 ? 1.2 : 1)
        * (1 + Math.sin((d + i) / 2) * 0.2)
      );
    });
    points.push(pt);
  }
  return points;
}

export function generateEducationDistribution(city?: string): DistributionData[] {
  const factor = city ? 0.7 : 1;
  return [
    { name: '博士', value: Math.floor(3 * factor) },
    { name: '硕士', value: Math.floor(18 * factor) },
    { name: '本科', value: Math.floor(52 * factor) },
    { name: '大专', value: Math.floor(22 * factor) },
    { name: '高中及以下', value: Math.floor(5 * factor) }
  ];
}

export function generateExperienceDistribution(city?: string): DistributionData[] {
  const factor = city ? 0.7 : 1;
  return [
    { name: '应届生', value: Math.floor(15 * factor) },
    { name: '1-3年', value: Math.floor(30 * factor) },
    { name: '3-5年', value: Math.floor(28 * factor) },
    { name: '5-10年', value: Math.floor(18 * factor) },
    { name: '10年以上', value: Math.floor(9 * factor) }
  ];
}

export function generateAlerts(): Alert[] {
  return [
    {
      id: 'alert_001',
      type: 'delivery_drop',
      level: 1,
      industry: '教育/培训',
      region: '华东',
      description: '教培行业连续3天投递量环比下降35.2%，请关注市场变化并及时调整职位推广策略。',
      triggeredAt: formatDate(daysAgo(2)) + 'T09:30:00',
      status: 'pending',
      deliveryDropRate: 35.2,
      approvalSteps: [
        { role: 'operation', roleName: '运营主管', approved: false },
        { role: 'director', roleName: '区域总监', approved: false },
        { role: 'head', roleName: '总部招聘负责人', approved: false }
      ],
      currentStepIndex: 0,
      improvementDays: 2
    },
    {
      id: 'alert_002',
      type: 'conversion_low',
      level: 1,
      industry: '房地产/建筑',
      region: '华北',
      description: '房地产行业面试转化率为8.5%，低于行业均值（18.3%）的53.5%，请优化简历筛选标准。',
      triggeredAt: formatDate(daysAgo(1)) + 'T14:15:00',
      status: 'processing',
      conversionGap: -53.5,
      approvalSteps: [
        { role: 'operation', roleName: '运营主管', approved: true, approverName: '李明', approvedAt: formatDate(daysAgo(1)) + 'T16:20:00', comment: '已确认数据异常，正在分析原因' },
        { role: 'director', roleName: '区域总监', approved: false },
        { role: 'head', roleName: '总部招聘负责人', approved: false }
      ],
      currentStepIndex: 1,
      improvementDays: 1
    },
    {
      id: 'alert_003',
      type: 'delivery_drop',
      level: 2,
      industry: '文化传媒',
      region: '华南',
      description: '文化传媒行业连续5天投递量持续下降，累计降幅达42.8%，已升级为二级预警，请启动三级审批流程。',
      triggeredAt: formatDate(daysAgo(5)) + 'T10:00:00',
      status: 'processing',
      deliveryDropRate: 42.8,
      approvalSteps: [
        { role: 'operation', roleName: '运营主管', approved: true, approverName: '王芳', approvedAt: formatDate(daysAgo(4)) + 'T11:00:00', comment: '已确认行业下行趋势，建议调整JD放宽学历要求' },
        { role: 'director', roleName: '区域总监', approved: true, approverName: '张强', approvedAt: formatDate(daysAgo(3)) + 'T09:00:00', comment: '同意优化策略，建议增加社招渠道投放' },
        { role: 'head', roleName: '总部招聘负责人', approved: false }
      ],
      currentStepIndex: 2,
      improvementDays: 5
    },
    {
      id: 'alert_004',
      type: 'conversion_low',
      level: 2,
      industry: '消费品/零售',
      region: '华中',
      description: '消费品零售行业面试转化率长期低迷（6.2%），低于行业均值25.1个百分点，请重点关注候选人画像匹配问题。',
      triggeredAt: formatDate(daysAgo(6)) + 'T08:45:00',
      status: 'approved',
      conversionGap: -25.1,
      approvalSteps: [
        { role: 'operation', roleName: '运营主管', approved: true, approverName: '赵磊', approvedAt: formatDate(daysAgo(6)) + 'T10:00:00', comment: '数据核实无误，建议启动人才画像优化' },
        { role: 'director', roleName: '区域总监', approved: true, approverName: '陈静', approvedAt: formatDate(daysAgo(5)) + 'T14:00:00', comment: '复核通过，建议联合业务部门重新定义岗位要求' },
        { role: 'head', roleName: '总部招聘负责人', approved: true, approverName: '刘伟', approvedAt: formatDate(daysAgo(4)) + 'T09:30:00', comment: '批准执行，下周复盘效果' }
      ],
      currentStepIndex: 3,
      resolvedAt: formatDate(daysAgo(4)) + 'T09:30:00',
      improvementDays: 6
    },
    {
      id: 'alert_005',
      type: 'delivery_drop',
      level: 1,
      industry: '物流/供应链',
      region: '西南',
      description: '物流供应链行业连续3天投递量下降31.8%，建议检查招聘渠道有效性。',
      triggeredAt: formatDate(daysAgo(0)) + 'T08:00:00',
      status: 'pending',
      deliveryDropRate: 31.8,
      approvalSteps: [
        { role: 'operation', roleName: '运营主管', approved: false },
        { role: 'director', roleName: '区域总监', approved: false },
        { role: 'head', roleName: '总部招聘负责人', approved: false }
      ],
      currentStepIndex: 0,
      improvementDays: 0
    }
  ];
}

export function generateWeeklyReports(count: number = 8): WeeklyReport[] {
  const reports: WeeklyReport[] = [];
  const scopes = ['全国', '华北区', '华东区', '华南区'];
  for (let i = 0; i < count; i++) {
    const seed = i * 97 + 3;
    const ws = daysAgo(i * 7 + 6);
    const we = daysAgo(i * 7);
    reports.push({
      id: `report_${i + 1}`,
      weekStart: formatDate(ws),
      weekEnd: formatDate(we),
      generatedAt: formatDate(we) + 'T18:00:00',
      scope: pick(scopes, seed),
      summary: {
        totalApplications: randInt(50000, 200000, seed),
        applicationsYoy: randFloat(-5, 20, seed + 1),
        applicationsWow: randFloat(-10, 15, seed + 2),
        matchRate: randFloat(45, 60, seed + 3),
        matchRateWow: randFloat(-3, 5, seed + 4),
        interviewConversionRate: randFloat(20, 35, seed + 5),
        interviewConversionWow: randFloat(-5, 8, seed + 6),
        offerAcceptanceRate: randFloat(55, 75, seed + 7),
        offerAcceptanceWow: randFloat(-4, 6, seed + 8),
        retentionRate: randFloat(70, 88, seed + 9),
        retentionWow: randFloat(-2, 4, seed + 10),
        avgInterviewDays: randFloat(3, 8, seed + 11)
      },
      recommendations: {
        channels: ['建议增加BOSS直聘和猎聘渠道投放预算', '优化内部推荐激励政策，提升内推比例'],
        talentProfile: ['重点关注本科及以上学历、3-5年工作经验候选人', '拓展理工科背景候选人来源'],
        strategies: ['优化职位描述关键词，提升搜索匹配度', '缩短面试流程，减少候选人等待时间']
      }
    });
  }
  return reports;
}

export function generatePermissionUsers(): PermissionUser[] {
  return [
    { id: 'u1', name: '刘伟', email: 'liuwei@company.com', role: 'hq', roleName: '总部招聘负责人', scope: '全国', status: 'active', createdAt: '2024-01-15' },
    { id: 'u2', name: '陈静', email: 'chenjing@company.com', role: 'region', roleName: '区域招聘总监', scope: '华东区', status: 'active', createdAt: '2024-02-20' },
    { id: 'u3', name: '张强', email: 'zhangqiang@company.com', role: 'region', roleName: '区域招聘总监', scope: '华南区', status: 'active', createdAt: '2024-02-25' },
    { id: 'u4', name: '李明', email: 'liming@company.com', role: 'region', roleName: '区域招聘总监', scope: '华北区', status: 'active', createdAt: '2024-03-01' },
    { id: 'u5', name: '王芳', email: 'wangfang@company.com', role: 'enterprise', roleName: '企业招聘运营', scope: '字节跳动', status: 'active', createdAt: '2024-03-10' },
    { id: 'u6', name: '赵磊', email: 'zhaolei@company.com', role: 'enterprise', roleName: '企业招聘运营', scope: '阿里巴巴', status: 'active', createdAt: '2024-03-12' },
    { id: 'u7', name: '周杰', email: 'zhoujie@company.com', role: 'region', roleName: '区域招聘总监', scope: '西南区', status: 'active', createdAt: '2024-04-01' },
    { id: 'u8', name: '孙丽', email: 'sunli@company.com', role: 'enterprise', roleName: '企业招聘运营', scope: '腾讯科技', status: 'inactive', createdAt: '2024-04-15' }
  ];
}

export function generateDefaultUsers(): User[] {
  return [
    {
      id: 'hq_user',
      name: '刘伟（总部）',
      email: 'hq@test.com',
      role: 'hq',
      scope: {}
    },
    {
      id: 'region_user',
      name: '陈静（华东区）',
      email: 'region@test.com',
      role: 'region',
      scope: { regions: ['华东'] }
    },
    {
      id: 'ent_user',
      name: '王芳（字节跳动）',
      email: 'ent@test.com',
      role: 'enterprise',
      scope: { enterprises: ['字节跳动'] }
    }
  ];
}

export function generateGapForecasts(positions: { name: string; headcount: number; city: string }[]): GapForecast[] {
  const forecasts: GapForecast[] = [];
  const months = ['2026-07', '2026-08', '2026-09'];
  positions.forEach((p, pi) => {
    months.forEach((m, mi) => {
      const seed = pi * 100 + mi;
      const seasonFactor = mi === 0 ? 1.2 : mi === 1 ? 1.0 : 0.8;
      const predicted = Math.floor(p.headcount / 3 * seasonFactor * randFloat(0.5, 0.9, seed));
      forecasts.push({
        month: m,
        position: p.name,
        headcount: Math.ceil(p.headcount / 3),
        predictedSupply: predicted,
        gap: Math.ceil(p.headcount / 3) - predicted
      });
    });
  });
  return forecasts;
}

export function generateUniversityRecommendations(cities: string[]): UniversityRecommendation[] {
  const unis = UNIVERSITIES.filter(u =>
    cities.length === 0 || cities.includes(u.city) || cities.length < 3
  );
  return unis.slice(0, 15).map((u, i) => ({
    rank: i + 1,
    name: u.name,
    city: u.city,
    province: u.province,
    majors: u.majors.slice(0, 3),
    matchScore: Math.floor(randFloat(70, 98, i * 13 + 5)),
    expectedGraduates: randInt(500, 5000, i * 17 + 3),
    cooperationHistory: pick(['深度合作', '常规合作', '首次推荐'], i * 7 + 2)
  })).sort((a, b) => b.matchScore - a.matchScore).map((u, i) => ({ ...u, rank: i + 1 }));
}

export function getRegionByProvince(province: string): string | undefined {
  return REGIONS.find(r => r.provinces.includes(province))?.name;
}
