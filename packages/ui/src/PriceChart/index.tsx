import { usePriceChart } from './usePriceChart';
import './styles.css';

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

export function PriceChart({
  candles,
  volumeData,
  loading,
  error,
  symbol,
  interval,
  onIntervalChange,
  onRefresh,
}: PriceChartProps) {
  // Only initialize chart when we have data
  const shouldRenderChart = candles.length > 0;

  const { chartContainerRef } = usePriceChart({
    symbol: shouldRenderChart ? symbol : '',
    candles,
    volumeData,
  });

  // Empty state
  if (!symbol) {
    return (
      <div className="price-chart-empty">
        <p>Select a trading pair to view price chart</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="price-chart-error">
        <p className="error-message">Failed to load chart data</p>
        <p className="error-detail">{error}</p>
        {onRefresh && (
          <button onClick={onRefresh} className="retry-button">
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="price-chart">
      <div className="chart-header">
        <div className="chart-title">
          <h3>{symbol}</h3>
          {loading && <span className="loading-indicator">Loading...</span>}
        </div>
        <div className="chart-controls">
          <div className="interval-selector">
            {INTERVALS.map(({ value, label }) => (
              <button
                key={value}
                className={interval === value ? 'active' : ''}
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
              className="refresh-button"
              disabled={loading}
              title="Refresh chart data"
            >
              ↻
            </button>
          )}
        </div>
      </div>
      {shouldRenderChart ? (
        <div ref={chartContainerRef} className="chart-container" />
      ) : (
        <div className="chart-loading-placeholder">
          <div className="chart-skeleton-inline">
            <div className="skeleton-bar"></div>
            <div className="skeleton-bar"></div>
            <div className="skeleton-bar"></div>
          </div>
        </div>
      )}
    </div>
  );
}
