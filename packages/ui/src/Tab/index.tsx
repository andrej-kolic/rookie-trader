import React from 'react';
import { tv } from 'tailwind-variants';

export const tab = tv({
  // Keyboard focus draws a padded ring on a pseudo-element, so it neither
  // shifts the layout nor widens the active underline
  base: 'relative cursor-pointer py-3 text-[13px] font-medium outline-none focus-visible:before:pointer-events-none focus-visible:before:absolute focus-visible:before:-inset-x-2 focus-visible:before:inset-y-2 focus-visible:before:rounded-md focus-visible:before:ring-2 focus-visible:before:ring-accent/60',
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
