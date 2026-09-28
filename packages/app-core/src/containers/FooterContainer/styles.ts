import { tv } from 'tailwind-variants';
import { caption, cardHeader } from '@repo/ui';

export const footer = tv({
  slots: {
    // Fixed height (a quarter of the window, within bounds) so switching tabs
    // or data arriving never resizes the chart above; tables scroll inside
    root: 'flex h-[clamp(160px,25vh,200px)] shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-surface',
    // Stretch the tabs to full height so the active underline sits on the divider
    tabs: `${cardHeader} items-stretch gap-4`,
    content: 'flex-1 overflow-auto text-ink',
    message: 'px-4 py-8 text-center text-sm text-dim',
    error: 'px-4 py-8 text-center text-sm text-danger',
  },
});

export const footerTable = tv({
  slots: {
    table: 'w-full',
    // Stays visible while the rows scroll
    headCell: `${caption} sticky top-0 bg-surface px-4 pt-3 pb-1.5 text-left whitespace-nowrap`,
    row: 'transition-colors duration-150 hover:bg-white/5',
    cell: 'px-4 py-1.5 font-mono text-[0.8125rem] whitespace-nowrap',
    skeletonGrid: 'p-4',
    skeletonRow: 'my-2 flex justify-between gap-2',
    skeletonShort: 'h-4 w-[60px] skeleton rounded',
    skeletonLong: 'h-4 w-[120px] skeleton rounded',
  },
  variants: {
    // Numbers line up on the right
    numeric: { true: { headCell: 'text-right', cell: 'text-right' } },
  },
});

export const side = tv({
  base: 'capitalize',
  variants: {
    side: { buy: 'text-rise', sell: 'text-fall' },
  },
});
