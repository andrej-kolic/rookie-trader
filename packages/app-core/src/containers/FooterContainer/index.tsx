import React, { useState } from 'react';
import { Tab } from '@repo/ui';
import { useBalances } from '../../hooks/use-balances';
import { useExecutions } from '../../hooks/use-executions';
import { AuthGuard } from '../../components/AuthGuard';
import { FooterTable } from './FooterTable';
import { BALANCE_COLUMNS, ORDER_COLUMNS, TRADE_COLUMNS } from './columns';
import { footer } from './styles';

type TabId = 'balances' | 'orders' | 'trades';

const TABS: { id: TabId; label: string }[] = [
  { id: 'balances', label: 'Balances' },
  { id: 'orders', label: 'Open orders' },
  { id: 'trades', label: 'Trades' },
];

export function FooterContainer() {
  const [activeTab, setActiveTab] = useState<TabId>('balances');
  const balances = useBalances();
  const executions = useExecutions();
  const s = footer();

  return (
    <footer className={s.root()}>
      <div className={s.tabs()}>
        {TABS.map(({ id, label }) => (
          <Tab
            key={id}
            active={activeTab === id}
            onClick={() => {
              setActiveTab(id);
            }}
          >
            {label}
          </Tab>
        ))}
      </div>
      <div className={s.content()}>
        <AuthGuard
          fallback={
            <div className={s.message()}>Please login to view your account</div>
          }
        >
          {activeTab === 'balances' && (
            <FooterTable
              columns={BALANCE_COLUMNS}
              rows={balances.balances}
              rowKey={(b) => b.asset}
              loading={balances.loading}
              loadingLabel="Loading balances"
              error={balances.error}
              emptyMessage="No balances"
            />
          )}
          {activeTab === 'orders' && (
            <FooterTable
              columns={ORDER_COLUMNS}
              rows={executions.openOrders}
              rowKey={(o) => o.id}
              loading={executions.loading}
              loadingLabel="Loading open orders"
              error={executions.error}
              emptyMessage="No open orders"
            />
          )}
          {activeTab === 'trades' && (
            <FooterTable
              columns={TRADE_COLUMNS}
              rows={executions.trades}
              rowKey={(t) => t.id}
              loading={executions.loading}
              loadingLabel="Loading trades"
              error={executions.error}
              emptyMessage="No trades"
            />
          )}
        </AuthGuard>
      </div>
    </footer>
  );
}
