import { useEffect } from 'react';

/**
 * Custom hook to lock body scrolling when a modal or sheet is open.
 * Uses the bulletproof iOS position: fixed pattern to prevent background scrolling.
 */
export function useScrollLock(isOpen) {
  useEffect(() => {
    if (!isOpen) return;

    // Capture current scroll position
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

    // Freeze body in place
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;
    const originalOverflow = document.body.style.overflow;

    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');

    return () => {
      // Restore previous state & exact scroll position
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = originalWidth;
      document.body.style.overflow = originalOverflow;
      document.body.classList.remove('modal-open');
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);
}
