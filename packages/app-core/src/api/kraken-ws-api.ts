import * as Kraken from 'ts-kraken';
import type { Status, Heartbeat } from 'ts-kraken/dist/types/ws';
import type { Observable } from 'rxjs';
import { timer, defer } from 'rxjs';
import { repeat, retry, share, switchMap } from 'rxjs/operators';

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

/**
Used to fix Strict Mode's "WebSocket is closed before the connection is established"
error when subscribing to WebSocket channels immediately after connection.
this is a workaround for the issue, not a solution
*/
const SUBSCRIPTION_DEBOUNCE_MS = 100;

/**
 * Resubscribes after the socket drops, whether it failed (error) or was
 * closed cleanly by either side (the stream completes), then shares the
 * result between subscribers
 */
function withRetryAndShare<T>(source$: Observable<T>): Observable<T> {
  return timer(SUBSCRIPTION_DEBOUNCE_MS).pipe(
    switchMap(() => source$),
    repeat({
      delay: RECONNECT_DELAY_MS,
    }),
    retry({
      delay: RECONNECT_DELAY_MS,
    }),
    share({
      resetOnRefCountZero: true,
      resetOnError: true,
      resetOnComplete: true,
    }),
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

//
// Private / Authenticated
//

import * as authApi from './auth-api';

/**
 * Get WebSocket authentication token
 * Pure function - token must be provided by caller
 *
 * @param authToken - The encrypted authentication token from login
 * @returns Promise with WebSocket token
 */
function getWsToken(authToken: string): Promise<string> {
  return authApi.getWsToken(authToken);
}

/**
 * WebSocket token fetch shared by private subscriptions (module-level singleton)
 * Initialized lazily on first private subscription
 *
 * Assumption: Single user session per app instance (consistent with app architecture)
 * The first call to any private subscription establishes the token provider
 */
let wsTokenShared$: Observable<string> | null = null;

/**
 * Forget the token provider
 * Called on logout so the next login's subscriptions set it up again
 */
export function resetWsToken(): void {
  wsTokenShared$ = null;
}

export type BalanceUpdate =
  Kraken.PrivateWsTypes.PrivateSubscriptionUpdate<'balances'>;

/**
 * WebSocket token for private subscriptions. Subscriptions connecting at the
 * same time share one fetch; every later (re)connect fetches a fresh token,
 * because Kraken only accepts a token within 15 minutes of issuing it.
 */
function sharedWsToken(getAuthToken: () => string | null): Observable<string> {
  // The first private subscription establishes the token provider
  wsTokenShared$ ??= defer(() => {
    const authToken = getAuthToken();

    if (!authToken) {
      throw new Error('Not authenticated. Please login first.');
    }

    return getWsToken(authToken);
  }).pipe(
    share({
      resetOnRefCountZero: false, // Keep an in-flight fetch for late joiners
      resetOnError: true, // Refetch after a failed fetch
      resetOnComplete: true, // Refetch on the next connect once a token is delivered
    }),
  );
  return wsTokenShared$;
}

/**
 * Subscribe to private balance updates
 * Automatically fetches fresh token on connection/reconnection
 *
 * @param getAuthToken - Function that returns the current auth token (or null if not authenticated)
 * @returns Observable stream of balance updates
 */
export function subscribeToBalances(
  getAuthToken: () => string | null,
): Observable<BalanceUpdate> {
  return withRetryAndShare(
    sharedWsToken(getAuthToken).pipe(
      switchMap((token) =>
        Kraken.privateWsSubscription({ channel: 'balances' }, token),
      ),
      switchMap((obs) => obs),
    ),
  );
}

export type ExecutionsUpdate =
  Kraken.PrivateWsTypes.PrivateSubscriptionUpdate<'executions'>;

/**
 * Subscribe to the account's order and fill reports. Starts with a snapshot
 * of open orders and the most recent fills, then streams changes.
 *
 * @param getAuthToken - Function that returns the current auth token (or null if not authenticated)
 */
export function subscribeToExecutions(
  getAuthToken: () => string | null,
): Observable<ExecutionsUpdate> {
  return withRetryAndShare(
    sharedWsToken(getAuthToken).pipe(
      switchMap((token) =>
        Kraken.privateWsSubscription(
          {
            channel: 'executions',
            params: { snap_orders: true, snap_trades: true },
          },
          token,
        ),
      ),
      switchMap((obs) => obs),
    ),
  );
}
