import { Router, Request, Response } from 'express';
import { getDb, queryAll, queryOne, exec } from '../db';
import metricsRouter from './metrics';
import alertsRouter from './alerts';

const router = Router();

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};
const pick = <T>(arr: T[], seed: number): T => arr[Math.floor(seededRandom(seed) * arr.length)];
const randInt = (min: number, max: number, seed: number) => Math.floor(seededRandom(seed) * (max - min + 1)) + min;
const randFloat = (min: number, max: number, seed: number) => seededRandom(seed) * (max - min) + min;

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

router.use('/metrics', metricsRouter);
router.use('/alerts', alertsRouter);

router.get('/reports', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const rows = queryAll(db, 'SELECT * FROM weekly_reports ORDER BY week_end DESC');
    const reports = rows.map(r => ({
      id: r.id,
      weekStart: r.week_start,
      weekEnd: r.week_end,
      generatedAt: r.generated_at,
      scope: r.scope,
      summary: JSON.parse(r.summary_json || '{}'),
      recommendations: JSON.parse(r.recommendations_json || '{}')
    }));
    res.json({ success: true, data: reports });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/reports/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const row = queryOne(db, 'SELECT * FROM weekly_reports WHERE id = ?', [req.params.id]);
    if (!row) {
      return res.status(404).json({ success: false, error: '报告不存在' });
    }
    const report = {
      id: row.id,
      weekStart: row.week_start,
      weekEnd: row.week_end,
      generatedAt: row.generated_at,
      scope: row.scope,
      summary: JSON.parse(row.summary_json || '{}'),
      recommendations: JSON.parse(row.recommendations_json || '{}')
    };
    res.json({ success: true, data: report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/permissions/users', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const rows = queryAll(db, 'SELECT * FROM permission_users ORDER BY created_at DESC');
    const users = rows.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role,
      roleName: r.role_name,
      scope: r.scope,
      status: r.status,
      createdAt: r.created_at
    }));
    res.json({ success: true, data: users });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/campus/forecast', async (req: Request, res: Response) => {
  try {
    const { positions } = req.body;
    if (!positions || !Array.isArray(positions)) {
      return res.status(400).json({ success: false, error: 'positions 必须是数组' });
    }

    const forecasts: any[] = [];
    const now = new Date();

    for (let i = 0; i < 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const seasonFactor = Math.sin((i / 3) * Math.PI * 2) * 0.15 + 1;

      positions.forEach((p: any, pi: number) => {
        const seed = pi * 100 + i;
        const monthlyHeadcount = Math.ceil(p.headcount / 3);
        const baseSupply = monthlyHeadcount * 0.7 * 1.08;
        const adjustedSupply = Math.floor(baseSupply * seasonFactor);
        const gap = Math.max(0, monthlyHeadcount - adjustedSupply);

        forecasts.push({
          month: monthStr,
          position: p.name,
          headcount: monthlyHeadcount,
          predictedSupply: Math.max(0, adjustedSupply),
          gap
        });
      });
    }

    res.json({ success: true, data: forecasts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/campus/recommend-universities', async (req: Request, res: Response) => {
  try {
    const { cities } = req.body;
    const cityArr: string[] = Array.isArray(cities) ? cities : [];

    const unis = UNIVERSITIES.filter(u =>
      cityArr.length === 0 || cityArr.includes(u.city) || cityArr.length < 3
    );

    const result = unis.slice(0, 15).map((u, i) => ({
      rank: i + 1,
      name: u.name,
      city: u.city,
      province: u.province,
      majors: u.majors.slice(0, 3),
      matchScore: Math.floor(randFloat(70, 98, i * 13 + 5)),
      expectedGraduates: randInt(500, 5000, i * 17 + 3),
      cooperationHistory: pick(['深度合作', '常规合作', '首次推荐'], i * 7 + 2)
    })).sort((a, b) => b.matchScore - a.matchScore).map((u, i) => ({ ...u, rank: i + 1 }));

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/users', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const rows = queryAll(db, 'SELECT * FROM users');
    const users = rows.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role,
      scope: JSON.parse(r.scope_json || '{}')
    }));
    res.json({ success: true, data: users });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/jobs', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const rows = queryAll(db, 'SELECT * FROM jobs ORDER BY published_at DESC LIMIT 200');
    const jobs = rows.map(r => ({
      id: r.id,
      title: r.title,
      industry: r.industry,
      city: r.city,
      province: r.province,
      education: r.education,
      experience: r.experience,
      salaryMin: r.salary_min,
      salaryMax: r.salary_max,
      enterpriseId: r.enterprise_id,
      enterpriseName: r.enterprise_name,
      publishedAt: r.published_at
    }));
    res.json({ success: true, data: jobs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/jobs/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const row = queryOne(db, 'SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (!row) {
      return res.status(404).json({ success: false, error: '职位不存在' });
    }
    const job = {
      id: row.id,
      title: row.title,
      industry: row.industry,
      city: row.city,
      province: row.province,
      education: row.education,
      experience: row.experience,
      salaryMin: row.salary_min,
      salaryMax: row.salary_max,
      enterpriseId: row.enterprise_id,
      enterpriseName: row.enterprise_name,
      publishedAt: row.published_at
    };
    res.json({ success: true, data: job });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/applications', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const rows = queryAll(db, 'SELECT * FROM applications ORDER BY applied_at DESC LIMIT 200');
    const apps = rows.map(r => ({
      id: r.id,
      jobId: r.job_id,
      candidateName: r.candidate_name,
      education: r.education,
      experience: r.experience_years,
      isMatched: r.is_matched === 1,
      appliedAt: r.applied_at
    }));
    res.json({ success: true, data: apps });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/interviews', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const rows = queryAll(db, 'SELECT * FROM interviews ORDER BY invited_at DESC LIMIT 200');
    const items = rows.map(r => ({
      id: r.id,
      applicationId: r.application_id,
      invitedAt: r.invited_at,
      conducted: r.conducted === 1
    }));
    res.json({ success: true, data: items });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/offers', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const rows = queryAll(db, 'SELECT * FROM offers ORDER BY sent_at DESC LIMIT 200');
    const items = rows.map(r => ({
      id: r.id,
      interviewId: r.interview_id,
      sentAt: r.sent_at,
      accepted: r.accepted === null ? null : r.accepted === 1
    }));
    res.json({ success: true, data: items });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/onboardings', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const rows = queryAll(db, 'SELECT * FROM onboardings ORDER BY onboarded_at DESC LIMIT 200');
    const items = rows.map(r => ({
      id: r.id,
      offerId: r.offer_id,
      onboardedAt: r.onboarded_at,
      retained3Months: r.retained_3months === null ? null : r.retained_3months === 1
    }));
    res.json({ success: true, data: items });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
