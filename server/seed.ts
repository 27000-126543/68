import { getDb, exec, queryOne, hasData } from './db';
import { fileURLToPath } from 'url';
import path from 'path';

const INDUSTRIES = [
  '互联网/IT',
  '金融',
  '制造业',
  '教育/培训',
  '医疗/健康',
  '房地产/建筑',
  '消费品/零售',
  '汽车/新能源',
  '文化传媒',
  '物流/供应链'
];

const PROVINCES = [
  { name: '北京', cities: ['北京'] },
  { name: '上海', cities: ['上海'] },
  { name: '广东', cities: ['广州', '深圳', '东莞', '佛山'] },
  { name: '浙江', cities: ['杭州', '宁波', '温州'] },
  { name: '江苏', cities: ['南京', '苏州', '无锡', '常州'] },
  { name: '四川', cities: ['成都', '绵阳'] },
  { name: '湖北', cities: ['武汉', '宜昌'] },
  { name: '陕西', cities: ['西安'] },
  { name: '福建', cities: ['福州', '厦门', '泉州'] },
  { name: '山东', cities: ['济南', '青岛', '烟台'] },
  { name: '湖南', cities: ['长沙'] },
  { name: '河南', cities: ['郑州', '洛阳'] },
  { name: '安徽', cities: ['合肥'] },
  { name: '重庆', cities: ['重庆'] },
  { name: '天津', cities: ['天津'] },
  { name: '辽宁', cities: ['沈阳', '大连'] },
  { name: '河北', cities: ['石家庄', '保定'] },
  { name: '江西', cities: ['南昌'] },
  { name: '云南', cities: ['昆明'] },
  { name: '山西', cities: ['太原'] },
  { name: '广西', cities: ['南宁'] },
  { name: '贵州', cities: ['贵阳'] },
  { name: '黑龙江', cities: ['哈尔滨'] },
  { name: '吉林', cities: ['长春'] },
  { name: '内蒙古', cities: ['呼和浩特'] },
  { name: '新疆', cities: ['乌鲁木齐'] },
  { name: '甘肃', cities: ['兰州'] },
  { name: '海南', cities: ['海口', '三亚'] },
  { name: '宁夏', cities: ['银川'] },
  { name: '青海', cities: ['西宁'] },
  { name: '西藏', cities: ['拉萨'] }
];

const EDUCATIONS = ['博士', '硕士', '本科', '大专', '高中及以下'];
const EXPERIENCES = ['应届生', '1-3年', '3-5年', '5-10年', '10年以上'];
const JOB_TITLES = [
  'Java开发工程师',
  '前端开发工程师',
  'Python开发工程师',
  '算法工程师',
  '数据分析师',
  '产品经理',
  'UI设计师',
  '运营经理',
  '市场营销',
  '人力资源专员',
  '财务分析师',
  '销售经理',
  '客户成功经理',
  '测试工程师',
  'DevOps工程师'
];

const ENTERPRISES = [
  { id: 'e1', name: '字节跳动', region: 'north', cities: ['北京', '上海', '深圳', '杭州'] },
  { id: 'e2', name: '阿里巴巴', region: 'east', cities: ['杭州', '北京', '上海', '深圳', '成都'] },
  { id: 'e3', name: '腾讯科技', region: 'south', cities: ['深圳', '北京', '上海', '广州', '成都'] },
  { id: 'e4', name: '美团点评', region: 'north', cities: ['北京', '上海', '深圳'] },
  { id: 'e5', name: '京东集团', region: 'north', cities: ['北京', '上海', '深圳', '成都'] },
  { id: 'e6', name: '百度', region: 'north', cities: ['北京', '上海', '深圳'] },
  { id: 'e7', name: '网易', region: 'east', cities: ['杭州', '广州', '北京', '上海'] },
  { id: 'e8', name: '小米科技', region: 'north', cities: ['北京', '深圳', '南京'] }
];

