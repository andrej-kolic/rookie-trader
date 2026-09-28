import { memo } from 'react';
import { orderBook } from './styles';

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

type Side = 'ask' | 'bid';

function ColumnHeaders() {
  const s = orderBook();
  return (
    <div className={s.columnHeaders()}>
      <span className={s.columnHeader()}>Price</span>
      <span className={s.columnHeader()}>Quantity</span>
      <span className={s.columnHeader()}>Total</span>
    </div>
  );
}

function Level({ level, side }: { level: OrderBookLevelProps; side: Side }) {
  const s = orderBook({ side });
  return (
    <div
      className={s.level()}
      style={
        {
          '--depth-percentage': `${level.depthPercentage}%`,
        } as React.CSSProperties
      }
    >
      <span className={s.price()}>{level.price}</span>
      <span className={s.quantity()}>{level.quantity}</span>
      <span className={s.total()} title={`Cumulative: ${level.total}`}>
        {level.total}
      </span>
      <div className={s.depthBar()}></div>
    </div>
  );
}

function SkeletonRows() {
  const s = orderBook();
  return (
    <div className={s.skeletonGrid()}>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className={s.skeletonRow()}>
          <div className={s.skeletonShort()}></div>
          <div className={s.skeletonLong()}></div>
        </div>
      ))}
    </div>
  );
}

const _orderBookDisplay = function OrderBookDisplay(
  props: OrderBookDisplayProps,
) {
  const { bids, asks, spread, spreadPct, loading, error } = props;
  const s = orderBook({ error: Boolean(error) });

  if (error) {
    return (
      <div className={s.root()}>
        <div className={s.header()}></div>
        <div className={s.message()}>⚠️ {error}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={s.root()} role="status" aria-label="Loading order book">
        <div className={s.header()}>
          <ColumnHeaders />
        </div>
        <SkeletonRows />
        <div className={s.spread()}>
          <span className={s.spreadLabel()}>&nbsp;</span>
        </div>
        <SkeletonRows />
      </div>
    );
  }

  const hasData = asks.length > 0 || bids.length > 0;

  return (
    <div className={s.root()}>
      <div className={s.header()}>
        <ColumnHeaders />
      </div>

      <div className={s.book()}>
        {!hasData && <div className={s.message()}>No orders in the book</div>}

        {/* Asks (sell orders) - lowest price at bottom */}
        <div className={s.side()}>
          {!hasData ? null : asks.length > 0 ? (
            asks.map((ask, index) => (
              <Level key={index} level={ask} side="ask" />
            ))
          ) : (
            <div className={s.message()}>No asks</div>
          )}
        </div>

        {spread && spreadPct && (
          <div className={s.spread()}>
            <span className={s.spreadLabel()}>Spread:</span>
            <span className={s.spreadValue()}>
              {spread} ({spreadPct})
            </span>
          </div>
        )}

        {/* Bids (buy orders) - highest price at top */}
        <div className={s.side()}>
          {!hasData ? null : bids.length > 0 ? (
            bids.map((bid, index) => (
              <Level key={index} level={bid} side="bid" />
            ))
          ) : (
            <div className={s.message()}>No bids</div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Generic order book display component
 * Shows real-time bid/ask levels in a stacked vertical layout
 */
export const OrderBookDisplay = memo(
  _orderBookDisplay,
  (prevProps, nextProps) => {
    // Only re-render if these values change
    return (
      prevProps.symbol === nextProps.symbol &&
      prevProps.loading === nextProps.loading &&
      prevProps.error === nextProps.error &&
      prevProps.spread === nextProps.spread &&
      prevProps.spreadPct === nextProps.spreadPct &&
      prevProps.bids === nextProps.bids && // Reference equality
      prevProps.asks === nextProps.asks // Reference equality
    );
  },
);
