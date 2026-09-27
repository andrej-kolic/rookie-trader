import React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

export const button = tv({
  base: 'cursor-pointer font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60',
  variants: {
    intent: {
      accent: 'bg-accent text-on-accent enabled:hover:bg-accent-hover',
      danger:
        'bg-danger text-void enabled:hover:bg-[color-mix(in_oklab,var(--theme-danger)_80%,black)]',
      'danger-subtle':
        'border border-danger/40 text-danger enabled:hover:border-danger enabled:hover:bg-danger/15',
    },
    size: {
      sm: 'rounded px-3 py-[7px] text-[13px]',
      md: 'rounded-md px-4 py-2 text-[13px]',
      lg: 'rounded-md px-4 py-2.5 text-[0.9375rem]',
    },
  },
  defaultVariants: { intent: 'accent', size: 'md' },
});

export type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof button>;

/** Text button: solid accent or danger, or an outlined danger for quiet destructive actions */
export function Button({
  intent,
  size,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={button({ intent, size, className })}
      {...props}
    />
  );
}
