import React from 'react';
import { add } from '@repo/ui/utils';
import type { CustomType } from '@repo/commons';
import { debugLog } from './utils/debug';
import { TradingPairSelectorContainer } from './containers/TradingPairSelectorContainer';
import { TickerDisplayContainer } from './containers/TickerDisplayContainer';
import { OrderBookDisplayContainer } from './containers/OrderBookDisplayContainer';
import { PriceChartContainer } from './containers/PriceChartContainer';

import '@repo/ui/theme.css';
import './styles.css';

// TODO remove
/* _eslint no-console: "error" */

// TODO remove
const ct: CustomType = { _type: 'test' };
console.log('* custom type:', ct);

// TODO remove
console.log('* 1 + 2:', add(1, 2));

const _orphan = 1;

export function AppCore(props: {
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

// TODO: remove - example of lint warning for eslint-plugin-react-refresh
export const foo = () => {
  //
};
