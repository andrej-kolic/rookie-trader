import {
  publicWsSubscription,
  publicWsStatus$,
  type PublicWsTypes,
} from 'ts-kraken';
import type { Status } from 'ts-kraken/dist/types/ws';
import type { Observable } from 'rxjs';

export type TickerUpdate = PublicWsTypes.PublicSubscriptionUpdate<'ticker'>;
export type BookUpdate = PublicWsTypes.PublicSubscriptionUpdate<'book'>;
export type InstrumentUpdate =
  PublicWsTypes.PublicSubscriptionUpdate<'instrument'>;
export type StatusUpdate = Status.Update;

/**
 * Subscribe to instrument updates (trading pairs and assets reference data)
 * Returns RxJS Observable that emits snapshots and updates of all active pairs
 *
 * @param snapshot Whether to request initial snapshot (default: true)
 * @returns Observable stream of instrument updates
 */
export function subscribeToInstrument(
  snapshot = true,
): Observable<InstrumentUpdate> {
  return publicWsSubscription({
    channel: 'instrument',
    params: { snapshot },
  });
}

/**
 * Subscribe to ticker updates for specified trading pair symbols
 * Returns RxJS Observable that emits on every price update
 *
 * @param symbols Array of symbols (e.g., ["BTC/USD", "ETH/USD"])
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
 * @param symbols Array of symbols (e.g., ["BTC/USD"])
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

/**
 * Subscribe to system status updates
 * Returns RxJS Observable that emits on connection and when trading engine status changes
 * No subscription needed - automatically sent by Kraken on WebSocket connection
 *
 * @returns Observable stream of system status updates
 */
export function subscribeToStatus(): Observable<StatusUpdate> {
  return publicWsStatus$;
}
