import './styles.css';

export type TickerDisplayProps = {
  symbol: string;
  lastPrice?: string;
  bid?: string;
  bidQty?: string;
  ask?: string;
  askQty?: string;
  high24h?: string;
  low24h?: string;
  volume24h?: string;
  changePct?: string;
  isPriceRising?: boolean;
  loading?: boolean;
  error?: string;
};

/**
 * Generic ticker display component
 * Shows real-time market data in a horizontal bar layout
 */
export function TickerDisplay(props: TickerDisplayProps) {
  const {
    symbol,
    lastPrice,
    bid,
    bidQty,
    ask,
    askQty,
    high24h,
    low24h,
    volume24h,
    changePct,
    isPriceRising,
    loading,
    error,
  } = props;

  if (error) {
    return (
      <div className="ticker-display ticker-display--error">
        <span className="ticker-display__error">⚠️ {error}</span>
      </div>
    );
  }

  if (loading && !lastPrice) {
    return (
      <div className="ticker-display ticker-display--loading">
        <div className="ticker-display__skeleton ticker-display__skeleton--wide"></div>
        <div className="ticker-display__skeleton ticker-display__skeleton--medium"></div>
        <div className="ticker-display__skeleton ticker-display__skeleton--medium"></div>
        <div className="ticker-display__skeleton ticker-display__skeleton--medium"></div>
      </div>
    );
  }

  const changeClass = isPriceRising
    ? 'ticker-display__change--rising'
    : 'ticker-display__change--falling';

  return (
    <div
      className={`ticker-display ${loading ? 'ticker-display--updating' : ''}`}
    >
      <div className="ticker-display__section">
        <span className="ticker-display__label">Last</span>
        <span className="ticker-display__value">{lastPrice ?? '—'}</span>
      </div>

      {changePct && (
        <div className="ticker-display__section">
          <span className="ticker-display__label">24h Change</span>
          <span
            className={`ticker-display__value ticker-display__change ${changeClass}`}
          >
            {changePct}
          </span>
        </div>
      )}

      <div className="ticker-display__section">
        <span className="ticker-display__label">24h Volume</span>
        <span className="ticker-display__value">{volume24h ?? '—'}</span>
      </div>

      <div className="ticker-display__section">
        <span className="ticker-display__label">24h High</span>
        <span className="ticker-display__value">{high24h ?? '—'}</span>
      </div>

      <div className="ticker-display__section">
        <span className="ticker-display__label">24h Low</span>
        <span className="ticker-display__value">{low24h ?? '—'}</span>
      </div>

      <div className="ticker-display__section">
        <span className="ticker-display__label">Bid</span>
        <span className="ticker-display__value">
          {bid ?? '—'}
          {bidQty && <span className="ticker-display__qty"> ({bidQty})</span>}
        </span>
      </div>

      <div className="ticker-display__section">
        <span className="ticker-display__label">Ask</span>
        <span className="ticker-display__value">
          {ask ?? '—'}
          {askQty && <span className="ticker-display__qty"> ({askQty})</span>}
        </span>
      </div>
    </div>
  );
}
