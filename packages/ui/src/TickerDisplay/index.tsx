import { memo } from 'react';

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

const ROOT =
  'flex w-full max-w-full min-w-0 items-center overflow-x-auto overflow-y-hidden rounded-lg border px-6 py-4 font-system whitespace-nowrap scroll-smooth [scrollbar-color:var(--theme-line)_transparent] [scrollbar-width:thin] max-md:gap-4 max-md:px-4 max-md:py-3 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-[3px] [&::-webkit-scrollbar-thumb]:bg-line [&::-webkit-scrollbar-thumb:hover]:bg-muted [&::-webkit-scrollbar-track]:bg-transparent';
const NORMAL = 'gap-6 border-border bg-surface';
const SECTION = 'flex shrink-0 flex-col gap-1 max-md:min-w-[100px]';
const LABEL = 'text-xs font-medium tracking-[0.05em] text-muted uppercase';
const VALUE = 'text-sm font-medium text-ink tabular-nums';
const QTY = 'text-xs font-normal text-dim';
const SKELETON = 'skeleton h-5 rounded';

const _tickerDisplay = function TickerDisplay(props: TickerDisplayProps) {
  const {
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
      <div
        className={`${ROOT} justify-center gap-6 border-danger bg-[color-mix(in_oklab,var(--theme-danger)_12%,var(--theme-surface))]`}
      >
        <span className="text-sm font-medium text-danger">⚠️ {error}</span>
      </div>
    );
  }

  if (loading && !lastPrice) {
    return (
      <div className={`${ROOT} gap-8 border-border bg-surface`}>
        <div className={`${SKELETON} w-[120px]`}></div>
        <div className={`${SKELETON} w-20`}></div>
        <div className={`${SKELETON} w-20`}></div>
        <div className={`${SKELETON} w-20`}></div>
      </div>
    );
  }

  const changeColor = isPriceRising ? 'text-rise' : 'text-fall';

  return (
    <div
      className={`${ROOT} ${NORMAL} ${loading ? 'pointer-events-none opacity-60 transition-opacity duration-200 ease-in-out' : ''}`}
    >
      <div className={SECTION}>
        <span className={LABEL}>Last</span>
        <span className={VALUE}>{lastPrice ?? '—'}</span>
      </div>

      {changePct && (
        <div className={SECTION}>
          <span className={LABEL}>24h Change</span>
          <span
            className={`inline-block rounded text-sm font-semibold tabular-nums ${changeColor}`}
          >
            {changePct}
          </span>
        </div>
      )}

      <div className={SECTION}>
        <span className={LABEL}>24h Volume</span>
        <span className={VALUE}>{volume24h ?? '—'}</span>
      </div>

      <div className={SECTION}>
        <span className={LABEL}>24h High</span>
        <span className={VALUE}>{high24h ?? '—'}</span>
      </div>

      <div className={SECTION}>
        <span className={LABEL}>24h Low</span>
        <span className={VALUE}>{low24h ?? '—'}</span>
      </div>

      <div className={SECTION}>
        <span className={LABEL}>Bid</span>
        <span className={VALUE}>
          {bid ?? '—'}
          {bidQty && <span className={QTY}> ({bidQty})</span>}
        </span>
      </div>

      <div className={SECTION}>
        <span className={LABEL}>Ask</span>
        <span className={VALUE}>
          {ask ?? '—'}
          {askQty && <span className={QTY}> ({askQty})</span>}
        </span>
      </div>
    </div>
  );
};

/**
 * Generic ticker display component
 * Shows real-time market data in a horizontal bar layout
 */
export const TickerDisplay = memo(_tickerDisplay, (prevProps, nextProps) => {
  // Only re-render if values actually change
  return (
    prevProps.symbol === nextProps.symbol &&
    prevProps.lastPrice === nextProps.lastPrice &&
    prevProps.bid === nextProps.bid &&
    prevProps.bidQty === nextProps.bidQty &&
    prevProps.ask === nextProps.ask &&
    prevProps.askQty === nextProps.askQty &&
    prevProps.high24h === nextProps.high24h &&
    prevProps.low24h === nextProps.low24h &&
    prevProps.volume24h === nextProps.volume24h &&
    prevProps.changePct === nextProps.changePct &&
    prevProps.isPriceRising === nextProps.isPriceRising &&
    prevProps.loading === nextProps.loading &&
    prevProps.error === nextProps.error
  );
});
