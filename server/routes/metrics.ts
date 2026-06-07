import { Router, Request, Response } from 'express';
import { getDb, queryAll, queryOne } from '../db';
import { calcKpiSummaryFromDb, getDateRange } from '../utils/calculators';

const router = Router();

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

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};
const pick = <T>(arr: T[], seed: number): T => arr[Math.floor(seededRandom(seed) * arr.length)];
const randInt = (min: number, max: number, seed: number) => Math.floor(seededRandom(seed) * (max - min + 1)) + min;
const randFloat = (min: number, max: number, seed: number) => seededRandom(seed) * (max - min) + min;

router.get('/kpi', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { industry, province, city, startDate, endDate } = req.query;

    const filters: any = {};
    if (industry) filters.industry = String(industry);
    if (province) filters.province = String(province);
    if (city) filters.city = String(city);
    if (startDate) filters.startDate = String(startDate);
    if (endDate) filters.endDate = String(endDate);

    if (!filters.startDate && !filters.endDate) {
      const range = getDateRange(7);
      filters.startDate = range.start;
      filters.endDate = range.end;
    }

    const kpi = calcKpiSummaryFromDb(db, filters);
    res.json({ success: true, data: kpi });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/delivery-map', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const rows = queryAll(
      db,
      `SELECT province, city, SUM(applications) as value
       FROM daily_metrics
       GROUP BY province, city`
    );

    const provinceMap = new Map<string, { name: string; value: number; cities: { name: string; value: number }[] }>();

    for (const row of rows) {
      const provName = row.province;
      if (!provinceMap.has(provName)) {
        provinceMap.set(provName, { name: provName, value: 0, cities: [] });
      }
      const prov = provinceMap.get(provName)!;
      prov.value += row.value || 0;
      prov.cities.push({ name: row.city, value: row.value || 0 });
    }

    const result = Array.from(provinceMap.values()).sort((a, b) => b.value - a.value);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/hot-jobs', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const JOB_TITLES = [
      'Java开发工程师', '前端开发工程师', 'Python开发工程师', '算法工程师',
      '数据分析师', '产品经理', 'UI设计师', '运营经理', '市场营销',
      '人力资源专员', '财务分析师', '销售经理', '客户成功经理',
      '测试工程师', 'DevOps工程师'
    ];

    const used = new Set<string>();
    const jobs: any[] = [];
    for (let i = 0; i < 10; i++) {
      const seed = i * 53 + 7;
      let title = pick(JOB_TITLES, seed);
      let attempt = 0;
      while (used.has(title) && attempt < 20) {
        title = pick(JOB_TITLES, seed + attempt);
        attempt++;
      }
      used.add(title);
      const prov = pick(PROVINCES.filter(p => p.cities.length > 0), seed + 1);
      jobs.push({
        title,
        industry: pick(INDUSTRIES, seed + 2),
        city: pick(prov.cities, seed + 3),
        applications: randInt(500, 5000, seed + 4),
        trend: randFloat(-25, 35, seed + 5)
      });
    }
    jobs.sort((a, b) => b.applications - a.applications);
    jobs.forEach((j, i) => { j.rank = i + 1; });

    res.json({ success: true, data: jobs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/trend', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { city } = req.query;
    const cityStr = city ? String(city) : '';

    const industries = ['互联网/IT', '金融', '制造业', '教育/培训', '医疗/健康'];
    const points: any[] = [];

    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };

    for (let d = 6; d >= 0; d--) {
      const date = formatDate(daysAgo(d));
      const pt: any = { date };
      industries.forEach((ind, i) => {
        const seed = d * 100 + i * 7 + (cityStr ? cityStr.length : 0);
        const cityFactor = cityStr ? 0.3 : 1;
        pt[ind] = Math.floor(
          randInt(200, 800, seed) * cityFactor
          * (i === 0 ? 2 : i === 1 ? 1.2 : 1)
          * (1 + Math.sin((d + i) / 2) * 0.2)
        );
      });
      points.push(pt);
    }

    res.json({ success: true, data: points });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/distribution/education', async (req: Request, res: Response) => {
  try {
    const { city } = req.query;
    const factor = city ? 0.7 : 1;
    const data = [
      { name: '博士', value: Math.floor(3 * factor) },
      { name: '硕士', value: Math.floor(18 * factor) },
      { name: '本科', value: Math.floor(52 * factor) },
      { name: '大专', value: Math.floor(22 * factor) },
      { name: '高中及以下', value: Math.floor(5 * factor) }
    ];
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/distribution/experience', async (req: Request, res: Response) => {
  try {
    const { city } = req.query;
    const factor = city ? 0.7 : 1;
    const data = [
      { name: '应届生', value: Math.floor(15 * factor) },
      { name: '1-3年', value: Math.floor(30 * factor) },
      { name: '3-5年', value: Math.floor(28 * factor) },
      { name: '5-10年', value: Math.floor(18 * factor) },
      { name: '10年以上', value: Math.floor(9 * factor) }
    ];
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
