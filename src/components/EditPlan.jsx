import React, { useState, useEffect } from 'react';

const EditPlan = ({ funds, updateTargetPercentages }) => {
  const [localTargets, setLocalTargets] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const initial = {};
    funds.forEach(f => {
      if (f.targetPercent !== null) {
        initial[f.id] = f.targetPercent;
      }
    });
    setLocalTargets(initial);
  }, [funds]);

  const handleChange = (id, val) => {
    setLocalTargets(prev => ({ ...prev, [id]: parseFloat(val) || 0 }));
  };

  const total = Object.values(localTargets).reduce((acc, v) => acc + v, 0);
  const isValid = Math.abs(total - 100) < 0.01;

  const handleUpdate = async () => {
    setIsSaving(true);
    await updateTargetPercentages(localTargets);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="fade-in">
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card-header">
          <h2>Edit Model Portfolio</h2>
        </div>

        <div className="table-container">
          <table style={{ borderBottom: 'none' }}>
            <thead>
              <tr>
                <th>Fund Name</th>
                <th style={{ textAlign: 'right' }}>Target %</th>
              </tr>
            </thead>
            <tbody>
              {funds.filter(f => f.targetPercent !== null).map(fund => (
                <tr key={fund.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{fund.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fund.id}</div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      <input 
                        type="number" 
                        value={localTargets[fund.id] || 0}
                        onChange={(e) => handleChange(fund.id, e.target.value)}
                        step="0.1"
                      />
                      <span style={{ fontWeight: 600 }}>%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '32px', padding: '24px', background: 'var(--bg-offset)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Total Allocation:</span>
              <span style={{ 
                fontSize: '1.25rem', 
                fontWeight: 800, 
                color: isValid ? 'var(--success)' : 'var(--danger)' 
              }}>
                {total.toFixed(1)}%
              </span>
              {isValid && (
                <span style={{ color: 'var(--success)', fontSize: '1.5rem' }}>✓</span>
              )}
            </div>
            {!isValid && (
              <div style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600 }}>
                Total must be exactly 100%
              </div>
            )}
          </div>

          <button 
            className={`btn ${saveSuccess ? 'btn-outline' : 'btn-primary'}`} 
            style={{ width: '100%', padding: '14px', borderColor: saveSuccess ? 'var(--success)' : '', color: saveSuccess ? 'var(--success)' : '' }}
            disabled={!isValid || isSaving || saveSuccess}
            onClick={handleUpdate}
          >
            {isSaving ? 'Syncing...' : saveSuccess ? '✓ Plan Synced Successfully' : 'Recalculate & Sync Plan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPlan;
