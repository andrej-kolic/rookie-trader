import React, { useEffect, useRef, useState } from 'react';
import { tv } from 'tailwind-variants';

const systemStatus = tv({
  slots: {
    root: 'relative',
    trigger:
      'inline-flex cursor-pointer items-center gap-2 rounded-lg bg-black/35 px-2.5 py-[5px] text-sm font-medium',
    indicator:
      'size-2 shrink-0 rounded-full bg-current shadow-[0_0_4px_currentColor]',
    label: 'capitalize',
    legend:
      'absolute top-[calc(100%+8px)] left-1/2 z-100 w-72 -translate-x-1/2 rounded-lg border border-border bg-surface p-2 shadow-[0_4px_20px_var(--theme-shadow)]',
    legendTitle:
      'px-2 pt-1 pb-3 text-xs font-medium tracking-[0.05em] text-muted uppercase',
    legendItem: 'flex gap-2.5 rounded-md px-2 py-1.5',
    legendDot: 'mt-1.5',
    legendText: 'flex flex-col gap-0.5',
    legendLabel: 'text-sm font-medium text-ink capitalize',
    legendDescription: 'text-xs text-muted',
  },
  variants: {
    status: {
      online: { trigger: 'text-success', legendDot: 'text-success' },
      maintenance: { trigger: 'text-danger', legendDot: 'text-danger' },
      cancel_only: { trigger: 'text-caution', legendDot: 'text-caution' },
      limit_only: { trigger: 'text-gold', legendDot: 'text-gold' },
      post_only: { trigger: 'text-accent', legendDot: 'text-accent' },
      offline: { trigger: 'text-dim', legendDot: 'text-dim' },
    },
    current: {
      true: { legendItem: 'bg-white/5' },
    },
  },
});

export type SystemStatusType =
  | 'online'
  | 'maintenance'
  | 'cancel_only'
  | 'limit_only'
  | 'post_only'
  | 'offline';

/** What each status means for the user, in legend order */
const STATUS_LEGEND: { status: SystemStatusType; description: string }[] = [
  { status: 'online', description: 'Trading works normally.' },
  {
    status: 'post_only',
    description: 'Only limit orders that wait in the order book are accepted.',
  },
  { status: 'limit_only', description: 'Only limit orders are accepted.' },
  {
    status: 'cancel_only',
    description: 'Existing orders can be cancelled; no new orders.',
  },
  {
    status: 'maintenance',
    description: 'Kraken is down for maintenance; no trading.',
  },
  {
    status: 'offline',
    description: 'Your device is offline; data is not updating.',
  },
];

const KNOWN_STATUSES = Object.keys(systemStatus.variants.status);

function formatStatus(status: string): string {
  return status.replace('_', ' ');
}

export type SystemStatusProps = {
  status: SystemStatusType | (string & {}) | null | undefined;
  className?: string;
};

/** Exchange status pill; clicking it shows a legend of every status */
export function SystemStatus({
  status,
  className,
}: SystemStatusProps): React.ReactNode {
  const [legendOpen, setLegendOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close the legend on a click outside it or on Escape
  useEffect(() => {
    if (!legendOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setLegendOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLegendOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [legendOpen]);

  if (!status) {
    return null;
  }
  // Unknown statuses fall back to the online colour
  const s = systemStatus({
    status: KNOWN_STATUSES.includes(status)
      ? (status as SystemStatusType)
      : 'online',
  });

  return (
    <div className={s.root({ className })} ref={rootRef}>
      <button
        type="button"
        className={s.trigger()}
        onClick={() => {
          setLegendOpen((open) => !open);
        }}
        aria-haspopup="dialog"
        aria-expanded={legendOpen}
      >
        <span className={s.indicator()} />
        <span className={s.label()}>{formatStatus(status)}</span>
      </button>
      {legendOpen && (
        <div className={s.legend()} role="dialog" aria-label="Exchange status">
          <p className={s.legendTitle()}>Exchange status</p>
          <ul>
            {STATUS_LEGEND.map((item) => {
              const li = systemStatus({
                status: item.status,
                current: item.status === status,
              });
              return (
                <li
                  key={item.status}
                  className={li.legendItem()}
                  aria-current={item.status === status || undefined}
                >
                  <span className={li.legendDot()}>
                    <span className={li.indicator({ className: 'block' })} />
                  </span>
                  <span className={li.legendText()}>
                    <span className={li.legendLabel()}>
                      {formatStatus(item.status)}
                    </span>
                    <span className={li.legendDescription()}>
                      {item.description}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
