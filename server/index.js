const express = require('express');
const cors = require('cors');
const { db, initDb } = require('./db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Initialize database
initDb();

// Get client dashboard data
app.get('/api/dashboard/:clientId', (req, res) => {
  const { clientId } = req.params;
  
  // Get client info and total holdings value
  db.get(
    'SELECT c.client_name, SUM(ch.current_value) as total_portfolio_value FROM clients c JOIN client_holdings ch ON c.client_id = ch.client_id WHERE c.client_id = ?', 
    [clientId], 
    (err, clientInfo) => {
      if (err) return res.status(500).json({ error: err.message });

      const query = `
        SELECT 
          ch.fund_id, ch.fund_name, ch.current_value,
          mf.allocation_pct as target_percent
        FROM client_holdings ch
        LEFT JOIN model_funds mf ON ch.fund_id = mf.fund_id
        WHERE ch.client_id = ?
      `;

      db.all(query, [clientId], (err, holdings) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
          clientName: clientInfo.client_name,
          totalPortfolioValue: clientInfo.total_portfolio_value,
          holdings: holdings
        });
      });
    }
  );
});

// Get model funds
app.get('/api/model-funds', (req, res) => {
  db.all('SELECT * FROM model_funds', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Update model funds
app.post('/api/model-funds', (req, res) => {
  const funds = req.body; // Array of { fund_id, allocation_pct }
  
  db.serialize(() => {
    const stmt = db.prepare('UPDATE model_funds SET allocation_pct = ? WHERE fund_id = ?');
    funds.forEach(f => stmt.run([f.allocation_pct, f.fund_id]));
    stmt.finalize((err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Plan updated successfully' });
    });
  });
});

// Get rebalance sessions
app.get('/api/sessions/:clientId', (req, res) => {
  db.all('SELECT * FROM rebalance_sessions WHERE client_id = ? ORDER BY created_at DESC', [req.params.clientId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Save rebalance session
app.post('/api/sessions', (req, res) => {
  const { client_id, portfolio_value, total_to_buy, total_to_sell, net_cash_needed, items } = req.body;
  const created_at = new Date().toISOString();

  db.run(
    `INSERT INTO rebalance_sessions (client_id, created_at, portfolio_value, total_to_buy, total_to_sell, net_cash_needed, status)
     VALUES (?, ?, ?, ?, ?, ?, 'PENDING')`,
    [client_id, created_at, portfolio_value, total_to_buy, total_to_sell, net_cash_needed],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      const sessionId = this.lastID;
      const stmt = db.prepare(`
        INSERT INTO rebalance_items (session_id, fund_id, fund_name, action, amount, current_pct, target_pct, post_rebalance_pct, is_model_fund)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      items.forEach(item => {
        stmt.run([sessionId, item.fund_id, item.fund_name, item.action, item.amount, item.current_pct, item.target_pct, item.post_rebalance_pct, item.is_model_fund]);
      });
      
      stmt.finalize((err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ session_id: sessionId, message: 'Session saved successfully' });
      });
    }
  );
});

// Update session status
app.patch('/api/sessions/:sessionId', (req, res) => {
  const { status } = req.body;
  db.run('UPDATE rebalance_sessions SET status = ? WHERE session_id = ?', [status, req.params.sessionId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Status updated' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
