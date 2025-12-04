import { useState, useEffect, useCallback, useRef } from 'react';
import type { PublicRestTypes } from 'ts-kraken';
import { fetchOHLC, type OHLCInterval } from '../services/kraken-rest-service';
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
  const candlesRef = useRef<Candle[]>([]);

  // Keep ref in sync with state
  useEffect(() => {
    candlesRef.current = candles;
  }, [candles]);

  /**
   * Fetch OHLC data
   * @param incremental - If true, use 'since' parameter for incremental update
   */
  const fetchData = useCallback(
    async (incremental = false) => {
      if (!pair) return;

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

        // ts-kraken returns data directly, not wrapped in result/error
        const { candles: newCandles, last } = mapOHLCResponse(
          response as unknown as PublicRestTypes.PublicRestEndpoints.OHLC.Result,
        );

        if (newCandles.length === 0) {
          throw new Error(`No candle data found for pair: ${pair}`);
        }

        if (incremental && candlesRef.current.length > 0) {
          // Merge new data with existing candles
          setCandles((prev) => mergeCandles(prev, newCandles));
        } else {
          // Full replacement on initial load or interval change
          setCandles(newCandles);
        }

        setLastTimestamp(last);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to fetch OHLC data'),
        );
      } finally {
        setLoading(false);
      }
    },
    [pair, interval, lastTimestamp],
  );

  // Initial fetch and full refetch on pair/interval change
  useEffect(() => {
    // Don't clear candles immediately - keep previous data visible during load
    setLastTimestamp(0);
    setLoading(true);
    void fetchData(false);
  }, [pair, interval, fetchData]);

  // Auto-refresh with incremental updates
  useEffect(() => {
    if (!autoRefresh || !pair) return undefined;

    const refreshInterval = getRefreshInterval(interval);
    const timer = setInterval(() => {
      void fetchData(true); // Incremental update
    }, refreshInterval);

    return () => {
      clearInterval(timer);
    };
  }, [autoRefresh, interval, pair, fetchData]);

  const refetch = useCallback(() => {
    void fetchData(false);
  }, [fetchData]);

  return {
    candles,
    loading,
    error,
    refetch,
  };
}
