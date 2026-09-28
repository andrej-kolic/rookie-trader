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
        <AuthGuard
          fallback={
            <div className={s.message()}>Please login to view balances</div>
          }
        >
          {activeTab === 'balances' && (
            // TODO: extract balances component
            <div>
              {loading && (
                <div
                  className={s.skeletonGrid()}
                  role="status"
                  aria-label="Loading balances"
                >
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className={s.skeletonRow()}>
                      <div className={s.skeletonShort()}></div>
                      <div className={s.skeletonLong()}></div>
                    </div>
                  ))}
                </div>
              )}
              {error && <div className={s.error()}>Error: {error.message}</div>}
              {!loading && !error && balances.length === 0 && (
                <div className={s.message()}>No balances</div>
              )}
              {!loading && !error && balances.length > 0 && (
                <table className={s.table()}>
                  <thead>
                    <tr>
                      <th className={s.headCell()}>Asset</th>
                      <th className={s.headCell()}>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {balances.map((balance) => (
                      <tr key={balance.asset} className={s.row()}>
                        <td className={s.cell()}>{balance.asset}</td>
                        <td className={s.cell()}>{balance.balance}</td>
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
