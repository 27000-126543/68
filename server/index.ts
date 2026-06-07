import express from 'express';
import cors from 'cors';
import apiRoutes from './routes';
import { getDb, hasData } from './db';
import { runSeed } from './seed';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok' });
});

async function start() {
  try {
    const db = await getDb();

    if (!hasData(db, 'daily_metrics')) {
      console.log('No data found, running seed...');
      await runSeed();
    }

    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
