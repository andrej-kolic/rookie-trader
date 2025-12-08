import { useEffect, useState } from 'react';
import type { Subscription } from 'rxjs';
import { subscribeToStatus } from '../services/kraken-ws-service';
import { mapSystemStatus } from '../mappers/system-status-mapper';
import { toError } from '../utils/error-utils';
import { SystemStatus } from '../domain/SystemStatus';

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
  const [wsStatus, setWsStatus] = useState<SystemStatus | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const status = isOnline
    ? wsStatus
    : new SystemStatus('offline', 'N/A', 0, 'N/A', new Date());

  useEffect(() => {
    let isMounted = true;
    let subscription: Subscription | null = null;

    const handleOnline = () => {
      setIsOnline(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    subscription = subscribeToStatus().subscribe({
      next: (update) => {
        if (!isMounted) return;

        const domainStatus = mapSystemStatus(update);
        setWsStatus(domainStatus);
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

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { status, loading, error };
}
