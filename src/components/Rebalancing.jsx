import React from 'react';

const Rebalancing = ({ funds, totalBuy, totalSell, freshCashNeeded, saveRecommendation }) => {
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <div className="fade-in">
      <div className="kpi-grid">
        <div className="kpi-card buy">
          <div className="kpi-label">Total to Buy</div>
          <div className="kpi-value" style={{ color: 'var(--success)' }}>{formatCurrency(totalBuy)}</div>
          <div className="kpi-subtitle">Target acquisition amount</div>
        </div>
        <div className="kpi-card sell">
          <div className="kpi-label">Total to Sell</div>
          <div className="kpi-value" style={{ color: 'var(--danger)' }}>{formatCurrency(totalSell)}</div>
          <div className="kpi-subtitle">Target liquidation amount</div>
        </div>
        <div className="kpi-card cash">
          <div className="kpi-label">Fresh Cash Needed</div>
          <div className="kpi-value" style={{ color: 'var(--info)' }}>{formatCurrency(freshCashNeeded)}</div>
          <div className="kpi-subtitle">Net infusion required</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Rebalancing Recommendation</h2>
          <button className="btn btn-primary" onClick={saveRecommendation} disabled={funds.length === 0}>
            Save Recommendation
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Fund Analysis</th>
                <th>Today %</th>
                <th>Target %</th>
                <th>Drift</th>
                <th>Action</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {funds.map(fund => {
                const isOutOfPlan = fund.flag === 'Needs Review';
                const assetClass = fund.id.startsWith('F004') ? 'DEBT' : fund.id.startsWith('F005') ? 'GOLD' : 'EQUITY';
                
                return (
                  <tr key={fund.id} className={isOutOfPlan ? 'highlight-row' : ''}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text)' }}>{fund.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fund.id}</span>
                          <span className={`badge badge-${assetClass.toLowerCase()}`}>{assetClass}</span>
                        </div>
                        {isOutOfPlan && <div style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 600 }}>⚠️ Out of Plan Fund</div>}
                      </div>
                    </td>
                    <td>{fund.todayPercent.toFixed(1)}%</td>
                    <td>{fund.targetPercent > 0 ? `${fund.targetPercent.toFixed(1)}%` : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="drift-track">
                          <div 
                            className="drift-fill" 
                            style={{ 
                              width: `${Math.min(Math.abs(fund.drift), 100)}%`, 
                              backgroundColor: Math.abs(fund.drift) > 2 ? 'var(--warning)' : 'var(--primary)',
                              left: fund.drift > 0 ? '0' : 'auto',
                              right: fund.drift < 0 ? '0' : 'auto'
                            }} 
                          />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: Math.abs(fund.drift) > 2 ? 'var(--warning)' : 'inherit' }}>
                          {fund.drift > 0 ? '+' : ''}{fund.drift.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      {isOutOfPlan ? (
                        <span className="pill pill-review">REVIEW</span>
                      ) : fund.actionValue > 1 ? (
                        <span className="pill pill-buy">BUY</span>
                      ) : fund.actionValue < -1 ? (
                        <span className="pill pill-sell">SELL</span>
                      ) : (
                        <span className="pill pill-dismissed">HOLD</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: fund.actionValue > 0 ? 'var(--success)' : fund.actionValue < 0 ? 'var(--danger)' : 'inherit' }}>
                      {fund.targetPercent > 0 ? formatCurrency(Math.abs(fund.actionValue)) : formatCurrency(Math.abs(fund.currentAmount))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Rebalancing;
