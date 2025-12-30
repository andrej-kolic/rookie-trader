import { useEffect, useState } from 'react';
import { subscribeToBalances } from '../api/kraken-ws-api';
import { mapBalance } from '../mappers/balance-mapper';
import { toError } from '../utils/error-utils';
import type { Balance } from '../domain/Balance';
import type { Subscription } from 'rxjs';
import { useAuthStore } from '../state/auth-store';

export type BalancesState = {
  balances: Balance[];
  loading: boolean;
  error: Error | null;
};

/**
 * Business hook: Subscribe to real-time balance updates
 * Automatically manages WebSocket subscription lifecycle
 * Accumulates balance updates to maintain complete state
 *
 * @returns Balances state with loading and error handling
 */
export function useBalances(): BalancesState {
  const [balancesMap, setBalancesMap] = useState<Map<string, Balance>>(
    new Map(),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    let isMounted = true;
    let subscription: Subscription | null = null;

    // Only subscribe when authenticated
    if (!isAuthenticated) {
      // WebSocket subscription legitimately requires setting state
      // This syncs React state with external WebSocket system
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBalancesMap(new Map());
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const subscribe = () => {
      if (subscription) {
        subscription.unsubscribe();
        subscription = null;
      }

      console.log(' * Subscribing to balances updates');
      subscription = subscribeToBalances(
        () => useAuthStore.getState().session?.token ?? null,
      ).subscribe({
        next: (update) => {
          if (!isMounted) return;

          console.log('Balances update:', update);

          const newBalances = update.data.map(mapBalance);

          setBalancesMap((prevMap) => {
            const nextMap = new Map(prevMap);
            newBalances.forEach((balance) => {
              nextMap.set(balance.asset, balance);
            });
            return nextMap;
          });

          setLoading(false);
        },
        error: (err) => {
          if (!isMounted) return;
          console.error('Balances subscription error:', err);
          setError(toError(err));
          setLoading(false);
        },
      });
    };

    subscribe();

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [isAuthenticated]);

  return {
    balances: Array.from(balancesMap.values()),
    loading,
    error,
  };
}
