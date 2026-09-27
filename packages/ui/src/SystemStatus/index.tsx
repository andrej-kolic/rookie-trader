import React from 'react';
import { tv } from 'tailwind-variants';

const systemStatus = tv({
  slots: {
    root: 'inline-flex items-center gap-2 rounded-lg bg-black/35 px-2.5 py-[5px] text-sm font-medium',
    indicator: 'size-2 rounded-full bg-current shadow-[0_0_4px_currentColor]',
    label: 'capitalize',
  },
  variants: {
    status: {
      online: { root: 'text-success' },
      maintenance: { root: 'text-danger' },
      cancel_only: { root: 'text-caution' },
      limit_only: { root: 'text-gold' },
      post_only: { root: 'text-accent' },
      offline: { root: 'text-dim' },
    },
  },
});

const KNOWN_STATUSES = Object.keys(systemStatus.variants.status);

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
  className,
}: SystemStatusProps): React.ReactNode {
  if (!status) {
    return null;
  }
  const formattedStatus = status.replace('_', ' ');
  // Unknown statuses fall back to the online colour
  const s = systemStatus({
    status: KNOWN_STATUSES.includes(status)
      ? (status as SystemStatusType)
      : 'online',
  });

  return (
    <div className={s.root({ className })}>
      <div className={s.indicator()} />
      <span className={s.label()}>{formattedStatus}</span>
    </div>
  );
}
