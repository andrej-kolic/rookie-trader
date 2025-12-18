import React, { useState } from 'react';
import { useBalances } from '../../hooks/use-balances';
import './styles.css';

type Tab = 'balances' | 'orders' | 'trades';

// TODO: Add authentication guard
// This component should only render if user is authenticated
// Consider wrapping sensitive data (balances, orders, trades) with AuthGuard component
// Example: {isAuthenticated ? <BalancesTab /> : <div>Please login to view balances</div>}

export function FooterContainer() {
  const [activeTab, setActiveTab] = useState<Tab>('balances');
  const { balances, loading, error } = useBalances();

  return (
    <footer className="FooterContainer">
      <div className="FooterContainer__tabs">
        <button
          className={`FooterContainer__tab ${activeTab === 'balances' ? 'FooterContainer__tab--active' : ''}`}
          onClick={() => {
            setActiveTab('balances');
          }}
        >
          Balances
        </button>
      </div>
      <div className="FooterContainer__content">
        {activeTab === 'balances' && (
          // TODO: extract balances component
          <div>
            {loading && <div>Loading balances...</div>}
            {error && (
              <div style={{ color: 'red' }}>Error: {error.message}</div>
            )}
            {!loading && !error && balances.length === 0 && (
              <div>No balances</div>
            )}
            {!loading && !error && balances.length > 0 && (
              <table style={{ width: '100%', textAlign: 'left' }}>
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {balances.map((balance) => (
                    <tr key={balance.asset}>
                      <td>{balance.asset}</td>
                      <td>{balance.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </footer>
  );
}
