import { publicWsSubscription, type PublicWsTypes } from 'ts-kraken';
import type { Observable } from 'rxjs';

export type TickerUpdate = PublicWsTypes.PublicSubscriptionUpdate<'ticker'>;
export type BookUpdate = PublicWsTypes.PublicSubscriptionUpdate<'book'>;

/**
 * Subscribe to ticker updates for specified trading pair symbols
 * Returns RxJS Observable that emits on every price update
 *
 * @param symbols Array of wsname symbols (e.g., ["XBT/USD", "ETH/USD"])
 * @returns Observable stream of ticker updates
 */
export function subscribeToTicker(symbols: string[]): Observable<TickerUpdate> {
  return publicWsSubscription({
    channel: 'ticker',
    params: { symbol: symbols },
  });
}

/**
 * Subscribe to order book updates for specified trading pair symbols
 * Returns RxJS Observable that emits snapshots and incremental updates
 *
 * @param symbols Array of wsname symbols (e.g., ["XBT/USD"])
 * @param depth Number of price levels (10, 25, 100, 500, or 1000)
 * @returns Observable stream of order book updates
 */
export function subscribeToOrderBook(
  symbols: string[],
  depth: 10 | 25 | 100 | 500 | 1000 = 10,
): Observable<BookUpdate> {
  return publicWsSubscription({
    channel: 'book',
    params: { symbol: symbols, depth },
  });
}
