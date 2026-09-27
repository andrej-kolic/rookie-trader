import React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

export const iconButton = tv({
  base: 'flex size-8 cursor-pointer items-center justify-center rounded-md transition-[opacity,background] duration-150 hover:opacity-100 [&_svg]:size-[22px]',
  variants: {
    tone: {
      success: 'text-success opacity-90 hover:bg-success/12',
      muted: 'text-muted opacity-70 hover:bg-muted/12',
    },
  },
  defaultVariants: { tone: 'muted' },
});

export type IconButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof iconButton>;

/** Square button holding a single 22px icon */
export function IconButton({
  tone,
  className,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={iconButton({ tone, className })}
      {...props}
    />
  );
}
