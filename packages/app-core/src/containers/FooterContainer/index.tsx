import React, { useState } from 'react';
import { tabClassName } from '@repo/ui';
import { useBalances } from '../../hooks/use-balances';
import { AuthGuard } from '../../components/AuthGuard';

type Tab = 'balances' | 'orders' | 'trades';

export function FooterContainer() {
  const [activeTab, setActiveTab] = useState<Tab>('balances');
  const { balances, loading, error } = useBalances();

  return (
    <footer className="flex min-h-[150px] flex-col overflow-hidden rounded-lg border-t border-border bg-surface">
      <div className="flex gap-4 border-b border-border bg-surface px-3">
        <button
          className={tabClassName(activeTab === 'balances')}
          onClick={() => {
            setActiveTab('balances');
          }}
        >
          Balances
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 text-ink">
        <AuthGuard fallback={<div>Please login to view balances</div>}>
          {activeTab === 'balances' && (
            // TODO: extract balances component
            <div>
              {loading && <div>Loading balances...</div>}
              {error && (
                <div className="text-danger">Error: {error.message}</div>
              )}
              {!loading && !error && balances.length === 0 && (
                <div>No balances</div>
              )}
              {!loading && !error && balances.length > 0 && (
                <table className="w-full text-left">
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
