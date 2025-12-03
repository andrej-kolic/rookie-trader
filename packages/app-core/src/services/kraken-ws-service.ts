import { publicWsSubscription, type PublicWsTypes } from 'ts-kraken';
import type { Observable } from 'rxjs';

export type TickerUpdate = PublicWsTypes.PublicSubscriptionUpdate<'ticker'>;

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
