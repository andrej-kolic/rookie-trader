import { tv } from 'tailwind-variants';

export const loginForm = tv({
  slots: {
    backdrop:
      'fixed inset-0 z-200 flex items-center justify-center bg-(--theme-overlay) backdrop-blur-[3px]',
    card: 'w-full max-w-[380px] rounded-xl border border-border bg-surface p-8 text-ink shadow-[0_8px_32px_var(--theme-shadow),0_0_0_1px_rgb(255_255_255/4%)]',
    header: 'mb-6 flex items-center justify-between',
    title: 'text-xl font-semibold text-ink',
    close:
      'cursor-pointer rounded px-1.5 py-0.5 text-base leading-none text-muted transition-[color,background] duration-150 hover:bg-white/8 hover:text-ink',
    form: 'flex flex-col gap-4',
    field: 'flex flex-col gap-1.5',
    label:
      'text-[0.8125rem] font-medium tracking-[0.02em] text-muted uppercase',
    input:
      'w-full rounded-md border border-border bg-void px-3 py-2 text-[0.9375rem] text-ink transition-[border-color] duration-150 outline-none focus:border-accent/70 focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--theme-accent)_12%,transparent)]',
    error:
      'rounded-md border border-danger/40 bg-danger/15 px-3 py-2 text-sm text-danger',
  },
});
