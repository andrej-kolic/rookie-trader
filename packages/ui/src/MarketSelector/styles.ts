import { tv } from 'tailwind-variants';

export const marketSelector = tv({
  slots: {
    root: 'relative flex grow',
    trigger:
      'flex w-full max-w-[400px] cursor-pointer items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink transition-[border-color] duration-200 hover:border-line',
    triggerContent: 'flex items-center gap-2',
    chevron: 'transition-transform duration-200',
    placeholder: 'text-muted',
    dropdown:
      'absolute top-full left-0 z-1000 mt-1 flex max-h-[500px] w-[300px] flex-col rounded-lg border border-border bg-surface shadow-[0_4px_12px_var(--theme-shadow)]',
    search: 'border-b border-border p-3',
    searchInput:
      'w-full rounded border border-border bg-void px-3 py-2 text-sm text-ink outline-none focus:border-accent',
    tabs: 'flex gap-4 border-b border-border px-3',
    listHeader: 'flex border-b border-border px-3 py-2 text-xs text-muted',
    colFav: 'w-6 shrink-0',
    colMarket: 'flex flex-1',
    colPrice: 'w-20 text-right',
    list: 'max-h-[350px] overflow-y-auto',
    empty: 'p-6 text-center text-sm text-muted',
    symbol: 'text-sm font-medium text-ink',
    badges: 'ml-2 flex gap-1',
    badge: 'rounded-xs bg-border px-1 py-px text-[10px] text-muted',
  },
  variants: {
    open: { true: { chevron: 'rotate-180' } },
  },
});

export const marketRow = tv({
  slots: {
    row: 'flex cursor-pointer items-center px-3 py-2 transition-colors duration-100 hover:bg-border',
    favButton:
      'flex cursor-pointer items-center justify-center text-line hover:text-gold',
  },
  variants: {
    selected: { true: { row: 'bg-border' } },
    favorite: { true: { favButton: 'text-gold' } },
  },
});
