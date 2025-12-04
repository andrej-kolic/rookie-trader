import React from 'react';
import { debugLog } from './utils/debug';
import { TradingHeader } from './components/TradingHeader';
import { OrderBookDisplayContainer } from './containers/OrderBookDisplayContainer';
import { PriceChartContainer } from './containers/PriceChartContainer';

import '@repo/ui/theme.css';
import './styles.css';

export function AppCore(_props: {
  className?: string;
  title: string;
  children: React.ReactNode;
  href: string;
}): React.JSX.Element {
  debugLog();

  return (
    <div className="AppCore">
      <header className="AppCore__brand-header">
        {/* Placeholder for logo and brand */}
        <div className="AppCore__brand-placeholder">Logo & Brand</div>
      </header>

      <header className="AppCore__trading-header">
        <TradingHeader />
      </header>

      <main className="AppCore__main">
        <div className="AppCore__orderbook">
          <OrderBookDisplayContainer />
        </div>
        <div className="AppCore__chart">
          <PriceChartContainer />
        </div>
      </main>
    </div>
  );
}
