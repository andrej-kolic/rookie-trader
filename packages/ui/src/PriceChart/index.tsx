import { memo } from 'react';
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

const INTERVAL_BUTTON =
  'cursor-pointer rounded border-none px-3 py-1.5 text-[13px] font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 max-md:flex-1 max-md:px-1.5 max-md:py-2 max-md:text-xs';
const INTERVAL_ACTIVE = 'bg-accent text-on-accent';
const INTERVAL_IDLE =
  'bg-transparent text-muted enabled:hover:bg-border enabled:hover:text-ink';

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

  return (
    <div
      ref={chartContainerRef}
      className="relative min-h-[300px] w-full max-w-full flex-1 overflow-hidden bg-surface *:max-w-full! [&_canvas]:max-w-full!"
    />
  );
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
  // Empty state
  if (!symbol) {
    return (
      <div className="flex h-full grow items-center justify-center rounded-lg bg-surface">
        <p className="m-0 text-sm text-muted">
          Select a trading pair to view price chart
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-full grow flex-col items-center justify-center gap-3 rounded-lg bg-surface p-6">
        <p className="m-0 text-sm font-semibold text-danger">
          Failed to load chart data
        </p>
        <p className="m-0 max-w-[400px] text-center text-[13px] text-muted">
          {error}
        </p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="mt-2 cursor-pointer rounded-md border-none bg-accent px-4 py-2 text-[13px] font-medium text-on-accent transition-colors duration-200 hover:bg-accent-hover"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg bg-surface">
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-raised px-4 py-3 max-md:flex-col max-md:items-start max-md:gap-3">
        <div className="flex items-center gap-3">
          <h3 className="m-0 text-base font-semibold text-ink">{symbol}</h3>
          {loading && (
            <span className="animate-pulse text-xs text-muted">Loading...</span>
          )}
        </div>
        <div className="flex items-center gap-3 max-md:w-full max-md:flex-col max-md:gap-2">
          <div className="flex gap-1 rounded-md bg-surface p-1 max-md:w-full max-md:justify-between">
            {INTERVALS.map(({ value, label }) => (
              <button
                key={value}
                className={`${INTERVAL_BUTTON} ${interval === value ? INTERVAL_ACTIVE : INTERVAL_IDLE}`}
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
              className="cursor-pointer rounded-md border border-border bg-surface px-2.5 py-1.5 text-base text-muted transition-all duration-200 enabled:hover:bg-border enabled:hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 max-md:w-full"
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

export const PriceChart = memo(_priceChart, (prevProps, nextProps) => {
  // Custom comparison - return true to SKIP re-render, false to re-render
  // Always re-render if candles reference changed (data update)
  if (prevProps.candles !== nextProps.candles) {
    return false;
  }
  // Re-render if other key props changed
  if (
    prevProps.symbol !== nextProps.symbol ||
    prevProps.interval !== nextProps.interval ||
    prevProps.loading !== nextProps.loading ||
    prevProps.error !== nextProps.error ||
    prevProps.volumeData !== nextProps.volumeData
  ) {
    return false;
  }
  return true; // Props same, skip re-render
});
