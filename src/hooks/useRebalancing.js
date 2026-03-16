import { useState, useMemo, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';
const CLIENT_ID = 'C001';

export const useRebalancing = () => {
  const [dbFunds, setDbFunds] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/${CLIENT_ID}`);
      const data = await res.json();
      setDbFunds(data.holdings);
    } catch (err) {
      console.error('Fetch dashboard error:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/sessions/${CLIENT_ID}`);
      const data = await res.json();
      setHistory(data.map(s => ({
        id: s.session_id,
        date: new Date(s.created_at).toLocaleDateString(),
        portfolioValue: s.portfolio_value,
        totalBuy: s.total_to_buy,
        totalSell: s.total_to_sell,
        status: s.status
      })));
    } catch (err) {
      console.error('Fetch history error:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchDashboard(), fetchHistory()]);
      setLoading(false);
    };
    init();
  }, []);

  const rebalancingData = useMemo(() => {
    if (!dbFunds || dbFunds.length === 0) return { funds: [], totalBuy: 0, totalSell: 0, freshCashNeeded: 0, totalCurrent: 0 };

    const totalCurrent = dbFunds.reduce((acc, f) => acc + (f.current_value || 0), 0);

    let totalBuy = 0;
    let totalSell = 0;

    const funds = dbFunds.map(fund => {
      const todayPercent = (fund.current_value / totalCurrent) * 100;
      const targetPercent = fund.target_percent || 0;
      const drift = targetPercent - todayPercent;
      const targetAmount = (targetPercent / 100) * totalCurrent;
      const actionValue = targetAmount - fund.current_value;

      // Logic: Only include model funds in buy/sell math. 
      // Axis Bluechip (F006) has targetPercent 0 and is NOT in model_funds (LEFT JOIN gives null)
      const isModelFund = fund.target_percent !== null;

      if (isModelFund) {
        if (actionValue > 0) totalBuy += actionValue;
        if (actionValue < 0) totalSell += Math.abs(actionValue);
      }

      return {
        id: fund.fund_id,
        name: fund.fund_name,
        currentAmount: fund.current_value,
        targetPercent: targetPercent,
        todayPercent,
        drift,
        actionValue,
        targetAmount,
        flag: !isModelFund ? 'Needs Review' : null
      };
    });

    return {
      funds,
      totalBuy,
      totalSell,
      freshCashNeeded: totalBuy - totalSell,
      totalCurrent
    };
  }, [dbFunds]);

  const updateTargetPercentages = async (newTargets) => {
    const payload = Object.keys(newTargets).map(id => ({
      fund_id: id,
      allocation_pct: newTargets[id]
    }));

    try {
      await fetch(`${API_BASE}/model-funds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      await fetchDashboard();
    } catch (err) {
      console.error('Update plan error:', err);
    }
  };

  const saveRecommendation = async () => {
    const payload = {
      client_id: CLIENT_ID,
      portfolio_value: rebalancingData.totalCurrent,
      total_to_buy: rebalancingData.totalBuy,
      total_to_sell: rebalancingData.totalSell,
      net_cash_needed: rebalancingData.freshCashNeeded,
      items: rebalancingData.funds.map(f => ({
        fund_id: f.id,
        fund_name: f.name,
        action: f.actionValue > 0 ? 'BUY' : f.actionValue < 0 ? 'SELL' : 'NONE',
        amount: Math.abs(f.actionValue),
        current_pct: f.todayPercent,
        target_pct: f.targetPercent,
        post_rebalance_pct: f.targetPercent,
        is_model_fund: f.targetPercent > 0
      }))
    };

    try {
      await fetch(`${API_BASE}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      await fetchHistory();
    } catch (err) {
      console.error('Save session error:', err);
    }
  };

  const updateHistoryStatus = async (sessionId, newStatus) => {
    try {
      await fetch(`${API_BASE}/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      await fetchHistory();
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  return {
    ...rebalancingData,
    history,
    loading,
    updateTargetPercentages,
    saveRecommendation,
    updateHistoryStatus
  };
};
