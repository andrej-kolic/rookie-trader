import { tv } from 'tailwind-variants';

export const footer = tv({
  slots: {
    root: 'flex min-h-[150px] flex-col overflow-hidden rounded-lg border-t border-border bg-surface',
    tabs: 'flex gap-4 border-b border-border bg-surface px-3',
    content: 'flex-1 overflow-y-auto p-4 text-ink',
    error: 'text-danger',
    table: 'w-full text-left',
  },
});
