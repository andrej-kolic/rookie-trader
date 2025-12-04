import { useMemo, useCallback } from 'react';
import {
  OrderBookDisplay,
  type OrderBookDisplayProps,
  type OrderBookLevelProps,
} from '@repo/ui';
import { useOrderBook } from '../../hooks/use-order-book';
import { useTradingStore } from '../../state/trading-store';
import type { OrderBookLevel } from '../../domain/OrderBookLevel';

/**
 * Container component for order book display
 * Connects business layer (useOrderBook hook) to presentation layer (OrderBookDisplay)
 * Maps domain model to UI props
 */
export function OrderBookDisplayContainer() {
  const selectedPair = useTradingStore((state) => state.selectedPair);
  const { orderBook, loading, error } = useOrderBook(
    selectedPair?.symbol ?? null,
    10,
  );

  // Memoize the mapper function to prevent recreating it on every render
  const mapLevel = useCallback(
    (level: OrderBookLevel, maxTotal: number): OrderBookLevelProps => ({
      price: level.formatPrice(selectedPair?.pricePrecision ?? 2),
      quantity: level.formatQuantity(selectedPair?.qtyPrecision ?? 8),
      total: level.formatTotal(selectedPair?.qtyPrecision ?? 8),
      depthPercentage: maxTotal > 0 ? (level.total / maxTotal) * 100 : 0,
    }),
    [selectedPair?.pricePrecision, selectedPair?.qtyPrecision],
  );

  // Memoize bids array separately
  const bids = useMemo(() => {
    if (!orderBook || !selectedPair) return [];
    const maxBidTotal = orderBook.bids[orderBook.bids.length - 1]?.total ?? 1;
    return orderBook.getBidDepth(10).map((bid) => mapLevel(bid, maxBidTotal));
  }, [orderBook, selectedPair, mapLevel]);

  // Memoize asks array separately (reversed for display)
  const asks = useMemo(() => {
    if (!orderBook || !selectedPair) return [];
    const maxAskTotal = orderBook.asks[orderBook.asks.length - 1]?.total ?? 1;
    return orderBook
      .getAskDepth(10)
      .map((ask) => mapLevel(ask, maxAskTotal))
      .reverse();
  }, [orderBook, selectedPair, mapLevel]);

  const displayProps: OrderBookDisplayProps = useMemo(() => {
    // No pair selected
    if (!selectedPair) {
      return {
        symbol: 'No pair selected',
        bids: [],
        asks: [],
        loading: false,
      };
    }

    // Error state
    if (error) {
      return {
        symbol: selectedPair.getDisplayName(),
        bids: [],
        asks: [],
        error: error.message,
      };
    }

    // Loading state
    if (loading) {
      return {
        symbol: selectedPair.getDisplayName(),
        bids: [],
        asks: [],
        loading: true,
      };
    }

    // No order book data yet
    if (!orderBook) {
      return {
        symbol: selectedPair.getDisplayName(),
        bids: [],
        asks: [],
        loading: true,
      };
    }

    // Use memoized arrays
    return {
      symbol: orderBook.symbol,
      bids,
      asks,
      spread: orderBook.formatSpread(selectedPair.pricePrecision),
      spreadPct: orderBook.formatSpreadPercentage(),
      loading: false,
    };
  }, [orderBook, selectedPair, loading, error, bids, asks]);

  return <OrderBookDisplay {...displayProps} />;
}
