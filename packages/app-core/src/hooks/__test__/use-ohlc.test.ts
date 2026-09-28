import { act, renderHook, waitFor } from '@testing-library/react';
import { useOHLC } from '../use-ohlc';
import type { OHLCInterval } from '../../api/kraken-rest-api';

type Pending = { pair: string; resolve: (close: number) => void };
const pending: Pending[] = [];

// Candles come from the Kraken REST API; each call waits until the test resolves it
jest.mock('../../api/kraken-rest-api', () => ({
  fetchOHLC: (pair: string) =>
    new Promise((resolve) => {
      pending.push({
        pair,
        resolve: (close) => {
          resolve({
            [pair]: [[1, '1', '1', '1', String(close), '1', '1', 1]],
            last: 1,
          });
        },
      });
    }),
}));

async function respond(pair: string, close: number) {
  const request = pending.find((p) => p.pair === pair);
  // Async act flushes the hook's awaited response before returning
  await act(() => {
    request?.resolve(close);
    return Promise.resolve();
  });
}

function renderOHLC(pair: string, interval: OHLCInterval = 60) {
  return renderHook((props) => useOHLC({ ...props, autoRefresh: false }), {
    initialProps: { pair, interval },
  });
}

beforeEach(() => {
  pending.length = 0;
});

describe('useOHLC', () => {
  it('clearsCandles_whenPairChanges', async () => {
    const { result, rerender } = renderOHLC('XBTUSD');
    await respond('XBTUSD', 60000);
    expect(result.current.candles).toHaveLength(1);

    rerender({ pair: 'ETHUSD', interval: 60 });

    expect(result.current.candles).toHaveLength(0);
    expect(result.current.loading).toBe(true);
  });

  it('keepsCandles_whenIntervalChanges', async () => {
    const { result, rerender } = renderOHLC('XBTUSD');
    await respond('XBTUSD', 60000);

    rerender({ pair: 'XBTUSD', interval: 240 });

    expect(result.current.candles[0]?.close).toBe(60000);
  });

  it('ignoresOldPairResponse_whenItArrivesAfterSwitch', async () => {
    const { result, rerender } = renderOHLC('XBTUSD');

    rerender({ pair: 'ETHUSD', interval: 60 });
    await respond('XBTUSD', 60000);

    expect(result.current.candles).toHaveLength(0);
    expect(result.current.loading).toBe(true);

    await respond('ETHUSD', 3000);

    await waitFor(() => {
      expect(result.current.candles[0]?.close).toBe(3000);
    });
  });
});
