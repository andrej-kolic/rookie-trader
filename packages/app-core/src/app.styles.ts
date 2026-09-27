import { tv } from 'tailwind-variants';

/** Page layout: a fixed-height grid on desktop, a scrolling stack on mobile */
export const appLayout = tv({
  slots: {
    root: 'grid h-screen grid-rows-[auto_auto_1fr_auto] gap-4 overflow-hidden p-4 max-md:flex max-md:h-auto max-md:min-h-screen max-md:flex-col max-md:overflow-visible',
    tradingHeader: 'min-w-0 overflow-visible',
    main: 'grid min-h-0 grid-cols-[minmax(0,35%)_minmax(0,65%)] gap-4 overflow-hidden max-md:flex max-md:flex-1 max-md:flex-col max-md:overflow-visible',
    panel:
      'flex min-h-0 min-w-0 flex-col overflow-hidden max-md:min-h-[400px] max-md:overflow-visible',
  },
});
