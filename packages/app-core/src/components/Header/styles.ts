import { tv } from 'tailwind-variants';
import { popupTitle } from '@repo/ui';

export const header = tv({
  slots: {
    root: 'flex items-center justify-between gap-2.5',
    brand: 'flex cursor-pointer items-center justify-center gap-[7px]',
    logo: 'relative -left-[5px] w-[42px]',
    title: 'text-[28px] opacity-75',
    actions: 'flex items-center gap-3',
    auth: 'relative',
    help: 'relative',
    menu: 'absolute top-[calc(100%+8px)] right-0 z-100 min-w-[200px] rounded-lg border border-border bg-surface p-3 shadow-[0_4px_20px_var(--theme-shadow)]',
    menuTitle: `${popupTitle} mb-3`,
    shortcuts: 'flex min-w-[240px] flex-col gap-2 text-[13px] text-muted',
    shortcut: 'flex items-center justify-between gap-4',
    keys: 'flex gap-1',
    key: 'rounded border border-border px-1.5 font-sans text-[11px] leading-5 text-ink',
    menuLabel: 'mb-2.5 text-[13px] font-medium text-success',
    github: 'relative block h-auto w-8 text-ink opacity-75',
  },
});

// removed text shadow from "Rookie":
// title:
// 'text-[28px] opacity-75 [text-shadow:0_0_6px_rgb(255_255_255/35%),0_0_42px_rgb(255_255_255/60%)]',
