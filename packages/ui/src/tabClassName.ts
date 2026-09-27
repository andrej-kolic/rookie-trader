const TAB =
  'relative cursor-pointer border-none bg-transparent px-0 py-3 text-[13px] font-medium';
const ACTIVE =
  'text-ink after:absolute after:-bottom-px after:left-0 after:h-0.5 after:w-full after:bg-accent';
const IDLE = 'text-muted hover:text-ink';

/** Classes for an underlined tab button, as used in tab bars across the app */
export function tabClassName(active: boolean): string {
  return `${TAB} ${active ? ACTIVE : IDLE}`;
}
