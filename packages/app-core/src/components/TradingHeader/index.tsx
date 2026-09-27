import React from 'react';
import { TradingPairSelectorContainer } from '../../containers/TradingPairSelectorContainer';
import { TickerDisplayContainer } from '../../containers/TickerDisplayContainer';

/**
 * Trading Header Component
 * Combines trading pair selector (left) and ticker display (right)
 * Maintains side-by-side layout on all screen sizes
 */
export function TradingHeader(): React.JSX.Element {
  return (
    <div className="box-border flex h-[60px] w-full max-w-full min-w-0 items-stretch gap-4 rounded-lg">
      <div className="flex max-w-40 min-w-40 shrink-0">
        <TradingPairSelectorContainer />
      </div>
      <div className="flex min-w-0 flex-1 overflow-hidden">
        <TickerDisplayContainer />
      </div>
    </div>
  );
}
