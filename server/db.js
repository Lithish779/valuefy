const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'model_portfolio.db');
const db = new sqlite3.Database(dbPath);

const initDb = () => {
  db.serialize(() => {
    // Clients table
    db.run(`CREATE TABLE IF NOT EXISTS clients (
      client_id TEXT PRIMARY KEY,
      client_name TEXT,
      total_invested REAL
    )`);

    // Model Funds table
    db.run(`CREATE TABLE IF NOT EXISTS model_funds (
      fund_id TEXT PRIMARY KEY,
      fund_name TEXT,
      asset_class TEXT,
      allocation_pct REAL
    )`);

    // Client Holdings table
    db.run(`CREATE TABLE IF NOT EXISTS client_holdings (
      holding_id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id TEXT,
      fund_id TEXT,
      fund_name TEXT,
      current_value REAL,
      FOREIGN KEY(client_id) REFERENCES clients(client_id)
    )`);

    // Rebalance Sessions table
    db.run(`CREATE TABLE IF NOT EXISTS rebalance_sessions (
      session_id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id TEXT,
      created_at TEXT,
      portfolio_value REAL,
      total_to_buy REAL,
      total_to_sell REAL,
      net_cash_needed REAL,
      status TEXT,
      FOREIGN KEY(client_id) REFERENCES clients(client_id)
    )`);

    // Rebalance Items table
    db.run(`CREATE TABLE IF NOT EXISTS rebalance_items (
      item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER,
      fund_id TEXT,
      fund_name TEXT,
      action TEXT,
      amount REAL,
      current_pct REAL,
      target_pct REAL,
      post_rebalance_pct REAL,
      is_model_fund BOOLEAN,
      FOREIGN KEY(session_id) REFERENCES rebalance_sessions(session_id)
    )`);

    // Skip clearing and seeding so that we use the real data from model_portfolio.db
    console.log('Database tables ensured. Using existing real data.');
  });
};

module.exports = { db, initDb };
