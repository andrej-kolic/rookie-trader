import React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

export const iconButton = tv({
  base: 'relative flex size-8 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-current text-ink opacity-75 transition-[opacity,background] duration-150 hover:bg-white/8 hover:opacity-100 [&_svg]:size-4',
  variants: {
    // Small dot on the ring's top-right edge, e.g. to show a live connection
    dot: {
      success:
        'after:absolute after:-top-0.5 after:-right-0.5 after:size-2.5 after:rounded-full after:bg-success after:ring-2 after:ring-bg',
    },
  },
});

export type IconButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof iconButton>;

/** Round outlined button holding a single 16px icon, sized to match the GitHub mark */
export function IconButton({
  dot,
  className,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button type={type} className={iconButton({ dot, className })} {...props} />
  );
}
