import { memo } from 'react';

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

const ROOT =
  'h-full w-full grow overflow-hidden rounded-lg border font-system max-[480px]:max-w-full';
const NORMAL = 'border-border bg-surface';
const HEADER = 'border-b border-border bg-raised p-4';
const COLUMN_HEADERS =
  'grid grid-cols-3 gap-2 text-xs font-medium tracking-[0.05em] text-muted uppercase max-[480px]:text-[0.6875rem]';
const COLUMN_HEADER = 'text-right first:text-left';
const LEVEL =
  'relative z-1 grid grid-cols-3 gap-2 px-4 py-1.5 text-[0.8125rem] tabular-nums transition-colors duration-150 hover:bg-white/5 max-[480px]:px-3 max-[480px]:text-xs';
const PRICE = 'text-left font-medium';
const QUANTITY = 'text-right text-xs text-ink';
const TOTAL = 'text-right text-xs text-muted';
const DEPTH_BAR =
  'pointer-events-none absolute top-0 right-0 -z-1 h-full w-(--depth-percentage) bg-linear-to-l opacity-[0.53]';
const SPREAD =
  'flex items-center justify-center gap-2 border-y border-border bg-raised px-4 py-2.5 text-[0.8125rem] font-medium';
const EMPTY = 'px-4 py-8 text-center text-sm text-dim';
const SKELETON = 'skeleton h-4 rounded';

const _orderBookDisplay = function OrderBookDisplay(
  props: OrderBookDisplayProps,
) {
  const { bids, asks, spread, spreadPct, loading, error } = props;

  if (error) {
    return (
      <div
        className={`${ROOT} border-danger bg-[color-mix(in_oklab,var(--theme-danger)_12%,var(--theme-surface))]`}
      >
        <div className={HEADER}>
          {/* <h3 className="mb-3 text-sm font-semibold text-ink">Order Book</h3> */}
        </div>
        <div className="px-4 py-8 text-center text-sm font-medium text-danger">
          ⚠️ {error}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`${ROOT} ${NORMAL}`}>
        <div className={HEADER}>
          {/* <h3 className="mb-3 text-sm font-semibold text-ink">Order Book</h3> */}
          <div className={COLUMN_HEADERS}>
            <span className={COLUMN_HEADER}>Price</span>
            <span className={COLUMN_HEADER}>Quantity</span>
            <span className={COLUMN_HEADER}>Total</span>
          </div>
        </div>
        <div className="p-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="my-2 flex gap-2">
              <div className={`${SKELETON} w-[60px]`}></div>
              <div className={`${SKELETON} flex-1`}></div>
            </div>
          ))}
        </div>
        {
          <div className={SPREAD}>
            <span className="text-muted">&nbsp;</span>
          </div>
        }
        <div className="p-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="my-2 flex gap-2">
              <div className={`${SKELETON} w-[60px]`}></div>
              <div className={`${SKELETON} flex-1`}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasData = asks.length > 0 || bids.length > 0;

  return (
    <div className={`${ROOT} ${NORMAL}`}>
      <div className={HEADER}>
        {/* <h3 className="mb-3 text-sm font-semibold text-ink">Order Book - {symbol}</h3> */}
        <div className={COLUMN_HEADERS}>
          <span className={COLUMN_HEADER}>Price</span>
          <span className={COLUMN_HEADER}>Quantity</span>
          <span className={COLUMN_HEADER}>Total</span>
        </div>
      </div>

      <div className="max-h-[600px] overflow-y-auto">
        {/* Asks (sell orders) - lowest price at bottom */}
        <div className="relative">
          {asks.length > 0 ? (
            asks.map((ask, index) => (
              <div
                key={index}
                className={LEVEL}
                style={
                  {
                    '--depth-percentage': `${ask.depthPercentage}%`,
                  } as React.CSSProperties
                }
              >
                <span className={`${PRICE} text-fall`}>{ask.price}</span>
                <span className={QUANTITY}>{ask.quantity}</span>
                <span className={TOTAL} title={`Cumulative: ${ask.total}`}>
                  {ask.total}
                </span>
                <div className={`${DEPTH_BAR} from-fall to-fall/20`}></div>
              </div>
            ))
          ) : (
            <div className={EMPTY}>No asks</div>
          )}
        </div>

        {/* Spread */}
        {spread && spreadPct && (
          <div className={SPREAD}>
            <span className="text-muted">Spread:</span>
            <span className="text-ink tabular-nums">
              {spread} ({spreadPct})
            </span>
          </div>
        )}

        {/* Bids (buy orders) - highest price at top */}
        <div className="relative">
          {bids.length > 0 ? (
            bids.map((bid, index) => (
              <div
                key={index}
                className={LEVEL}
                style={
                  {
                    '--depth-percentage': `${bid.depthPercentage}%`,
                  } as React.CSSProperties
                }
              >
                <span className={`${PRICE} text-rise`}>{bid.price}</span>
                <span className={QUANTITY}>{bid.quantity}</span>
                <span className={TOTAL} title={`Cumulative: ${bid.total}`}>
                  {bid.total}
                </span>
                <div className={`${DEPTH_BAR} from-rise to-rise/20`}></div>
              </div>
            ))
          ) : (
            <div className={EMPTY}>No bids</div>
          )}
        </div>

        {!hasData && (
          <div className={EMPTY}>Select a trading pair to view order book</div>
        )}
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
