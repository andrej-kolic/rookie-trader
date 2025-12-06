import React from 'react';
import './styles.css';

export type SystemStatusType =
  | 'online'
  | 'maintenance'
  | 'cancel_only'
  | 'limit_only'
  | 'post_only'
  | 'offline';

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
  const statusClass = `SystemStatus--${status}`;

  return (
    <div className={`SystemStatus ${statusClass} ${className}`}>
      <div className="SystemStatus__indicator" />
      <span className="SystemStatus__text">{formattedStatus}</span>
    </div>
  );
}
