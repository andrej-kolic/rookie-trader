import './styles.css';

export type OrderBookLevelProps = {
  price: string;
  quantity: string;
  total: string;
  depthPercentage: number; // 0-100 for depth bar visualization
};

export type OrderBookDisplayProps = {
  symbol: string;
  bids: OrderBookLevelProps[];
  asks: OrderBookLevelProps[];
  spread?: string;
  spreadPct?: string;
  loading?: boolean;
  error?: string;
};

/**
 * Generic order book display component
 * Shows real-time bid/ask levels in a stacked vertical layout
 */
export function OrderBookDisplay(props: OrderBookDisplayProps) {
  const { symbol, bids, asks, spread, spreadPct, loading, error } = props;

  if (error) {
    return (
      <div className="order-book-display order-book-display--error">
        <div className="order-book-display__header">
          <h3 className="order-book-display__title">Order Book</h3>
        </div>
        <div className="order-book-display__error">⚠️ {error}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="order-book-display order-book-display--loading">
        <div className="order-book-display__header">
          <h3 className="order-book-display__title">Order Book</h3>
        </div>
        <div className="order-book-display__skeleton-grid">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="order-book-display__skeleton-row">
              <div className="order-book-display__skeleton order-book-display__skeleton--short"></div>
              <div className="order-book-display__skeleton order-book-display__skeleton--medium"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasData = asks.length > 0 || bids.length > 0;

  return (
    <div className="order-book-display">
      <div className="order-book-display__header">
        <h3 className="order-book-display__title">Order Book - {symbol}</h3>
        <div className="order-book-display__column-headers">
          <span className="order-book-display__column-header">Price</span>
          <span className="order-book-display__column-header">Quantity</span>
          <span className="order-book-display__column-header">Total</span>
        </div>
      </div>

      <div className="order-book-display__book">
        {/* Asks (sell orders) - lowest price at bottom */}
        <div className="order-book-display__asks">
          {asks.length > 0 ? (
            [...asks].reverse().map((ask, index) => (
              <div
                key={`ask-${ask.price}-${index}`}
                className="order-book-display__level order-book-display__level--ask"
                style={
                  {
                    '--depth-percentage': `${ask.depthPercentage}%`,
                  } as React.CSSProperties
                }
              >
                <span className="order-book-display__price order-book-display__price--ask">
                  {ask.price}
                </span>
                <span className="order-book-display__quantity">
                  {ask.quantity}
                </span>
                <span
                  className="order-book-display__total"
                  title={`Cumulative: ${ask.total}`}
                >
                  {ask.total}
                </span>
                <div className="order-book-display__depth-bar order-book-display__depth-bar--ask"></div>
              </div>
            ))
          ) : (
            <div className="order-book-display__empty">No asks</div>
          )}
        </div>

        {/* Spread */}
        {spread && spreadPct && (
          <div className="order-book-display__spread">
            <span className="order-book-display__spread-label">Spread:</span>
            <span className="order-book-display__spread-value">
              {spread} ({spreadPct})
            </span>
          </div>
        )}

        {/* Bids (buy orders) - highest price at top */}
        <div className="order-book-display__bids">
          {bids.length > 0 ? (
            bids.map((bid, index) => (
              <div
                key={`bid-${bid.price}-${index}`}
                className="order-book-display__level order-book-display__level--bid"
                style={
                  {
                    '--depth-percentage': `${bid.depthPercentage}%`,
                  } as React.CSSProperties
                }
              >
                <span className="order-book-display__price order-book-display__price--bid">
                  {bid.price}
                </span>
                <span className="order-book-display__quantity">
                  {bid.quantity}
                </span>
                <span
                  className="order-book-display__total"
                  title={`Cumulative: ${bid.total}`}
                >
                  {bid.total}
                </span>
                <div className="order-book-display__depth-bar order-book-display__depth-bar--bid"></div>
              </div>
            ))
          ) : (
            <div className="order-book-display__empty">No bids</div>
          )}
        </div>

        {!hasData && (
          <div className="order-book-display__empty-state">
            Select a trading pair to view order book
          </div>
        )}
      </div>
    </div>
  );
}
