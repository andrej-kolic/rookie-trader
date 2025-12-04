import { useEffect, useState } from 'react';
import { subscribeToTicker } from '../../services/kraken-ws-service';
import { mapTicker } from '../../mappers/ticker-mapper';
import type { Ticker } from '../../domain/Ticker';
import type { Subscription } from 'rxjs';

const RETRY_DELAY_MS = 5000;

export type TickerState = {
  ticker: Ticker | null;
  loading: boolean;
  error: Error | null;
};

/**
 * Business hook: Subscribe to real-time ticker updates for given symbol
 * Automatically manages WebSocket subscription lifecycle
 * Auto-retries on error, keeps last ticker while loading new pair
 *
 * @param wsname Trading pair WebSocket name (e.g., "XBT/USD") or null
 * @returns Ticker state with loading and error handling
 */
export function useTicker(wsname: string | null): TickerState {
  const [ticker, setTicker] = useState<Ticker | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!wsname) {
      return;
    }

    // WebSocket subscription legitimately requires setting loading state
    // This syncs React state with external WebSocket system
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    let retryTimeout: NodeJS.Timeout | null = null;
    let subscription: Subscription | null = null;

    const subscribe = () => {
      subscription = subscribeToTicker([wsname]).subscribe({
        next: (update) => {
          const tickerData = update.data[0];

          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (!tickerData) return;

          const domainTicker = mapTicker(tickerData);
          setTicker(domainTicker);
          setLoading(false);
          setError(null);
        },
        error: (err) => {
          setLoading(false);
          setError(err instanceof Error ? err : new Error(String(err)));

          // Auto-retry after 5 seconds
          retryTimeout = setTimeout(() => {
            setLoading(true);
            setError(null);
            subscribe();
          }, RETRY_DELAY_MS);
        },
      });
    };

    subscribe();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [wsname]);

  return { ticker, loading, error };
}
