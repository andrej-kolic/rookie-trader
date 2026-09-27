import React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

export const button = tv({
  base: 'cursor-pointer font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60',
  variants: {
    intent: {
      accent: 'bg-accent text-on-accent enabled:hover:bg-accent-hover',
      danger:
        'bg-danger text-void enabled:hover:bg-[color-mix(in_oklab,var(--theme-danger)_80%,black)]',
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

/** Solid text button in the theme's accent or danger colour */
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
