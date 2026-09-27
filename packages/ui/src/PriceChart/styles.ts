import { tv } from 'tailwind-variants';
import { cardHeader } from '../CardHeader';

export const priceChart = tv({
  slots: {
    root: 'flex h-full w-full flex-col overflow-hidden rounded-lg border border-border bg-surface',
    header: `${cardHeader} justify-between max-md:flex-col max-md:items-start max-md:gap-3 max-md:py-3`,
    title: 'flex items-center gap-3',
    label: 'text-xs font-medium tracking-[0.05em] text-muted uppercase',
    loading: 'animate-pulse text-xs text-muted',
    controls:
      'flex items-center gap-3 max-md:w-full max-md:flex-col max-md:gap-2',
    intervals: 'flex gap-1 max-md:w-full max-md:justify-between',
    refresh:
      'flex size-7.5 cursor-pointer items-center justify-center rounded-md border border-border bg-surface text-base text-muted transition-all duration-200 enabled:hover:bg-border enabled:hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 max-md:w-full',
    canvas:
      'relative min-h-[300px] w-full max-w-full flex-1 overflow-hidden bg-surface *:max-w-full! [&_canvas]:max-w-full!',
    placeholder:
      'flex h-full grow flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface p-6',
    placeholderText: 'text-sm text-muted',
    errorTitle: 'text-sm font-semibold text-danger',
    errorDetail: 'max-w-[400px] text-center text-[13px] text-muted',
  },
});

export const intervalButton = tv({
  base: 'flex size-7.5 cursor-pointer items-center justify-center rounded-md text-[13px] font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 max-md:flex-1 max-md:px-1.5 max-md:text-xs',
  variants: {
    active: {
      true: 'bg-accent text-on-accent',
      false: 'text-muted enabled:hover:bg-border enabled:hover:text-ink',
    },
  },
});
