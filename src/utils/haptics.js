/**
 * Tactile feedback for mobile browsers
 */
export const triggerHaptic = (type = 'light') => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      switch (type) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(25);
          break;
        case 'success':
          navigator.vibrate([15, 30, 20]);
          break;
        case 'warning':
          navigator.vibrate([30, 40, 30]);
          break;
        default:
          navigator.vibrate(15);
      }
    } catch {
      // Ignore vibration errors if not permitted
    }
  }
};
