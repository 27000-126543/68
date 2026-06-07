import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import * as fs from 'fs';
import * as path from 'path';

let dbInstance: Database | null = null;
let sqlJsInstance: SqlJsStatic | null = null;

async function loadSqlJs(): Promise<SqlJsStatic> {
  if (sqlJsInstance) return sqlJsInstance;

  const wasmPath = path.resolve(process.cwd(), 'node_modules/sql.js/dist/sql-wasm.wasm');

  if (fs.existsSync(wasmPath)) {
    sqlJsInstance = await initSqlJs({
      locateFile: () => wasmPath
    });
  } else {
    sqlJsInstance = await initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`
    });
  }

  return sqlJsInstance;
}

function createTables(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      industry TEXT NOT NULL,
      city TEXT NOT NULL,
      province TEXT NOT NULL,
      education TEXT NOT NULL,
      experience TEXT NOT NULL,
      salary_min INTEGER NOT NULL,
      salary_max INTEGER NOT NULL,
      enterprise_id TEXT NOT NULL,
      enterprise_name TEXT NOT NULL,
      published_at TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      candidate_name TEXT NOT NULL,
      education TEXT NOT NULL,
      experience_years REAL NOT NULL,
      is_matched INTEGER NOT NULL DEFAULT 0,
      applied_at TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS interviews (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL,
      invited_at TEXT NOT NULL,
      conducted INTEGER NOT NULL DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS offers (
      id TEXT PRIMARY KEY,
      interview_id TEXT NOT NULL,
      sent_at TEXT NOT NULL,
      accepted INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS onboardings (
      id TEXT PRIMARY KEY,
      offer_id TEXT NOT NULL,
      onboarded_at TEXT NOT NULL,
      retained_3months INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS daily_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      industry TEXT NOT NULL,
      city TEXT NOT NULL,
      province TEXT NOT NULL,
      applications INTEGER NOT NULL DEFAULT 0,
      matched_applications INTEGER NOT NULL DEFAULT 0,
      interviews INTEGER NOT NULL DEFAULT 0,
      offers INTEGER NOT NULL DEFAULT 0,
      accepted_offers INTEGER NOT NULL DEFAULT 0,
      onboardings INTEGER NOT NULL DEFAULT 0,
      retained_onboardings INTEGER NOT NULL DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      level INTEGER NOT NULL,
      industry TEXT,
      region TEXT,
      description TEXT,
      triggered_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      delivery_drop_rate REAL,
      conversion_gap REAL,
      current_step_index INTEGER NOT NULL DEFAULT 0,
      improvement_days INTEGER NOT NULL DEFAULT 0,
      resolved_at TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS approval_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      alert_id TEXT NOT NULL,
      role TEXT NOT NULL,
      role_name TEXT NOT NULL,
      approved INTEGER NOT NULL DEFAULT 0,
      approver_id TEXT,
      approver_name TEXT,
      approved_at TEXT,
      comment TEXT,
      step_order INTEGER NOT NULL DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS weekly_reports (
      id TEXT PRIMARY KEY,
      week_start TEXT NOT NULL,
      week_end TEXT NOT NULL,
      generated_at TEXT NOT NULL,
      scope TEXT NOT NULL,
      summary_json TEXT NOT NULL,
      recommendations_json TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS permission_users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      role_name TEXT NOT NULL,
      scope TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      scope_json TEXT NOT NULL
    )
  `);
}

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  const SQL = await loadSqlJs();
  dbInstance = new SQL.Database();
  createTables(dbInstance);

  return dbInstance;
}

export function hasData(db: Database, tableName: string): boolean {
  try {
    const stmt = db.prepare(`SELECT COUNT(*) as cnt FROM ${tableName}`);
    stmt.step();
    const result = stmt.getAsObject() as { cnt: number };
    stmt.free();
    return result.cnt > 0;
  } catch {
    return false;
  }
}

export function queryAll(db: Database, sql: string, params: any[] = []): any[] {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results: any[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

export function queryOne(db: Database, sql: string, params: any[] = []): any | null {
  const results = queryAll(db, sql, params);
  return results.length > 0 ? results[0] : null;
}

export function exec(db: Database, sql: string, params: any[] = []) {
  db.run(sql, params);
}
