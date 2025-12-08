import { useMemo, useState } from 'react';
import {
  OrderBookDisplay,
  type OrderBookDisplayProps,
  type OrderBookLevelProps,
} from '@repo/ui';
import { useOrderBook } from '../../hooks/use-order-book';
import { useTradingStore } from '../../state/trading-store';
import { getMaxCumulativeTotal } from '../../utils/order-book-utils';

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

  // Track maximum depth to prevent bars from shrinking over time
  const [maxDepth, setMaxDepth] = useState<{
    bid: number;
    ask: number;
    symbol: string;
  }>({
    bid: 1,
    ask: 1,
    symbol: '',
  });

  // Get current max from all levels (outside useMemo to update state)
  const currentMaxBidTotal = useMemo(
    () => (orderBook ? getMaxCumulativeTotal(orderBook.bids) : 0),
    [orderBook],
  );
  const currentMaxAskTotal = useMemo(
    () => (orderBook ? getMaxCumulativeTotal(orderBook.asks) : 0),
    [orderBook],
  );

  // Update rolling max when symbol changes or depth increases
  if (
    orderBook &&
    (maxDepth.symbol !== orderBook.symbol ||
      currentMaxBidTotal > maxDepth.bid ||
      currentMaxAskTotal > maxDepth.ask)
  ) {
    setMaxDepth({
      bid:
        maxDepth.symbol === orderBook.symbol
          ? Math.max(maxDepth.bid, currentMaxBidTotal)
          : currentMaxBidTotal,
      ask:
        maxDepth.symbol === orderBook.symbol
          ? Math.max(maxDepth.ask, currentMaxAskTotal)
          : currentMaxAskTotal,
      symbol: orderBook.symbol,
    });
  }

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

    const bids = orderBook.getBidDepth(10).map(
      (bid): OrderBookLevelProps => ({
        price: bid.formatPrice(selectedPair.pricePrecision),
        quantity: bid.formatQuantity(selectedPair.qtyPrecision),
        total: bid.formatTotal(selectedPair.qtyPrecision),
        depthPercentage:
          maxDepth.bid > 0 ? (bid.total / maxDepth.bid) * 100 : 0,
      }),
    );

    const asks = orderBook
      .getAskDepth(10)
      .map(
        (ask): OrderBookLevelProps => ({
          price: ask.formatPrice(selectedPair.pricePrecision),
          quantity: ask.formatQuantity(selectedPair.qtyPrecision),
          total: ask.formatTotal(selectedPair.qtyPrecision),
          depthPercentage:
            maxDepth.ask > 0 ? (ask.total / maxDepth.ask) * 100 : 0,
        }),
      )
      .reverse(); // Reverse for display (lowest ask at bottom)

    return {
      symbol: orderBook.symbol,
      bids,
      asks,
      spread: orderBook.formatSpread(selectedPair.pricePrecision),
      spreadPct: orderBook.formatSpreadPercentage(),
      loading: false,
    };
  }, [orderBook, selectedPair, loading, error, maxDepth]);

  return <OrderBookDisplay {...displayProps} />;
}
