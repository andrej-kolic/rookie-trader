import React from 'react';
import { debugLog } from './utils/debug';
import { TradingPairSelectorContainer } from './containers/TradingPairSelectorContainer';
import { TickerDisplayContainer } from './containers/TickerDisplayContainer';
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
      <TradingPairSelectorContainer />

      <TickerDisplayContainer />

      <div className="market-data-layout">
        <OrderBookDisplayContainer />
        <PriceChartContainer />
      </div>
    </div>
  );
}
