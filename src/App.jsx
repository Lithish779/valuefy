import { useState } from 'react'
import Rebalancing from './components/Rebalancing'
import Holdings from './components/Holdings'
import History from './components/History'
import EditPlan from './components/EditPlan'
import { useRebalancing } from './hooks/useRebalancing'
import './index.css'

// Simple Icon Components
const ChartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="M18 9l-5 5-2-2-4 4" />
  </svg>
);

function App() {
  const [activeTab, setActiveTab] = useState('rebalancing')
  const rebalancing = useRebalancing()

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  const renderContent = () => {
    if (rebalancing.loading) return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading portfolio data...</div>

    switch (activeTab) {
      case 'rebalancing': return <Rebalancing {...rebalancing} />
      case 'holdings': return <Holdings {...rebalancing} />
      case 'history': return <History {...rebalancing} />
      case 'edit-plan': return <EditPlan {...rebalancing} />
      default: return <Rebalancing {...rebalancing} />
    }
  }

  return (
    <div className="app-container">
      <header>
        <div className="top-bar">
          <div className="brand">
            <div className="brand-icon">
              <ChartIcon />
            </div>
            WealthAxis
          </div>
          <div className="client-pill">
            <span className="client-name">Amit Sharma</span>
            <span style={{ color: 'var(--border)' }}>|</span>
            <span className="portfolio-value">{formatCurrency(580000)}</span>
          </div>
        </div>
        
        <nav className="nav-bar">
          <button 
            className={`nav-link ${activeTab === 'rebalancing' ? 'active' : ''}`}
            onClick={() => setActiveTab('rebalancing')}
          >
            Rebalancing
          </button>
          <button 
            className={`nav-link ${activeTab === 'holdings' ? 'active' : ''}`}
            onClick={() => setActiveTab('holdings')}
          >
            My Holdings
          </button>
          <button 
            className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
          <button 
            className={`nav-link ${activeTab === 'edit-plan' ? 'active' : ''}`}
            onClick={() => setActiveTab('edit-plan')}
          >
            Edit Plan
          </button>
        </nav>
      </header>

      <main>
        {renderContent()}
      </main>
    </div>
  )
}

export default App
