import React from 'react';
import { TradingPairSelectorContainer } from '../../containers/TradingPairSelectorContainer';
import { TickerDisplayContainer } from '../../containers/TickerDisplayContainer';
import { tradingHeader } from './styles';

/**
 * Trading Header Component
 * Combines trading pair selector (left) and ticker display (right)
 * Side by side, stacked on phones
 */
export function TradingHeader(): React.JSX.Element {
  const s = tradingHeader();
  return (
    <div className={s.root()}>
      <div className={s.selector()}>
        <TradingPairSelectorContainer />
      </div>
      <div className={s.ticker()}>
        <TickerDisplayContainer />
      </div>
    </div>
  );
}
