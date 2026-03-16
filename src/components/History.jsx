import React, { useState } from 'react';

const History = ({ history, updateHistoryStatus }) => {
  const [processingId, setProcessingId] = useState(null);

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  const handleStatusUpdate = async (id, status) => {
    setProcessingId(id);
    await updateHistoryStatus(id, status);
    setProcessingId(null);
  };

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <h2>Rebalancing History</h2>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Portfolio Value</th>
                <th style={{ textAlign: 'right' }}>Total Buy</th>
                <th style={{ textAlign: 'right' }}>Total Sell</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No rebalancing history found.
                  </td>
                </tr>
              ) : (
                history.map(session => (
                  <tr key={session.id}>
                    <td>{session.date}</td>
                    <td style={{ textAlign: 'right', fontWeight: 500 }}>{formatCurrency(session.portfolioValue)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 600 }}>{formatCurrency(session.totalBuy)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--danger)', fontWeight: 600 }}>{formatCurrency(session.totalSell)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`pill pill-${session.status.toLowerCase()}`}>
                        {session.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {session.status === 'PENDING' && (
                          <>
                            <button 
                              className="btn btn-outline" 
                              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                              onClick={() => handleStatusUpdate(session.id, 'APPLIED')}
                              disabled={processingId !== null}
                            >
                              {processingId === session.id ? '...' : 'Apply'}
                            </button>
                            <button 
                              className="btn btn-outline" 
                              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                              onClick={() => handleStatusUpdate(session.id, 'DISMISSED')}
                              disabled={processingId !== null}
                            >
                              {processingId === session.id ? '...' : 'Dismiss'}
                            </button>
                          </>
                        )}
                        {session.status !== 'PENDING' && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Locked</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
