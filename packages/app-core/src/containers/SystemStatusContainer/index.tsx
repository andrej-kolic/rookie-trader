import { SystemStatus } from '@repo/ui';
import { useSystemStatus } from '../../hooks/use-system-status';

export function SystemStatusContainer() {
  const { status, loading, error } = useSystemStatus();

  // useSystemStatus already logs the error
  if (error) {
    return null;
  }

  if (loading) {
    return null;
  }

  return <SystemStatus status={status?.system ?? null} />;
}
