import { tv } from 'tailwind-variants';
import { caption } from '../Caption';

export const ticker = tv({
  slots: {
    root: 'flex scrollbar-subtle w-full max-w-full min-w-0 items-center gap-6 overflow-x-auto overflow-y-hidden scroll-smooth rounded-lg border border-border bg-surface px-6 py-4 whitespace-nowrap max-md:gap-4 max-md:px-4 max-md:py-3',
    stat: 'flex shrink-0 flex-col gap-1 max-md:min-w-[100px]',
    label: caption,
    value: 'font-mono text-sm font-medium text-ink',
    qty: 'text-xs font-normal text-dim',
    change: 'inline-block rounded font-mono text-sm font-semibold',
    error: 'text-sm font-medium text-danger',
    skeletonWide: 'h-5 w-[120px] skeleton rounded',
    skeleton: 'h-5 w-20 skeleton rounded',
  },
  variants: {
    state: {
      ready: {},
      updating: {
        root: 'pointer-events-none opacity-60 transition-opacity duration-200 ease-in-out',
      },
      loading: { root: 'gap-8' },
      error: {
        root: 'justify-center border-danger bg-[color-mix(in_oklab,var(--theme-danger)_12%,var(--theme-surface))]',
      },
    },
    rising: {
      true: { change: 'text-rise' },
      false: { change: 'text-fall' },
    },
  },
});
