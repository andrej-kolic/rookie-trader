import { useEffect, useState, type RefObject } from 'react';

/**
 * Current height of `ref`'s element in pixels, updated as it resizes.
 * Null until measured, and where ResizeObserver is unavailable (e.g. tests).
 * Pass `attached` when the element only renders in some states, so
 * observation starts once it appears.
 */
export function useElementHeight(
  ref: RefObject<HTMLElement | null>,
  attached = true,
): number | null {
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!attached || !element || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(([entry]) => {
      if (entry) setHeight(entry.contentRect.height);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [ref, attached]);

  return height;
}
