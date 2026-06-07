import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import {
  getAlertsFromDb,
  approveAlert,
  escalateAlert,
  resolveAlert,
  getAlertCounts
} from '../utils/alertEngine';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { status, level, keyword } = req.query;
    const filters: any = {};
    if (status) filters.status = String(status);
    if (level) filters.level = String(level);
    if (keyword) filters.keyword = String(keyword);

    const alerts = getAlertsFromDb(db, filters);
    res.json({ success: true, data: alerts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/count', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const counts = getAlertCounts(db);
    res.json({ success: true, data: counts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/:id/approve', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { role, comment, approverName } = req.body;

    if (!role) {
      return res.status(400).json({ success: false, error: '缺少 role 参数' });
    }

    const updatedAlert = approveAlert(db, id, role, comment || '', approverName || '系统');
    res.json({ success: true, data: updatedAlert });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/:id/escalate', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const updatedAlert = escalateAlert(db, id);
    res.json({ success: true, data: updatedAlert });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/:id/resolve', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const updatedAlert = resolveAlert(db, id);
    res.json({ success: true, data: updatedAlert });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
