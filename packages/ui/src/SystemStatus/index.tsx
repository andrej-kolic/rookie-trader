import React from 'react';

export type SystemStatusType =
  | 'online'
  | 'maintenance'
  | 'cancel_only'
  | 'limit_only'
  | 'post_only'
  | 'offline';

const STATUS_COLORS: Record<string, string> = {
  online: 'text-success',
  maintenance: 'text-danger',
  cancel_only: 'text-caution',
  limit_only: 'text-gold',
  post_only: 'text-accent',
  offline: 'text-dim',
};

export type SystemStatusProps = {
  status: SystemStatusType | (string & {}) | null | undefined;
  className?: string;
};

export function SystemStatus({
  status,
  className = '',
}: SystemStatusProps): React.ReactNode {
  if (!status) {
    return null;
  }
  const formattedStatus = status.replace('_', ' ');
  const statusColor = STATUS_COLORS[status] ?? STATUS_COLORS.online;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg bg-black/35 px-2.5 py-[5px] text-sm font-medium ${statusColor} ${className}`}
    >
      <div className="size-2 rounded-full bg-current shadow-[0_0_4px_currentColor]" />
      <span className="capitalize">{formattedStatus}</span>
    </div>
  );
}
