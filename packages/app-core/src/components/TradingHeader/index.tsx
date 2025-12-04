import React from 'react';
import { TradingPairSelectorContainer } from '../../containers/TradingPairSelectorContainer';
import { TickerDisplayContainer } from '../../containers/TickerDisplayContainer';
import './styles.css';

/**
 * Trading Header Component
 * Combines trading pair selector (left) and ticker display (right)
 * Maintains side-by-side layout on all screen sizes
 */
export function TradingHeader(): React.JSX.Element {
  return (
    <div className="TradingHeader">
      <div className="TradingHeader__selector">
        <TradingPairSelectorContainer />
      </div>
      <div className="TradingHeader__ticker">
        <TickerDisplayContainer />
      </div>
    </div>
  );
}
