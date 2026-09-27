import { tv } from 'tailwind-variants';

export const header = tv({
  slots: {
    root: 'flex items-center justify-between gap-2.5',
    brand: 'flex cursor-pointer items-center justify-center gap-[7px]',
    logo: 'relative -left-[5px] w-[42px]',
    title:
      'text-[28px] opacity-75 [text-shadow:0_0_6px_rgb(255_255_255/35%),0_0_42px_rgb(255_255_255/60%)]',
    actions: 'flex items-center gap-3',
    auth: 'relative',
    menu: 'absolute top-[calc(100%+8px)] right-0 z-100 min-w-[200px] rounded-lg border border-border bg-surface p-3 shadow-[0_4px_20px_var(--theme-shadow)]',
    menuLabel: 'mb-2.5 text-[13px] font-medium text-success',
    github: 'relative block h-auto w-8 text-ink opacity-90',
  },
});
