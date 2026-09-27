import { memo } from 'react';
import { ticker } from './styles';

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

function Stat({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const s = ticker();
  return (
    <div className={s.stat()}>
      <span className={s.label()}>{label}</span>
      {children}
    </div>
  );
}

function PriceWithQty({ price, qty }: { price?: string; qty?: string }) {
  const s = ticker();
  return (
    <span className={s.value()}>
      {price ?? '—'}
      {qty && <span className={s.qty()}> ({qty})</span>}
    </span>
  );
}

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
    const s = ticker({ state: 'error' });
    return (
      <div className={s.root()}>
        <span className={s.error()}>⚠️ {error}</span>
      </div>
    );
  }

  if (loading && !lastPrice) {
    const s = ticker({ state: 'loading' });
    return (
      <div className={s.root()}>
        <div className={s.skeletonWide()}></div>
        <div className={s.skeleton()}></div>
        <div className={s.skeleton()}></div>
        <div className={s.skeleton()}></div>
      </div>
    );
  }

  const s = ticker({
    state: loading ? 'updating' : 'ready',
    rising: Boolean(isPriceRising),
  });

  return (
    <div className={s.root()}>
      <Stat label="Last">
        <span className={s.value()}>{lastPrice ?? '—'}</span>
      </Stat>

      {changePct && (
        <Stat label="24h Change">
          <span className={s.change()}>{changePct}</span>
        </Stat>
      )}

      <Stat label="24h Volume">
        <span className={s.value()}>{volume24h ?? '—'}</span>
      </Stat>

      <Stat label="24h High">
        <span className={s.value()}>{high24h ?? '—'}</span>
      </Stat>

      <Stat label="24h Low">
        <span className={s.value()}>{low24h ?? '—'}</span>
      </Stat>

      <Stat label="Bid">
        <PriceWithQty price={bid} qty={bidQty} />
      </Stat>

      <Stat label="Ask">
        <PriceWithQty price={ask} qty={askQty} />
      </Stat>
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
