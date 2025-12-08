import { SystemStatus } from '@repo/ui';
import { useSystemStatus } from '../../hooks/use-system-status';

export function SystemStatusContainer() {
  const { status, loading, error } = useSystemStatus();

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load system status:', error);
    return null;
  }

  if (loading) {
    return null;
  }

  return <SystemStatus status={status?.system ?? null} />;
}
