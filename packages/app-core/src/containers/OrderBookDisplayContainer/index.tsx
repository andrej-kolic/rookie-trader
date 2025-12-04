import { useMemo } from 'react';
import {
  OrderBookDisplay,
  type OrderBookDisplayProps,
  type OrderBookLevelProps,
} from '@repo/ui';
import { useOrderBook } from './use-order-book';
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

    // Calculate max total for depth percentage
    const maxBidTotal = orderBook.bids[orderBook.bids.length - 1]?.total ?? 1;
    const maxAskTotal = orderBook.asks[orderBook.asks.length - 1]?.total ?? 1;

    // Map domain model to UI props
    return {
      symbol: orderBook.symbol,
      bids: orderBook
        .getBidDepth(10)
        .map((bid) =>
          mapLevelToProps(
            bid,
            maxBidTotal,
            selectedPair.pricePrecision,
            selectedPair.qtyPrecision,
          ),
        ),
      asks: orderBook
        .getAskDepth(10)
        .map((ask) =>
          mapLevelToProps(
            ask,
            maxAskTotal,
            selectedPair.pricePrecision,
            selectedPair.qtyPrecision,
          ),
        ),
      spread: orderBook.formatSpread(selectedPair.pricePrecision),
      spreadPct: orderBook.formatSpreadPercentage(),
      loading: false,
    };
  }, [orderBook, selectedPair, loading, error]);

  return <OrderBookDisplay {...displayProps} />;
}

/**
 * Maps OrderBookLevel domain model to OrderBookLevelProps for UI
 */
function mapLevelToProps(
  level: OrderBookLevel,
  maxTotal: number,
  priceDecimals: number,
  qtyDecimals: number,
): OrderBookLevelProps {
  return {
    price: level.formatPrice(priceDecimals),
    quantity: level.formatQuantity(qtyDecimals),
    total: level.formatTotal(qtyDecimals),
    depthPercentage: maxTotal > 0 ? (level.total / maxTotal) * 100 : 0,
  };
}
