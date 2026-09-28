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
/** Levels fetched per side; the panel shows as many of them as fit */
const DEPTH = 25;

export function OrderBookDisplayContainer() {
  const selectedPair = useTradingStore((state) => state.selectedPair);
  const { orderBook, loading, error } = useOrderBook(
    selectedPair?.symbol ?? null,
    DEPTH,
  );

  // Levels per side that fit the panel, reported by OrderBookDisplay
  const [fitRows, setFitRows] = useState(10);
  const rows = Math.min(fitRows, DEPTH);

  // Track maximum depth to prevent bars from shrinking over time
  const [maxDepth, setMaxDepth] = useState<{
    bid: number;
    ask: number;
    symbol: string;
    rows: number;
  }>({
    bid: 1,
    ask: 1,
    symbol: '',
    rows,
  });

  // Max over the visible levels only, so the deepest visible row fills its bar
  const currentMaxBidTotal = useMemo(
    () => (orderBook ? getMaxCumulativeTotal(orderBook.getBidDepth(rows)) : 0),
    [orderBook, rows],
  );
  const currentMaxAskTotal = useMemo(
    () => (orderBook ? getMaxCumulativeTotal(orderBook.getAskDepth(rows)) : 0),
    [orderBook, rows],
  );

  // Update rolling max when symbol or visible row count changes, or depth increases
  const sameView =
    orderBook !== null &&
    maxDepth.symbol === orderBook.symbol &&
    maxDepth.rows === rows;
  if (
    orderBook &&
    (!sameView ||
      currentMaxBidTotal > maxDepth.bid ||
      currentMaxAskTotal > maxDepth.ask)
  ) {
    setMaxDepth({
      bid: sameView
        ? Math.max(maxDepth.bid, currentMaxBidTotal)
        : currentMaxBidTotal,
      ask: sameView
        ? Math.max(maxDepth.ask, currentMaxAskTotal)
        : currentMaxAskTotal,
      symbol: orderBook.symbol,
      rows,
    });
  }

  const displayProps: OrderBookDisplayProps = useMemo(() => {
    // No pair yet: markets are still loading (a pair is always set once they have)
    if (!selectedPair) {
      return {
        symbol: '',
        bids: [],
        asks: [],
        loading: true,
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

    const bids = orderBook.getBidDepth(rows).map(
      (bid): OrderBookLevelProps => ({
        price: bid.formatPrice(selectedPair.pricePrecision),
        quantity: bid.formatQuantity(selectedPair.qtyPrecision),
        total: bid.formatTotal(selectedPair.qtyPrecision),
        depthPercentage:
          maxDepth.bid > 0 ? (bid.total / maxDepth.bid) * 100 : 0,
      }),
    );

    const asks = orderBook
      .getAskDepth(rows)
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
  }, [orderBook, selectedPair, loading, error, maxDepth, rows]);

  return <OrderBookDisplay {...displayProps} onRowsFit={setFitRows} />;
}
