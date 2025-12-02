import { useEffect, useState } from 'react';
import type { PublicRestTypes } from 'ts-kraken';
import { fetchTradingPairs } from '../services/kraken-rest-service';

type AssetPairsResult = PublicRestTypes.PublicRestEndpoints.AssetPairs.Result;

export type TradingPairsState = {
  pairs: AssetPairsResult | null;
  loading: boolean;
  error: Error | null;
};

/**
 * Hook to fetch and manage trading pairs from Kraken
 * Fetches all available trading pairs on mount
 */
export function useTradingPairs(): TradingPairsState {
  const [pairs, setPairs] = useState<AssetPairsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchTradingPairs()
      .then((result) => {
        if (cancelled) return;

        // ts-kraken publicRestRequest returns the result directly
        setPairs(result);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { pairs, loading, error };
}
