import { useEffect, useState } from 'react';
import { subscribeToOrderBook } from '../services/kraken-ws-service';
import {
  mapOrderBook,
  mergeOrderBookUpdate,
} from '../mappers/order-book-mapper';
import { toError } from '../utils/error-utils';
import type { OrderBook } from '../domain/OrderBook';
import type { Subscription } from 'rxjs';

const RETRY_DELAY_MS = 5000;

export type OrderBookState = {
  orderBook: OrderBook | null;
  loading: boolean;
  error: Error | null;
};

/**
 * Business hook: Subscribe to real-time order book updates for given symbol
 * Automatically manages WebSocket subscription lifecycle
 * Handles snapshot (initial) and incremental update messages
 * Auto-retries on error
 *
 * @param symbol Trading pair symbol (e.g., "BTC/USD") or null
 * @param depth Number of price levels to subscribe to (10, 25, 100, 500, 1000)
 * @returns Order book state with loading and error handling
 */
export function useOrderBook(
  symbol: string | null,
  depth: 10 | 25 | 100 | 500 | 1000 = 10,
): OrderBookState {
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!symbol) {
      return;
    }

    let isMounted = true;
    let retryTimeout: NodeJS.Timeout | null = null;
    let subscription: Subscription | null = null;

    // WebSocket subscription legitimately requires setting loading state
    // This syncs React state with external WebSocket system
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    const subscribe = () => {
      // Clean up previous subscription before creating new one
      if (subscription) {
        subscription.unsubscribe();
        subscription = null;
      }

      subscription = subscribeToOrderBook([symbol], depth).subscribe({
        next: (update) => {
          if (!isMounted) return;

          const bookData = update.data[0];

          if (update.type === 'snapshot') {
            // Initial snapshot: full order book
            const newOrderBook = mapOrderBook(bookData);
            setOrderBook(newOrderBook);
            setLoading(false);
            setError(null);
          } else {
            // Incremental update: merge with existing order book
            setOrderBook((current) => {
              if (!current) {
                // Safety: if we get update before snapshot, ignore it
                return null;
              }
              return mergeOrderBookUpdate(current, bookData);
            });
          }
        },
        error: (err) => {
          if (!isMounted) return;

          setLoading(false);
          setError(toError(err));

          // Auto-retry after delay
          retryTimeout = setTimeout(() => {
            if (!isMounted) return;

            setLoading(true);
            setError(null);
            subscribe();
          }, RETRY_DELAY_MS);
        },
      });
    };

    subscribe();

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
        subscription = null;
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
        retryTimeout = null;
      }
    };
  }, [symbol, depth]);

  return { orderBook, loading, error };
}
