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

    // ─── CLEAR EXISTING DATA ────────────────────────────────────
    db.run('DELETE FROM clients');
    db.run('DELETE FROM model_funds');
    db.run('DELETE FROM client_holdings');
    db.run('DELETE FROM rebalance_sessions');
    db.run('DELETE FROM rebalance_items');

    // ─── SEED CLIENTS ───────────────────────────────────────────
    db.run(`INSERT INTO clients VALUES ('C001', 'Amit Sharma', 500000)`);
    db.run(`INSERT INTO clients VALUES ('C002', 'Priya Nair', 750000)`);
    db.run(`INSERT INTO clients VALUES ('C003', 'Rohan Mehta', 250000)`);

    // ─── SEED MODEL FUNDS ───────────────────────────────────────
    db.run(`INSERT INTO model_funds VALUES ('F001', 'Mirae Asset Large Cap Fund', 'EQUITY', 30)`);
    db.run(`INSERT INTO model_funds VALUES ('F002', 'Parag Parikh Flexi Cap Fund', 'EQUITY', 25)`);
    db.run(`INSERT INTO model_funds VALUES ('F003', 'HDFC Mid Cap Opportunities Fund', 'EQUITY', 20)`);
    db.run(`INSERT INTO model_funds VALUES ('F004', 'ICICI Prudential Bond Fund', 'DEBT', 15)`);
    db.run(`INSERT INTO model_funds VALUES ('F005', 'Nippon India Gold ETF', 'GOLD', 10)`);

    // ─── SEED CLIENT HOLDINGS ───────────────────────────────────
    // Amit Sharma (C001) - 6 funds including out-of-plan F006
    db.run(`INSERT INTO client_holdings VALUES (1,'C001','F001','Mirae Asset Large Cap Fund',90000)`);
    db.run(`INSERT INTO client_holdings VALUES (2,'C001','F002','Parag Parikh Flexi Cap Fund',155000)`);
    db.run(`INSERT INTO client_holdings VALUES (3,'C001','F003','HDFC Mid Cap Opportunities Fund',0)`);
    db.run(`INSERT INTO client_holdings VALUES (4,'C001','F004','ICICI Prudential Bond Fund',110000)`);
    db.run(`INSERT INTO client_holdings VALUES (5,'C001','F005','Nippon India Gold ETF',145000)`);
    db.run(`INSERT INTO client_holdings VALUES (6,'C001','F006','Axis Bluechip Fund',80000)`);

    // Priya Nair (C002) - 5 funds including out-of-plan F007, F008
    db.run(`INSERT INTO client_holdings VALUES (7,'C002','F001','Mirae Asset Large Cap Fund',200000)`);
    db.run(`INSERT INTO client_holdings VALUES (8,'C002','F002','Parag Parikh Flexi Cap Fund',180000)`);
    db.run(`INSERT INTO client_holdings VALUES (9,'C002','F004','ICICI Prudential Bond Fund',220000)`);
    db.run(`INSERT INTO client_holdings VALUES (10,'C002','F007','SBI Bluechip Fund',90000)`);
    db.run(`INSERT INTO client_holdings VALUES (11,'C002','F008','DSP Tax Saver Fund',60000)`);

    // Rohan Mehta (C003) - 5 funds all in plan
    db.run(`INSERT INTO client_holdings VALUES (12,'C003','F001','Mirae Asset Large Cap Fund',76000)`);
    db.run(`INSERT INTO client_holdings VALUES (13,'C003','F002','Parag Parikh Flexi Cap Fund',62000)`);
    db.run(`INSERT INTO client_holdings VALUES (14,'C003','F003','HDFC Mid Cap Opportunities Fund',48000)`);
    db.run(`INSERT INTO client_holdings VALUES (15,'C003','F004','ICICI Prudential Bond Fund',38000)`);
    db.run(`INSERT INTO client_holdings VALUES (16,'C003','F005','Nippon India Gold ETF',26000)`);

    console.log('Database schema initialized and seeded.');
  });
};

module.exports = { db, initDb };