const UNIVERSITIES = [
  { name: '清华大学', city: '北京', province: '北京', majors: ['计算机科学与技术', '软件工程', '电子信息', '自动化', '经济管理'], tier: 'top' },
  { name: '北京大学', city: '北京', province: '北京', majors: ['计算机科学与技术', '软件工程', '数学', '金融学', '工商管理'], tier: 'top' },
  { name: '复旦大学', city: '上海', province: '上海', majors: ['计算机科学与技术', '软件工程', '金融学', '新闻传播', '工商管理'], tier: 'top' },
  { name: '上海交通大学', city: '上海', province: '上海', majors: ['计算机科学与技术', '软件工程', '电子信息', '机械工程', '经济管理'], tier: 'top' },
  { name: '浙江大学', city: '杭州', province: '浙江', majors: ['计算机科学与技术', '软件工程', '电子信息', '机械工程', '工商管理'], tier: 'top' },
  { name: '南京大学', city: '南京', province: '江苏', majors: ['计算机科学与技术', '软件工程', '数学', '金融学', '工商管理'], tier: '985' },
  { name: '中国科学技术大学', city: '合肥', province: '安徽', majors: ['计算机科学与技术', '软件工程', '数学', '物理', '电子信息'], tier: 'top' },
  { name: '武汉大学', city: '武汉', province: '湖北', majors: ['计算机科学与技术', '软件工程', '金融学', '法学', '新闻传播'], tier: '985' },
  { name: '华中科技大学', city: '武汉', province: '湖北', majors: ['计算机科学与技术', '软件工程', '电子信息', '机械工程', '医学'], tier: '985' },
  { name: '西安交通大学', city: '西安', province: '陕西', majors: ['计算机科学与技术', '软件工程', '电子信息', '机械工程', '工商管理'], tier: '985' },
  { name: '哈尔滨工业大学', city: '哈尔滨', province: '黑龙江', majors: ['计算机科学与技术', '软件工程', '电子信息', '机械工程', '土木工程'], tier: '985' },
  { name: '中山大学', city: '广州', province: '广东', majors: ['计算机科学与技术', '软件工程', '金融学', '医学', '工商管理'], tier: '985' },
  { name: '华南理工大学', city: '广州', province: '广东', majors: ['计算机科学与技术', '软件工程', '电子信息', '化学工程', '材料科学'], tier: '985' },
  { name: '四川大学', city: '成都', province: '四川', majors: ['计算机科学与技术', '软件工程', '医学', '金融学', '工商管理'], tier: '985' },
  { name: '同济大学', city: '上海', province: '上海', majors: ['计算机科学与技术', '软件工程', '土木工程', '建筑学', '车辆工程'], tier: '985' },
  { name: '北京航空航天大学', city: '北京', province: '北京', majors: ['计算机科学与技术', '软件工程', '电子信息', '航空航天工程', '自动化'], tier: '985' },
  { name: '东南大学', city: '南京', province: '江苏', majors: ['计算机科学与技术', '软件工程', '电子信息', '建筑学', '土木工程'], tier: '985' },
  { name: '厦门大学', city: '厦门', province: '福建', majors: ['计算机科学与技术', '软件工程', '金融学', '会计', '工商管理'], tier: '985' },
  { name: '北京邮电大学', city: '北京', province: '北京', majors: ['计算机科学与技术', '软件工程', '电子信息', '通信工程', '信息安全'], tier: '211' },
  { name: '电子科技大学', city: '成都', province: '四川', majors: ['计算机科学与技术', '软件工程', '电子信息', '通信工程', '自动化'], tier: '985' }
];

const CANDIDATE_NAMES = [
  '张伟', '王芳', '李娜', '刘洋', '陈静', '杨帆', '赵磊', '黄丽', '周杰', '吴敏',
  '徐强', '孙丽', '胡军', '朱琳', '高翔', '林燕', '何勇', '郭雪', '马涛', '罗敏',
  '梁辉', '宋佳', '郑凯', '谢婷', '唐杰', '韩雪', '曹磊', '许娜', '邓勇', '冯丽'
];

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};
const pick = <T>(arr: T[], seed: number): T => arr[Math.floor(seededRandom(seed) * arr.length)];
const randInt = (min: number, max: number, seed: number) => Math.floor(seededRandom(seed) * (max - min + 1)) + min;
const randFloat = (min: number, max: number, seed: number) => seededRandom(seed) * (max - min) + min;

const formatDate = (d: Date) => d.toISOString().split('T')[0];
const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };

