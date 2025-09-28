import { useEffect, useState } from 'react';

// Shared orientation detection hook
export const useOrientation = () => {
  const [isPortrait, setIsPortrait] = useState(
    window.innerHeight > window.innerWidth
  );

  useEffect(() => {
    const updateOrientation = () => {
      const newIsPortrait = window.innerHeight > window.innerWidth;
      setIsPortrait(newIsPortrait);
    };

    const handleOrientationChange = () => {
      // Multiple timeouts to catch different timing scenarios
      setTimeout(updateOrientation, 0);
      setTimeout(updateOrientation, 100);
      setTimeout(updateOrientation, 300);
    };

    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Also listen for viewport meta changes (Chrome responsive mode)
    const observer = new ResizeObserver(updateOrientation);
    observer.observe(document.documentElement);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', handleOrientationChange);
      observer.disconnect();
    };
  }, []);

  return isPortrait;
};
