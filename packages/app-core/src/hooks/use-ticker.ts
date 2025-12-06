import { useEffect, useState } from 'react';
import { subscribeToTicker } from '../services/kraken-ws-service';
import { mapTicker } from '../mappers/ticker-mapper';
import { toError } from '../utils/error-utils';
import type { Ticker } from '../domain/Ticker';
import type { Subscription } from 'rxjs';

export type TickerState = {
  ticker: Ticker | null;
  loading: boolean;
  error: Error | null;
};

/**
 * Business hook: Subscribe to real-time ticker updates for given symbol
 * Automatically manages WebSocket subscription lifecycle
 * Keeps last ticker while loading new pair
 *
 * @param symbol Trading pair symbol (e.g., "BTC/USD") or null
 * @returns Ticker state with loading and error handling
 */
export function useTicker(symbol: string | null): TickerState {
  const [ticker, setTicker] = useState<Ticker | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!symbol) {
      return;
    }

    let isMounted = true;
    let subscription: Subscription | null = null;

    // WebSocket subscription legitimately requires setting loading state
    // This syncs React state with external WebSocket system
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    const subscribe = () => {
      // Clean up previous subscription before creating new one
      if (subscription) {
        subscription.unsubscribe();
        subscription = null;
      }

      subscription = subscribeToTicker([symbol]).subscribe({
        next: (update) => {
          if (!isMounted) return;

          const tickerData = update.data[0];

          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (!tickerData) return;

          const domainTicker = mapTicker(tickerData);
          setTicker(domainTicker);
          setLoading(false);
          setError(null);
        },
        error: (err) => {
          if (!isMounted) return;

          setLoading(false);
          setError(toError(err));
        },
      });
    };

    subscribe();

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
        subscription = null;
      }
    };
  }, [symbol]);

  return { ticker, loading, error };
}
