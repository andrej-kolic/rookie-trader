import { tv } from 'tailwind-variants';
import { cardHeader } from '../CardHeader';
import { caption } from '../Caption';

export const orderBook = tv({
  slots: {
    root: 'flex h-full w-full grow flex-col overflow-hidden rounded-lg border border-border bg-surface max-[480px]:max-w-full',
    header: cardHeader,
    columnHeaders: `${caption} grid w-full grid-cols-3 gap-2 max-[480px]:text-[0.6875rem]`,
    columnHeader: 'text-right first:text-left',
    // Sized by the panel, not its rows, so the row count can be fitted to it;
    // the leftover space (under two rows) splits above and below
    book: 'flex min-h-0 flex-1 flex-col justify-center overflow-hidden',
    side: 'relative',
    level:
      'relative z-1 grid grid-cols-3 gap-2 px-4 py-1.5 font-mono text-[0.8125rem] transition-colors duration-150 hover:bg-white/5 max-[480px]:px-3 max-[480px]:text-xs',
    price: 'text-left font-medium',
    quantity: 'text-right text-xs text-ink',
    total: 'text-right text-xs text-muted',
    depthBar:
      'pointer-events-none absolute top-0 right-0 -z-1 h-full w-(--depth-percentage) bg-linear-to-l opacity-[0.53]',
    spread:
      'flex items-center justify-center gap-2 border-y border-border bg-surface px-4 py-2.5 text-[0.8125rem] font-medium',
    spreadLabel: 'text-muted',
    spreadValue: 'font-mono text-ink',
    message: 'px-4 py-8 text-center text-sm text-dim',
    skeletonGrid: 'p-4',
    skeletonRow: 'my-2 flex gap-2',
    skeletonShort: 'h-4 w-[60px] skeleton rounded',
    skeletonLong: 'h-4 flex-1 skeleton rounded',
  },
  variants: {
    side: {
      ask: { price: 'text-fall', depthBar: 'from-fall to-fall/20' },
      bid: { price: 'text-rise', depthBar: 'from-rise to-rise/20' },
    },
    error: {
      true: {
        root: 'border-danger bg-[color-mix(in_oklab,var(--theme-danger)_12%,var(--theme-surface))]',
        message: 'font-medium text-danger',
      },
    },
  },
});
