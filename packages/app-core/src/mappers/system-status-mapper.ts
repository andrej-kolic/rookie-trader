import type { StatusUpdate } from '../services/kraken-ws-service';
import { SystemStatus } from '../domain/SystemStatus';

/**
 * Maps Kraken WebSocket status update to SystemStatus domain model
 * @param dto Raw status update from WebSocket
 * @returns SystemStatus domain model instance
 */
export function mapSystemStatus(dto: StatusUpdate): SystemStatus {
  const statusData = dto.data[0];

  return new SystemStatus(
    statusData.system,
    statusData.api_version,
    statusData.connection_id,
    statusData.version,
    new Date(), // Current timestamp when status received
  );
}
