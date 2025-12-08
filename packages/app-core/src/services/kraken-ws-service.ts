import * as Kraken from 'ts-kraken';
import type { Status, Heartbeat } from 'ts-kraken/dist/types/ws';
import type { Observable } from 'rxjs';
import { retry, share } from 'rxjs/operators';

export type TickerUpdate =
  Kraken.PublicWsTypes.PublicSubscriptionUpdate<'ticker'>;
export type BookUpdate = Kraken.PublicWsTypes.PublicSubscriptionUpdate<'book'>;
export type InstrumentUpdate =
  Kraken.PublicWsTypes.PublicSubscriptionUpdate<'instrument'>;
export type StatusUpdate = Status.Update;

//
// Helper function to add retry and share operators to an observable
//

const RECONNECT_DELAY_MS = 3000;

function withRetryAndShare<T>(source$: Observable<T>): Observable<T> {
  return source$.pipe(
    retry({
      delay: RECONNECT_DELAY_MS,
    }),
    share({ resetOnRefCountZero: false }),
  );
}

//
// instrument
//

const instrumentShared$ = withRetryAndShare(
  Kraken.publicWsSubscription({
    channel: 'instrument',
    params: { snapshot: true },
  }),
);

/**
 * Subscribe to instrument updates (trading pairs and assets reference data)
 * Returns RxJS Observable that emits snapshots and updates of all active pairs
 *
 * @returns Observable stream of instrument updates
 */
export function subscribeToInstrument(): Observable<InstrumentUpdate> {
  // Note: Shared observable always uses snapshot: true for consistency
  return instrumentShared$;
}

//
// ticker
//

const tickerShared$ = new Map<string, Observable<TickerUpdate>>();

/**
 * Subscribe to ticker updates for specified trading pair symbols
 * Returns RxJS Observable that emits on every price update
 *
 * @param symbols Array of symbols (e.g., ["BTC/USD", "ETH/USD"])
 * @returns Observable stream of ticker updates
 */
export function subscribeToTicker(symbols: string[]): Observable<TickerUpdate> {
  const key = symbols.sort().join(',');
  if (!tickerShared$.has(key)) {
    tickerShared$.set(
      key,
      withRetryAndShare(
        Kraken.publicWsSubscription({
          channel: 'ticker',
          params: { symbol: symbols },
        }),
      ),
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return tickerShared$.get(key)!;
}

//
// order book
//

const orderBookShared$ = new Map<string, Observable<BookUpdate>>();

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
  const key = `${symbols.sort().join(',')}-${depth}`;
  if (!orderBookShared$.has(key)) {
    orderBookShared$.set(
      key,
      withRetryAndShare(
        Kraken.publicWsSubscription({
          channel: 'book',
          params: { symbol: symbols, depth },
        }),
      ),
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return orderBookShared$.get(key)!;
}

//
// system status
//

const statusShared$ = withRetryAndShare(Kraken.publicWsStatus$);

/**
 * Subscribe to system status updates
 * Returns RxJS Observable that emits on connection and when trading engine status changes
 * No subscription needed - automatically sent by Kraken on WebSocket connection
 *
 * @returns Observable stream of system status updates
 */
export function subscribeToStatus(): Observable<StatusUpdate> {
  return statusShared$;
}

//
// connection events
//

const connectionShared$ = withRetryAndShare(Kraken.publicWsConnected$);

/**
 * Subscribe to WebSocket connection event
 * Returns RxJS Observable that emits when the WebSocket connection is established
 *
 * @returns Observable stream of connection events
 */
export function subscribeToConnection(): Observable<unknown> {
  return connectionShared$;
}

//
// disconnection events
//

const disconnectionShared$ = withRetryAndShare(Kraken.publicWsDisconnected$);

/**
 * Subscribe to WebSocket disconnection event
 * Returns RxJS Observable that emits when the WebSocket connection is closed
 *
 * @returns Observable stream of disconnection events
 */
export function subscribeToDisconnection(): Observable<unknown> {
  return disconnectionShared$;
}

//
// heartbeat
//

const heartbeatShared$ = withRetryAndShare(Kraken.publicWsHeartbeat$);

/**
 * Subscribe to WebSocket heartbeat event
 * Returns RxJS Observable that emits when a heartbeat is received
 *
 * @returns Observable stream of heartbeat events
 */
export function subscribeToHeartbeat(): Observable<Heartbeat.Update> {
  return heartbeatShared$;
}
