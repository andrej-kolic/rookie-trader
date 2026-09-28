import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';

/**
 * While `open`, calls `onDismiss` on Escape or on a mouse press outside every
 * element in `refs` (the popup and whatever toggles it).
 */
export function useDismiss(
  open: boolean,
  refs: RefObject<HTMLElement | null>[],
  onDismiss: () => void,
): void {
  // Latest values, so callers can pass inline arrays and callbacks
  const latest = useRef({ refs, onDismiss });
  useLayoutEffect(() => {
    latest.current = { refs, onDismiss };
  });

  useEffect(() => {
    if (!open) return;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!latest.current.refs.some((ref) => ref.current?.contains(target))) {
        latest.current.onDismiss();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') latest.current.onDismiss();
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);
}
