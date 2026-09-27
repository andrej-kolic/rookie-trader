import { tv } from 'tailwind-variants';

export const tradingHeader = tv({
  slots: {
    root: 'flex h-[60px] w-full max-w-full min-w-0 items-stretch gap-4 rounded-lg',
    selector: 'flex max-w-40 min-w-40 shrink-0',
    ticker: 'flex min-w-0 flex-1 overflow-hidden',
  },
});