function generateDailyMetrics(db: any) {
  console.log('Generating daily_metrics...');
  for (let d = 29; d >= 0; d--) {
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
          exec(
            db,
            `INSERT INTO daily_metrics (date, industry, city, province, applications, matched_applications, interviews, offers, accepted_offers, onboardings, retained_onboardings)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              date, ind, city, prov.name,
              apps,
              Math.floor(apps * randFloat(0.35, 0.65, seed + 1)),
              Math.floor(apps * randFloat(0.15, 0.35, seed + 2)),
              Math.floor(apps * randFloat(0.08, 0.2, seed + 3)),
              Math.floor(apps * randFloat(0.05, 0.15, seed + 4)),
              Math.floor(apps * randFloat(0.04, 0.12, seed + 5)),
              Math.floor(apps * randFloat(0.03, 0.1, seed + 6))
            ]
          );
        });
      });
    });
  }
  console.log('daily_metrics generated');
}

function generateJobs(db: any, count: number = 100) {
  console.log('Generating jobs...');
  for (let i = 0; i < count; i++) {
    const province = pick(PROVINCES, i * 7 + 1);
    const city = pick(province.cities, i * 11 + 3);
    const ent = pick(ENTERPRISES, i * 13 + 5);
    exec(
      db,
      `INSERT INTO jobs (id, title, industry, city, province, education, experience, salary_min, salary_max, enterprise_id, enterprise_name, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `job_${i + 1}`,
        pick(JOB_TITLES, i * 3 + 2),
        pick(INDUSTRIES, i * 5 + 1),
        city,
        province.name,
        pick(EDUCATIONS, i * 17 + 2),
        pick(EXPERIENCES, i * 19 + 4),
        randInt(8, 40, i * 23) * 1000,
        randInt(20, 80, i * 29) * 1000,
        ent.id,
        ent.name,
        formatDate(daysAgo(randInt(0, 60, i * 31)))
      ]
    );
  }
  console.log(`${count} jobs generated`);
}

