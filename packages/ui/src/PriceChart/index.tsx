import { memo } from 'react';
import { Button } from '../Button';
import { priceChart, intervalButton } from './styles';
import { usePriceChart } from './usePriceChart';

export type PriceChartProps = {
  candles: {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
  }[];
  volumeData?: {
    time: number;
    value: number;
    color?: string;
  }[];
  loading: boolean;
  error: string | null;
  symbol: string;
  interval: 1 | 5 | 15 | 30 | 60 | 240 | 1440 | 10080 | 21600;
  onIntervalChange?: (
    interval: 1 | 5 | 15 | 30 | 60 | 240 | 1440 | 10080 | 21600,
  ) => void;
  onRefresh?: () => void;
};

const INTERVALS = [
  { value: 1, label: '1m' },
  { value: 5, label: '5m' },
  { value: 15, label: '15m' },
  { value: 60, label: '1h' },
  { value: 240, label: '4h' },
  { value: 1440, label: '1d' },
  { value: 10080, label: '1w' },
] as const;

type ChartCanvasProps = {
  symbol: string;
  candles: PriceChartProps['candles'];
  volumeData: PriceChartProps['volumeData'];
};

const ChartCanvas = ({ symbol, candles, volumeData }: ChartCanvasProps) => {
  const { chartContainerRef } = usePriceChart({
    symbol,
    candles,
    volumeData,
  });

  return <div ref={chartContainerRef} className={priceChart().canvas()} />;
};

const _priceChart = function PriceChart({
  candles,
  volumeData,
  loading,
  error,
  symbol,
  interval,
  onIntervalChange,
  onRefresh,
}: PriceChartProps) {
  const s = priceChart();

  // Empty state; while markets load there is no symbol yet either
  if (!symbol && !loading) {
    return (
      <div className={s.placeholder()}>
        <p className={s.placeholderText()}>
          Select a trading pair to view price chart
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={s.placeholder()}>
        <p className={s.errorTitle()}>Failed to load chart data</p>
        <p className={s.errorDetail()}>{error}</p>
        {onRefresh && (
          <Button onClick={onRefresh} className="mt-2">
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={s.root()}>
      <div className={s.header()}>
        <div className={s.title()}>
          <h3 className={s.label()}>Chart</h3>
          {loading && <span className={s.loading()}>Loading...</span>}
        </div>
        <div className={s.controls()}>
          <div className={s.intervals()}>
            {INTERVALS.map(({ value, label }) => (
              <button
                key={value}
                className={intervalButton({ active: interval === value })}
                onClick={() => onIntervalChange?.(value)}
                disabled={loading}
              >
                {label}
              </button>
            ))}
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className={s.refresh()}
              disabled={loading}
              title="Refresh chart data"
            >
              ↻
            </button>
          )}
        </div>
      </div>
      <ChartCanvas symbol={symbol} candles={candles} volumeData={volumeData} />
    </div>
  );
};

export const PriceChart = memo(_priceChart);
