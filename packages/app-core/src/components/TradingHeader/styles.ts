import { tv } from 'tailwind-variants';

/** Selector and ticker side by side; stacked on phones so the ticker gets the full width */
export const tradingHeader = tv({
  slots: {
    root: 'flex h-[60px] w-full max-w-full min-w-0 items-stretch gap-4 rounded-lg max-sm:h-auto max-sm:flex-col max-sm:gap-3',
    selector:
      'flex max-w-40 min-w-40 shrink-0 max-sm:h-12 max-sm:max-w-none max-sm:min-w-0',
    ticker: 'flex min-w-0 flex-1 overflow-hidden max-sm:h-[60px]',
  },
});
