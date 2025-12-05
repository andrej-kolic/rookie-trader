import { useEffect, useState } from 'react';
import type { Subscription } from 'rxjs';
import { subscribeToStatus } from '../services/kraken-ws-service';
import { mapSystemStatus } from '../mappers/system-status-mapper';
import { toError } from '../utils/error-utils';
import type { SystemStatus } from '../domain/SystemStatus';

export type SystemStatusState = {
  status: SystemStatus | null;
  loading: boolean;
  error: Error | null;
};

/**
 * Business hook: Subscribe to real-time system status updates
 * Automatically receives status on WebSocket connection and when trading engine status changes
 * No manual subscription needed - status is pushed automatically by Kraken
 *
 * @returns System status state with loading and error handling
 */
export function useSystemStatus(): SystemStatusState {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let subscription: Subscription | null = null;

    // Small delay to prevent StrictMode double-mount issues
    const timeoutId = setTimeout(() => {
      if (!isMounted) return;

      subscription = subscribeToStatus().subscribe({
        next: (update) => {
          if (!isMounted) return;

          const domainStatus = mapSystemStatus(update);
          setStatus(domainStatus);
          setLoading(false);
          setError(null);
        },
        error: (err) => {
          if (!isMounted) return;

          const error = toError(err);
          // eslint-disable-next-line no-console
          console.error('System status error:', error);
          setError(error);
          setLoading(false);
        },
      });
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return { status, loading, error };
}
