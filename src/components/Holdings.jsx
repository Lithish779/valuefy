import React from 'react';

const Holdings = ({ funds, totalCurrent }) => {
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <h2>Current Holdings Portfolio</h2>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Fund Name</th>
                <th>Asset ID</th>
                <th style={{ textAlign: 'right' }}>Current Value</th>
                <th style={{ textAlign: 'right' }}>Portfolio %</th>
                <th style={{ textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {funds.map(fund => (
                <tr key={fund.id}>
                  <td style={{ fontWeight: 500 }}>{fund.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{fund.id}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(fund.currentAmount)}</td>
                  <td style={{ textAlign: 'right' }}>{fund.todayPercent.toFixed(1)}%</td>
                  <td style={{ textAlign: 'center' }}>
                    {fund.flag === 'Needs Review' ? (
                      <span className="pill pill-review">Needs Review</span>
                    ) : (
                      <span className="pill pill-applied">In Plan</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="2" style={{ fontWeight: 700, padding: '20px' }}>Total Portfolio Value</td>
                <td style={{ textAlign: 'right', fontWeight: 700, padding: '20px', color: 'var(--success)', fontSize: '1.1rem' }}>
                  {formatCurrency(totalCurrent)}
                </td>
                <td colSpan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Holdings;
