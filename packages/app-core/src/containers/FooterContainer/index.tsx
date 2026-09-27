import React, { useState } from 'react';
import { Tab } from '@repo/ui';
import { useBalances } from '../../hooks/use-balances';
import { AuthGuard } from '../../components/AuthGuard';
import { footer } from './styles';

type TabId = 'balances' | 'orders' | 'trades';

export function FooterContainer() {
  const [activeTab, setActiveTab] = useState<TabId>('balances');
  const { balances, loading, error } = useBalances();
  const s = footer();

  return (
    <footer className={s.root()}>
      <div className={s.tabs()}>
        <Tab
          active={activeTab === 'balances'}
          onClick={() => {
            setActiveTab('balances');
          }}
        >
          Balances
        </Tab>
      </div>
      <div className={s.content()}>
        <AuthGuard fallback={<div>Please login to view balances</div>}>
          {activeTab === 'balances' && (
            // TODO: extract balances component
            <div>
              {loading && <div>Loading balances...</div>}
              {error && <div className={s.error()}>Error: {error.message}</div>}
              {!loading && !error && balances.length === 0 && (
                <div>No balances</div>
              )}
              {!loading && !error && balances.length > 0 && (
                <table className={s.table()}>
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
        </AuthGuard>
      </div>
    </footer>
  );
}
