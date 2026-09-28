import { useEffect, useState } from 'react';
import type { Subscription } from 'rxjs';
import { subscribeToExecutions } from '../api/kraken-ws-api';
import {
  applyExecutions,
  EMPTY_EXECUTIONS,
  type ExecutionsState,
} from '../mappers/execution-mapper';
import { toError } from '../utils/error-utils';
import { useAuthStore } from '../state/auth-store';
import type { Order } from '../domain/Order';
import type { Trade } from '../domain/Trade';

export type ExecutionsHookState = {
  /** Open orders, newest first */
  openOrders: Order[];
  /** Recent fills, newest first */
  trades: Trade[];
  loading: boolean;
  error: Error | null;
};

/**
 * Business hook: open orders and recent fills of the signed-in account,
 * kept live from the private executions channel
 */
export function useExecutions(): ExecutionsHookState {
  const [state, setState] = useState<ExecutionsState>(EMPTY_EXECUTIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      // Syncs React state with the external WebSocket system
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState(EMPTY_EXECUTIONS);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const subscription: Subscription = subscribeToExecutions(
      () => useAuthStore.getState().session?.token ?? null,
    ).subscribe({
      next: (update) => {
        setState((prev) => applyExecutions(prev, update.data));
        setLoading(false);
      },
      error: (err) => {
        setError(toError(err));
        setLoading(false);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isAuthenticated]);

  return {
    openOrders: Array.from(state.orders.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    ),
    trades: [...state.trades],
    loading,
    error,
  };
}
