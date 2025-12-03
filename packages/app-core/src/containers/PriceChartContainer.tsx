import { useState } from 'react';
import { PriceChart } from '@repo/ui';
import { useOHLC } from '../hooks/use-ohlc';
import { useTradingStore } from '../state/trading-store';
import type { OHLCInterval } from '../services/kraken-rest-service';

export function PriceChartContainer() {
  const selectedPair = useTradingStore((state) => state.selectedPair);
  const [interval, setInterval] = useState<OHLCInterval>(60); // Default 1h

  const { candles, loading, error, refetch } = useOHLC({
    pair: selectedPair?.id ?? '',
    interval,
    autoRefresh: true,
  });

  // Handle interval change
  const handleIntervalChange = (newInterval: OHLCInterval) => {
    setInterval(newInterval);
  };

  if (!selectedPair) {
    return (
      <PriceChart
        candles={[]}
        loading={false}
        error={null}
        symbol=""
        interval={interval}
        onIntervalChange={handleIntervalChange}
        onRefresh={refetch}
      />
    );
  }

  // Convert domain models to chart data format
  const chartCandles = candles.map((candle) => candle.toChartData());
  const volumeData = candles.map((candle) => candle.toVolumeData());

  return (
    <PriceChart
      candles={chartCandles}
      volumeData={volumeData}
      loading={loading}
      error={error?.message ?? null}
      symbol={selectedPair.getDisplayName()}
      interval={interval}
      onIntervalChange={handleIntervalChange}
      onRefresh={refetch}
    />
  );
}