function generateApplicationsAndRelated(db: any, appCount: number = 500) {
  console.log('Generating applications, interviews, offers, onboardings...');
  for (let i = 0; i < appCount; i++) {
    const jobId = `job_${randInt(1, 100, i * 3)}`;
    const appliedDaysAgo = randInt(0, 30, i * 7);
    const isMatched = seededRandom(i * 5 + 1) > 0.4;
    const appId = `app_${i + 1}`;

    exec(
      db,
      `INSERT INTO applications (id, job_id, candidate_name, education, experience_years, is_matched, applied_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        appId,
        jobId,
        pick(CANDIDATE_NAMES, i),
        pick(EDUCATIONS, i * 11),
        randFloat(0, 15, i * 13),
        isMatched ? 1 : 0,
        formatDate(daysAgo(appliedDaysAgo))
      ]
    );

    if (isMatched && seededRandom(i * 17 + 2) > 0.3) {
      const interviewId = `int_${i + 1}`;
      const conducted = seededRandom(i * 19 + 3) > 0.25;
      exec(
        db,
        `INSERT INTO interviews (id, application_id, invited_at, conducted)
         VALUES (?, ?, ?, ?)`,
        [
          interviewId,
          appId,
          formatDate(daysAgo(appliedDaysAgo + randInt(1, 5, i * 23))),
          conducted ? 1 : 0
        ]
      );

      if (conducted && seededRandom(i * 29 + 4) > 0.35) {
        const offerId = `offer_${i + 1}`;
        const accepted = seededRandom(i * 31 + 5) > 0.3;
        exec(
          db,
          `INSERT INTO offers (id, interview_id, sent_at, accepted)
           VALUES (?, ?, ?, ?)`,
          [
            offerId,
            interviewId,
            formatDate(daysAgo(appliedDaysAgo + randInt(5, 10, i * 37))),
            accepted ? 1 : 0
          ]
        );

        if (accepted) {
          const onboarded = seededRandom(i * 41 + 6) > 0.15;
          if (onboarded) {
            exec(
              db,
              `INSERT INTO onboardings (id, offer_id, onboarded_at, retained_3months)
               VALUES (?, ?, ?, ?)`,
              [
                `onb_${i + 1}`,
                offerId,
                formatDate(daysAgo(appliedDaysAgo + randInt(10, 20, i * 43))),
                seededRandom(i * 47 + 7) > 0.2 ? 1 : 0
              ]
            );
          }
        }
      }
    }
  }
  console.log(`${appCount} applications generated`);
}

function generateAlerts(db: any) {
  console.log('Generating alerts and approval_steps...');
  const alertData = [
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
      conversionGap: null,
      currentStepIndex: 0,
      improvementDays: 2,
      resolvedAt: null,
      steps: [
        { role: 'operation', roleName: '运营主管', approved: 0, approverName: null, approvedAt: null, comment: null },
        { role: 'director', roleName: '区域总监', approved: 0, approverName: null, approvedAt: null, comment: null },
        { role: 'head', roleName: '总部招聘负责人', approved: 0, approverName: null, approvedAt: null, comment: null }
      ]
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
      deliveryDropRate: null,
      conversionGap: -53.5,
      currentStepIndex: 1,
      improvementDays: 1,
      resolvedAt: null,
      steps: [
        { role: 'operation', roleName: '运营主管', approved: 1, approverName: '李明', approvedAt: formatDate(daysAgo(1)) + 'T16:20:00', comment: '已确认数据异常，正在分析原因' },
        { role: 'director', roleName: '区域总监', approved: 0, approverName: null, approvedAt: null, comment: null },
        { role: 'head', roleName: '总部招聘负责人', approved: 0, approverName: null, approvedAt: null, comment: null }
      ]
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
      conversionGap: null,
      currentStepIndex: 2,
      improvementDays: 5,
      resolvedAt: null,
      steps: [
        { role: 'operation', roleName: '运营主管', approved: 1, approverName: '王芳', approvedAt: formatDate(daysAgo(4)) + 'T11:00:00', comment: '已确认行业下行趋势，建议调整JD放宽学历要求' },
        { role: 'director', roleName: '区域总监', approved: 1, approverName: '张强', approvedAt: formatDate(daysAgo(3)) + 'T09:00:00', comment: '同意优化策略，建议增加社招渠道投放' },
        { role: 'head', roleName: '总部招聘负责人', approved: 0, approverName: null, approvedAt: null, comment: null }
      ]
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
      deliveryDropRate: null,
      conversionGap: -25.1,
      currentStepIndex: 3,
      improvementDays: 6,
      resolvedAt: formatDate(daysAgo(4)) + 'T09:30:00',
      steps: [
        { role: 'operation', roleName: '运营主管', approved: 1, approverName: '赵磊', approvedAt: formatDate(daysAgo(6)) + 'T10:00:00', comment: '数据核实无误，建议启动人才画像优化' },
        { role: 'director', roleName: '区域总监', approved: 1, approverName: '陈静', approvedAt: formatDate(daysAgo(5)) + 'T14:00:00', comment: '复核通过，建议联合业务部门重新定义岗位要求' },
        { role: 'head', roleName: '总部招聘负责人', approved: 1, approverName: '刘伟', approvedAt: formatDate(daysAgo(4)) + 'T09:30:00', comment: '批准执行，下周复盘效果' }
      ]
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
      conversionGap: null,
      currentStepIndex: 0,
      improvementDays: 0,
      resolvedAt: null,
      steps: [
        { role: 'operation', roleName: '运营主管', approved: 0, approverName: null, approvedAt: null, comment: null },
        { role: 'director', roleName: '区域总监', approved: 0, approverName: null, approvedAt: null, comment: null },
        { role: 'head', roleName: '总部招聘负责人', approved: 0, approverName: null, approvedAt: null, comment: null }
      ]
    }
  ];

  for (const alert of alertData) {
    exec(
      db,
      `INSERT INTO alerts (id, type, level, industry, region, description, triggered_at, status, delivery_drop_rate, conversion_gap, current_step_index, improvement_days, resolved_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        alert.id, alert.type, alert.level, alert.industry, alert.region,
        alert.description, alert.triggeredAt, alert.status,
        alert.deliveryDropRate, alert.conversionGap,
        alert.currentStepIndex, alert.improvementDays, alert.resolvedAt
      ]
    );

    alert.steps.forEach((step, idx) => {
      exec(
        db,
        `INSERT INTO approval_steps (alert_id, role, role_name, approved, approver_name, approved_at, comment, step_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          alert.id, step.role, step.roleName, step.approved,
          step.approverName, step.approvedAt, step.comment, idx
        ]
      );
    });
  }
  console.log('5 alerts and 15 approval_steps generated');
}

function generateWeeklyReports(db: any) {
  console.log('Generating weekly_reports...');
  const scopes = ['全国', '华北区', '华东区', '华南区'];
  for (let i = 0; i < 8; i++) {
    const seed = i * 97 + 3;
    const ws = daysAgo(i * 7 + 6);
    const we = daysAgo(i * 7);
    const summary = {
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
    };
    const recommendations = {
      channels: ['建议增加BOSS直聘和猎聘渠道投放预算', '优化内部推荐激励政策，提升内推比例'],
      talentProfile: ['重点关注本科及以上学历、3-5年工作经验候选人', '拓展理工科背景候选人来源'],
      strategies: ['优化职位描述关键词，提升搜索匹配度', '缩短面试流程，减少候选人等待时间']
    };

    exec(
      db,
      `INSERT INTO weekly_reports (id, week_start, week_end, generated_at, scope, summary_json, recommendations_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        `report_${i + 1}`,
        formatDate(ws),
        formatDate(we),
        formatDate(we) + 'T18:00:00',
        pick(scopes, seed),
        JSON.stringify(summary),
        JSON.stringify(recommendations)
      ]
    );
  }
  console.log('8 weekly_reports generated');
}

function generatePermissionUsers(db: any) {
  console.log('Generating permission_users...');
  const users = [
    { id: 'u1', name: '刘伟', email: 'liuwei@company.com', role: 'hq', roleName: '总部招聘负责人', scope: '全国', status: 'active', createdAt: '2024-01-15' },
    { id: 'u2', name: '陈静', email: 'chenjing@company.com', role: 'region', roleName: '区域招聘总监', scope: '华东区', status: 'active', createdAt: '2024-02-20' },
    { id: 'u3', name: '张强', email: 'zhangqiang@company.com', role: 'region', roleName: '区域招聘总监', scope: '华南区', status: 'active', createdAt: '2024-02-25' },
    { id: 'u4', name: '李明', email: 'liming@company.com', role: 'region', roleName: '区域招聘总监', scope: '华北区', status: 'active', createdAt: '2024-03-01' },
    { id: 'u5', name: '王芳', email: 'wangfang@company.com', role: 'enterprise', roleName: '企业招聘运营', scope: '字节跳动', status: 'active', createdAt: '2024-03-10' },
    { id: 'u6', name: '赵磊', email: 'zhaolei@company.com', role: 'enterprise', roleName: '企业招聘运营', scope: '阿里巴巴', status: 'active', createdAt: '2024-03-12' },
    { id: 'u7', name: '周杰', email: 'zhoujie@company.com', role: 'region', roleName: '区域招聘总监', scope: '西南区', status: 'active', createdAt: '2024-04-01' },
    { id: 'u8', name: '孙丽', email: 'sunli@company.com', role: 'enterprise', roleName: '企业招聘运营', scope: '腾讯科技', status: 'inactive', createdAt: '2024-04-15' }
  ];

  for (const u of users) {
    exec(
      db,
      `INSERT INTO permission_users (id, name, email, role, role_name, scope, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [u.id, u.name, u.email, u.role, u.roleName, u.scope, u.status, u.createdAt]
    );
  }
  console.log('8 permission_users generated');
}

function generateDefaultUsers(db: any) {
  console.log('Generating users...');
  const users = [
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

  for (const u of users) {
    exec(
      db,
      `INSERT INTO users (id, name, email, role, scope_json)
       VALUES (?, ?, ?, ?, ?)`,
      [u.id, u.name, u.email, u.role, JSON.stringify(u.scope)]
    );
  }
  console.log('3 users generated');
}

export async function runSeed() {
  const db = await getDb();

  if (hasData(db, 'daily_metrics')) {
    console.log('Database already has data, skipping seed.');
    return;
  }

  console.log('Starting database seed...');

  generateDailyMetrics(db);
  generateJobs(db, 100);
  generateApplicationsAndRelated(db, 500);
  generateAlerts(db);
  generateWeeklyReports(db);
  generatePermissionUsers(db);
  generateDefaultUsers(db);

  console.log('Seed completed successfully!');
}

const isMain = () => {
  try {
    return process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
  } catch {
    return false;
  }
};

if (isMain()) {
  runSeed().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}


