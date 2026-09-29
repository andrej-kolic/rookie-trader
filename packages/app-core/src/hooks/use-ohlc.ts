import {
  useState,
  useEffect,
  useCallback,
  useEffectEvent,
  useRef,
} from 'react';
import { fetchOHLC, type OHLCInterval } from '../api/kraken-rest-api';
import { mapOHLCResponse, mergeCandles } from '../mappers/candle-mapper';
import type { Candle } from '../domain/Candle';

type UseOHLCOptions = {
  pair: string;
  interval: OHLCInterval;
  autoRefresh?: boolean;
};

/**
 * Calculate dynamic refresh interval based on candle timeframe
 * Refreshes at 1/4 of candle duration with 10s min and 5m max
 */
function getRefreshInterval(interval: OHLCInterval): number {
  const intervalMinutes = interval as number;

  // Refresh at 1/4 of candle duration
  const quarterInterval = (intervalMinutes * 60 * 1000) / 4;
  const minInterval = 10000; // 10 seconds minimum
  const maxInterval = 300000; // 5 minutes maximum

  return Math.max(minInterval, Math.min(quarterInterval, maxInterval));
}

export function useOHLC({
  pair,
  interval,
  autoRefresh = true,
}: UseOHLCOptions) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastTimestamp, setLastTimestamp] = useState<number>(0);

  // Candles belong to the pair they were fetched for: drop them on a pair switch
  const [candlesPair, setCandlesPair] = useState(pair);
  if (candlesPair !== pair) {
    setCandlesPair(pair);
    setCandles([]);
    setLoading(true);
  }

  // The latest requested pair and interval; responses for older ones are dropped
  const latestRequest = useRef({ pair, interval });

  /**
   * Event handler that always has access to the latest state values
   * without causing effect re-runs when those values change
   */
  const onFetchData = useEffectEvent(
    async (incremental: boolean): Promise<void> => {
      if (!pair) return;

      const isStale = () =>
        latestRequest.current.pair !== pair ||
        latestRequest.current.interval !== interval;

      try {
        if (!incremental) {
          setLoading(true);
        }
        setError(null);

        const response = await fetchOHLC(
          pair,
          interval,
          incremental ? lastTimestamp : undefined,
        );
        if (isStale()) return;

        const { candles: newCandles, last } = mapOHLCResponse(response);

        if (newCandles.length === 0) {
          throw new Error(`No candle data found for pair: ${pair}`);
        }

        if (incremental && candles.length > 0) {
          // Merge new data with existing candles
          setCandles((prev) => mergeCandles(prev, newCandles));
        } else {
          // Full replacement on initial load or interval change
          setCandles(newCandles);
        }

        setLastTimestamp(last);
      } catch (err) {
        if (isStale()) return;
        setError(
          err instanceof Error ? err : new Error('Failed to fetch OHLC data'),
        );
      } finally {
        if (!isStale()) setLoading(false);
      }
    },
  );

  // Initial fetch and full refetch on pair/interval change
  useEffect(() => {
    // An interval change keeps the pair's candles visible during load
    latestRequest.current = { pair, interval };
    setLastTimestamp(0);
    setLoading(true);
    void onFetchData(false);
  }, [pair, interval]);

  // Auto-refresh with incremental updates
  useEffect(() => {
    if (!autoRefresh || !pair) return undefined;

    const refreshInterval = getRefreshInterval(interval);
    const timer = setInterval(() => {
      void onFetchData(true); // Incremental update
    }, refreshInterval);

    return () => {
      clearInterval(timer);
    };
  }, [autoRefresh, interval, pair]);

  const [shouldRefetch, setShouldRefetch] = useState(0);

  // Handle manual refetch trigger
  useEffect(() => {
    if (shouldRefetch > 0) {
      void onFetchData(false);
    }
  }, [shouldRefetch]);

  const refetch = useCallback(() => {
    setShouldRefetch((prev) => prev + 1);
  }, []);

  return {
    candles,
    loading,
    error,
    refetch,
  };
}
