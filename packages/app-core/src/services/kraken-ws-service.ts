import * as Kraken from 'ts-kraken';
import type { Status, Heartbeat } from 'ts-kraken/dist/types/ws';
import type { Observable } from 'rxjs';
import { timer, defer } from 'rxjs';
import { retry, share, switchMap } from 'rxjs/operators';

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

function withRetryAndShare<T>(source$: Observable<T>): Observable<T> {
  return timer(SUBSCRIPTION_DEBOUNCE_MS).pipe(
    switchMap(() => source$),
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

import * as authService from './auth-service';

/**
 * Get WebSocket authentication token
 * Pure function - token must be provided by caller
 *
 * @param authToken - The encrypted authentication token from login
 * @returns Promise with WebSocket token
 */
function getWsToken(authToken: string): Promise<string> {
  return authService.getWsToken(authToken);
}

/**
 * Shared WebSocket token observable (module-level singleton)
 * Initialized lazily on first private subscription
 * Shared across all authenticated subscriptions to avoid redundant token fetches
 *
 * Assumption: Single user session per app instance (consistent with app architecture)
 * The first call to any private subscription establishes the token provider
 */
let wsTokenShared$: Observable<string> | null = null;

/**
 * Reset the cached WebSocket token
 * Called on logout to ensure fresh token fetch on next authentication
 * This clears the module-level token cache forcing re-authentication
 */
export function resetWsToken(): void {
  wsTokenShared$ = null;
}

export type BalanceUpdate =
  Kraken.PrivateWsTypes.PrivateSubscriptionUpdate<'balances'>;

/**
 * Subscribe to private balance updates
 * Automatically fetches fresh token on connection/reconnection
 *
 * Note: Uses module-level shared token observable for efficiency
 * All subscriptions share the same WS token to avoid redundant API calls
 *
 * @param getAuthToken - Function that returns the current auth token (or null if not authenticated)
 * @returns Observable stream of balance updates
 */
export function subscribeToBalances(
  getAuthToken: () => string | null,
): Observable<BalanceUpdate> {
  // Initialize shared token observable on first call
  // Subsequent calls reuse the same token observable for efficiency
  wsTokenShared$ ??= defer(() => {
    const authToken = getAuthToken();

    if (!authToken) {
      throw new Error('Not authenticated. Please login first.');
    }

    return getWsToken(authToken);
  }).pipe(
    share({
      resetOnRefCountZero: false, // Keep token cached across subscriptions
      resetOnError: true, // Refetch on error (e.g., token expired)
      resetOnComplete: true, // Refetch if completed (rare)
    }),
  );

  return withRetryAndShare(
    wsTokenShared$.pipe(
      switchMap((token) =>
        Kraken.privateWsSubscription({ channel: 'balances' }, token),
      ),
      switchMap((obs) => obs),
    ),
  );
}
