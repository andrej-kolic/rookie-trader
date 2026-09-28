import { tv } from 'tailwind-variants';
import { cardHeader } from '@repo/ui';

export const footer = tv({
  slots: {
    root: 'flex min-h-[150px] flex-col overflow-hidden rounded-lg border border-border bg-surface',
    // Stretch the tabs to full height so the active underline sits on the divider
    tabs: `${cardHeader} items-stretch gap-4`,
    content: 'flex-1 overflow-y-auto p-4 text-ink',
    error: 'text-danger',
    table: 'w-full text-left',
    amount: 'font-mono',
  },
});
