import { tv } from 'tailwind-variants';
import { caption, cardHeader } from '@repo/ui';

export const footer = tv({
  slots: {
    root: 'flex min-h-[150px] flex-col overflow-hidden rounded-lg border border-border bg-surface',
    // Stretch the tabs to full height so the active underline sits on the divider
    tabs: `${cardHeader} items-stretch gap-4`,
    content: 'flex-1 overflow-y-auto text-ink',
    message: 'px-4 py-8 text-center text-sm text-dim',
    error: 'px-4 py-8 text-center text-sm text-danger',
    table: 'w-full',
    headCell: `${caption} px-4 pt-3 pb-1.5 text-left last:text-right`,
    row: 'transition-colors duration-150 hover:bg-white/5',
    cell: 'px-4 py-1.5 font-mono text-[0.8125rem] last:text-right',
    skeletonGrid: 'p-4',
    skeletonRow: 'my-2 flex justify-between gap-2',
    skeletonShort: 'h-4 w-[60px] skeleton rounded',
    skeletonLong: 'h-4 w-[120px] skeleton rounded',
  },
});
