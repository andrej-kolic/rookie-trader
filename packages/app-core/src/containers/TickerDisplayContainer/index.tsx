import { useMemo } from 'react';
import { TickerDisplay, type TickerDisplayProps } from '@repo/ui';
import { useTicker } from '../../hooks/use-ticker';
import { useTradingStore } from '../../state/trading-store';

/**
 * Container component for ticker display
 * Connects business layer (useTicker hook) to presentation layer (TickerDisplay)
 * Maps domain model to UI props
 */
export function TickerDisplayContainer() {
  const selectedPair = useTradingStore((state) => state.selectedPair);
  const { ticker, loading, error } = useTicker(selectedPair?.symbol ?? null);

  const displayProps: TickerDisplayProps = useMemo(() => {
    // No pair selected
    if (!selectedPair) {
      return {
        symbol: 'No pair selected',
        loading: false,
      };
    }

    // Error state
    if (error) {
      return {
        symbol: selectedPair.getDisplayName(),
        error: error.message,
      };
    }

    // Loading state (keep last ticker visible if available)
    if (loading && !ticker) {
      return {
        symbol: selectedPair.getDisplayName(),
        loading: true,
      };
    }

    // No ticker data yet
    if (!ticker) {
      return {
        symbol: selectedPair.getDisplayName(),
        loading: true,
      };
    }

    // Map domain model to UI props using TradingPair precision for formatting
    return {
      symbol: ticker.symbol,
      lastPrice: ticker.formatPrice(selectedPair.pricePrecision),
      bid: ticker.formatBid(selectedPair.pricePrecision),
      bidQty: ticker.formatBidQty(selectedPair.qtyPrecision),
      ask: ticker.formatAsk(selectedPair.pricePrecision),
      askQty: ticker.formatAskQty(selectedPair.qtyPrecision),
      high24h: ticker.formatHigh24h(selectedPair.pricePrecision),
      low24h: ticker.formatLow24h(selectedPair.pricePrecision),
      volume24h: ticker.formatVolume(selectedPair.qtyPrecision),
      changePct: ticker.formatChangePct(),
      isPriceRising: ticker.isPriceRising(),
      loading: loading,
    };
  }, [ticker, selectedPair, loading, error]);

  return <TickerDisplay {...displayProps} />;
}
