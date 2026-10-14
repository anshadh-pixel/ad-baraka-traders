import { useEffect } from 'react';

/**
 * Custom hook to lock body scrolling when a modal or sheet is open
 */
export function useScrollLock(isOpen) {
  useEffect(() => {
    if (!isOpen) return;

    // Save previous overflow and scroll position
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');

    return () => {
      document.body.style.overflow = originalOverflow || '';
      document.body.style.touchAction = originalTouchAction || '';
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);
}
