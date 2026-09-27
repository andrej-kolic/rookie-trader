import React from 'react';
import { tv } from 'tailwind-variants';

export const tab = tv({
  base: 'relative cursor-pointer py-3 text-[13px] font-medium',
  variants: {
    active: {
      true: 'text-ink after:absolute after:-bottom-px after:left-0 after:h-0.5 after:w-full after:bg-accent',
      false: 'text-muted hover:text-ink',
    },
  },
});

export type TabProps = React.ComponentProps<'button'> & { active: boolean };

/** Underlined tab button for a tab bar */
export function Tab({
  active,
  className,
  type = 'button',
  ...props
}: TabProps) {
  return (
    <button type={type} className={tab({ active, className })} {...props} />
  );
}
