import { Subject } from 'rxjs';
import { act, renderHook } from '@testing-library/react';
import { useTicker } from '../use-ticker';

const streams = new Map<string, Subject<unknown>>();

// Ticker updates arrive over the public Kraken WebSocket, one stream per symbol
jest.mock('../../api/kraken-ws-api', () => ({
  subscribeToTicker: ([symbol]: [string]) => {
    const stream = new Subject<unknown>();
    streams.set(symbol, stream);
    return stream;
  },
}));

function publish(symbol: string, last: number) {
  act(() => {
    streams.get(symbol)?.next({
      data: [
        {
          symbol,
          last,
          bid: last,
          bid_qty: 1,
          ask: last,
          ask_qty: 1,
          high: last,
          low: last,
          volume: 1,
          vwap: last,
          change: 0,
          change_pct: 0,
        },
      ],
    });
  });
}

beforeEach(() => {
  streams.clear();
});

describe('useTicker', () => {
  it('returnsNoTicker_afterSymbolChangeUntilNewPairUpdates', () => {
    const { result, rerender } = renderHook(({ symbol }) => useTicker(symbol), {
      initialProps: { symbol: 'BTC/USD' },
    });
    publish('BTC/USD', 60000);

    rerender({ symbol: 'ETH/USD' });

    expect(result.current.ticker).toBeNull();
    expect(result.current.loading).toBe(true);

    publish('ETH/USD', 3000);

    expect(result.current.ticker?.symbol).toBe('ETH/USD');
  });
});
