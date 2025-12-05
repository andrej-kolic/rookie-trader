import { useEffect, useState, useRef } from 'react';
import { subscribeToOrderBook } from '../services/kraken-ws-service';
import {
  mapOrderBook,
  mergeOrderBookUpdate,
} from '../mappers/order-book-mapper';
import { toError } from '../utils/error-utils';
import type { OrderBook } from '../domain/OrderBook';
import type { Subscription } from 'rxjs';

const RETRY_DELAY_MS = 5000;
const THROTTLE_MS = 500; // Max 2 updates per second

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

  // Use ref to maintain latest state for throttling
  // We must process EVERY update to keep the book valid, but we only render occasionally
  const orderBookRef = useRef<OrderBook | null>(null);

  useEffect(() => {
    if (!symbol) {
      return;
    }

    let isMounted = true;
    let retryTimeout: NodeJS.Timeout | null = null;
    let subscription: Subscription | null = null;
    let pendingUpdateTimeout: NodeJS.Timeout | null = null;
    let lastUpdate = 0;

    // WebSocket subscription legitimately requires setting loading state
    // This syncs React state with external WebSocket system
    setLoading(true);
    setError(null);
    orderBookRef.current = null;

    const flushUpdate = () => {
      if (orderBookRef.current && isMounted) {
        setOrderBook(orderBookRef.current);
        lastUpdate = Date.now();
      }
      pendingUpdateTimeout = null;
    };

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
            orderBookRef.current = newOrderBook;

            // Always update immediately on snapshot
            setOrderBook(newOrderBook);
            lastUpdate = Date.now();

            setLoading(false);
            setError(null);
          } else {
            // Incremental update: merge with existing order book
            if (!orderBookRef.current) {
              // Safety: if we get update before snapshot, ignore it
              return;
            }

            // 1. Update internal model (CRITICAL: Must happen for every message)
            orderBookRef.current = mergeOrderBookUpdate(
              orderBookRef.current,
              bookData,
              depth,
            );

            // 2. Throttle UI updates
            const now = Date.now();
            if (now - lastUpdate >= THROTTLE_MS) {
              // If enough time passed, update immediately
              if (pendingUpdateTimeout) {
                clearTimeout(pendingUpdateTimeout);
                pendingUpdateTimeout = null;
              }
              setOrderBook(orderBookRef.current);
              lastUpdate = now;
            } // Schedule a trailing update if not already scheduled
            else
              pendingUpdateTimeout ??= setTimeout(
                flushUpdate,
                THROTTLE_MS - (now - lastUpdate),
              );
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
      if (pendingUpdateTimeout) {
        clearTimeout(pendingUpdateTimeout);
        pendingUpdateTimeout = null;
      }
    };
  }, [symbol, depth]);

  return { orderBook, loading, error };
}
