import { useEffect, useLayoutEffect, useRef } from 'react';

/**
 * While `enabled`, calls `onPress` when `key` is pressed without modifiers,
 * unless the user is typing in a form field. Prevents the browser's default
 * action for the key (e.g. Firefox quick find on "/").
 */
export function useHotkey(
  key: string,
  onPress: () => void,
  enabled = true,
): void {
  // Latest callback, so callers can pass inline functions
  const latest = useRef(onPress);
  useLayoutEffect(() => {
    latest.current = onPress;
  });

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== key) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable
      ) {
        return;
      }
      event.preventDefault();
      latest.current();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, enabled]);
}
