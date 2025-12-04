import { useMemo } from 'react';
import { TickerDisplay, type TickerDisplayProps } from '@repo/ui';
import { useTicker } from '../hooks/use-ticker';
import { useTradingStore } from '../state/trading-store';

/**
 * Container component for ticker display
 * Connects business layer (useTicker hook) to presentation layer (TickerDisplay)
 * Maps domain model to UI props
 */
export function TickerDisplayContainer() {
  const selectedPair = useTradingStore((state) => state.selectedPair);
  const { ticker, loading, error } = useTicker(selectedPair?.wsname ?? null);

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

    // Map domain model to UI props using TradingPair decimals for formatting
    return {
      symbol: ticker.symbol,
      lastPrice: ticker.formatPrice(selectedPair.pairDecimals),
      bid: ticker.formatBid(selectedPair.pairDecimals),
      bidQty: ticker.formatBidQty(selectedPair.lotDecimals),
      ask: ticker.formatAsk(selectedPair.pairDecimals),
      askQty: ticker.formatAskQty(selectedPair.lotDecimals),
      high24h: ticker.formatHigh24h(selectedPair.pairDecimals),
      low24h: ticker.formatLow24h(selectedPair.pairDecimals),
      volume24h: ticker.formatVolume(selectedPair.lotDecimals),
      changePct: ticker.formatChangePct(),
      isPriceRising: ticker.isPriceRising(),
      loading: loading,
    };
  }, [ticker, selectedPair, loading, error]);

  return <TickerDisplay {...displayProps} />;
}
