import React from 'react';
import { NEVER } from 'rxjs';
import { render, screen } from '@testing-library/react';
import { OrderBookDisplayContainer } from '../OrderBookDisplayContainer';
import { TickerDisplayContainer } from '../TickerDisplayContainer';
import { PriceChartContainer } from '../PriceChartContainer';
import { useTradingStore } from '../../state/trading-store';

// Market data comes from Kraken over WebSocket and HTTP
jest.mock('../../api/kraken-ws-api', () => ({
  subscribeToOrderBook: () => NEVER,
  subscribeToTicker: () => NEVER,
}));
jest.mock('../../api/kraken-rest-api', () => ({
  fetchOHLC: () => new Promise(() => undefined),
}));

describe('market data while markets are loading', () => {
  beforeEach(() => {
    useTradingStore.setState({ selectedPair: null });
  });

  it('showsOrderBookPlaceholder_whenNoPairYet', () => {
    render(<OrderBookDisplayContainer />);

    expect(
      screen.getByRole('status', { name: 'Loading order book' }),
    ).toBeTruthy();
  });

  it('showsTickerPlaceholder_whenNoPairYet', () => {
    render(<TickerDisplayContainer />);

    expect(screen.getByRole('status', { name: 'Loading ticker' })).toBeTruthy();
  });

  it('showsChartLoading_whenNoPairYet', () => {
    render(<PriceChartContainer />);

    expect(screen.getByText('Loading...')).toBeTruthy();
    expect(screen.queryByText(/Select a trading pair/)).toBeNull();
  });
});
