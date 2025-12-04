import { useEffect, useState } from 'react';
import type { Subscription } from 'rxjs';
import { subscribeToInstrument } from '../../services/kraken-ws-service';
import { mapInstrumentPairs } from '../../mappers/instrument-mapper';
import type { TradingPair } from '../../domain/TradingPair';

export type TradingPairsState = {
  pairs: Map<string, TradingPair>;
  loading: boolean;
  error: Error | null;
};

/**
 * Hook to fetch and manage trading pairs from Kraken WebSocket instrument channel
 * Subscribes to instrument channel on mount and maintains real-time pair data
 */
export function useTradingPairs(): TradingPairsState {
  const [pairs, setPairs] = useState<Map<string, TradingPair>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let subscription: Subscription | null = null;
    let isMounted = true;

    // Small delay to prevent StrictMode double-mount issues
    const timeoutId = setTimeout(() => {
      if (!isMounted) return;

      subscription = subscribeToInstrument(true).subscribe({
        next: (update) => {
          if (!isMounted) return;

          const { pairs: pairData } = update.data;

          if (update.type === 'snapshot') {
            // Initial snapshot - replace all pairs
            const pairMap = mapInstrumentPairs(pairData);
            setPairs(pairMap);
            setLoading(false);
            setError(null);
          } else {
            // Update - merge changes
            setPairs((prev) => {
              const updated = new Map(prev);
              const changes = mapInstrumentPairs(pairData);
              changes.forEach((pair, symbol) => {
                updated.set(symbol, pair);
              });
              return updated;
            });
          }
        },
        error: (err: unknown) => {
          if (!isMounted) return;
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        },
      });
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, []);

  return { pairs, loading, error };
}
