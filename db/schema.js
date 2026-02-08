const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'proposaldash.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

let db;
const ready = (async () => {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buf);
  } else {
    db = new SQL.Database();
  }
  db.run("PRAGMA foreign_keys = ON");

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
    name TEXT NOT NULL, company TEXT DEFAULT '', logo_url TEXT DEFAULT '',
    brand_color TEXT DEFAULT '#2563eb', plan TEXT DEFAULT 'free',
    stripe_customer_id TEXT, stripe_subscription_id TEXT,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS proposals (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, share_token TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL, client_name TEXT DEFAULT '', client_email TEXT DEFAULT '',
    client_company TEXT DEFAULT '', intro_text TEXT DEFAULT '', terms_text TEXT DEFAULT '',
    status TEXT DEFAULT 'draft', valid_until TEXT, currency TEXT DEFAULT 'USD',
    discount_percent REAL DEFAULT 0, tax_percent REAL DEFAULT 0,
    accepted_at TEXT, accepted_signature TEXT, view_count INTEGER DEFAULT 0,
    last_viewed_at TEXT, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS line_items (
    id TEXT PRIMARY KEY, proposal_id TEXT NOT NULL, description TEXT NOT NULL,
    quantity REAL DEFAULT 1, unit_price REAL DEFAULT 0, sort_order INTEGER DEFAULT 0
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS proposal_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT, proposal_id TEXT NOT NULL,
    ip TEXT, user_agent TEXT, viewed_at TEXT DEFAULT (datetime('now'))
  )`);

  save();
  return db;
})();

function save() {
  if (db) {
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }
}

// Auto-save every 30s
setInterval(save, 30000);

// Wrapper that mimics better-sqlite3 API
const wrapper = {
  ready,
  prepare(sql) {
    return {
      run(...params) { db.run(sql, params); save(); return this; },
      get(...params) {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        if (stmt.step()) { const row = stmt.getAsObject(); stmt.free(); return row; }
        stmt.free(); return undefined;
      },
      all(...params) {
        const results = [];
        const stmt = db.prepare(sql);
        stmt.bind(params);
        while (stmt.step()) results.push(stmt.getAsObject());
        stmt.free();
        return results;
      }
    };
  },
  save
};

module.exports = wrapper;
