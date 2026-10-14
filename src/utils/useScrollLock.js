import { useEffect } from 'react';

/**
 * Custom hook to lock body scrolling when a modal or sheet is open.
 * Completely stops background scrolling on iOS Safari, Android, and Desktop browsers.
 */
export function useScrollLock(isOpen) {
  useEffect(() => {
    if (!isOpen) return;

    // 1. Capture current scroll position
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

    // 2. Lock body in place with position: fixed
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

    // 3. Block all touchmove events that are NOT inside a designated scrollable modal container
    const preventBackgroundTouchMove = (e) => {
      const scrollable = e.target.closest('.modal-scrollable');
      if (!scrollable) {
        // Touch is on backdrop, header, or outside scrollable content -> block completely!
        if (e.cancelable) e.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventBackgroundTouchMove, { passive: false });

    return () => {
      // 4. Restore previous state & exact scroll position
      document.removeEventListener('touchmove', preventBackgroundTouchMove);
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
