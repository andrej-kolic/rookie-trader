import { useState, useCallback, useMemo } from 'react';
import { PriceChart } from '@repo/ui';
import { useOHLC } from './use-ohlc';
import { useTradingStore } from '../../state/trading-store';
import type { OHLCInterval } from '../../services/kraken-rest-service';

export function PriceChartContainer() {
  const selectedPair = useTradingStore((state) => state.selectedPair);
  const [interval, setInterval] = useState<OHLCInterval>(60); // Default 1h

  const { candles, loading, error, refetch } = useOHLC({
    pair: selectedPair?.id ?? '',
    interval,
    autoRefresh: true,
  });

  // Handle interval change
  const handleIntervalChange = useCallback((newInterval: OHLCInterval) => {
    setInterval(newInterval);
  }, []);

  // Convert domain models to chart data format
  const chartCandles = useMemo(
    () => candles.map((candle) => candle.toChartData()),
    [candles],
  );
  const volumeData = useMemo(
    () => candles.map((candle) => candle.toVolumeData()),
    [candles],
  );

  // Always render the same component to prevent unmount/remount flickering
  return (
    <PriceChart
      candles={chartCandles}
      volumeData={volumeData}
      loading={loading && candles.length === 0}
      error={error?.message ?? null}
      symbol={selectedPair?.getDisplayName() ?? ''}
      interval={interval}
      onIntervalChange={handleIntervalChange}
      onRefresh={refetch}
    />
  );
}
