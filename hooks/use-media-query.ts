import { useSyncExternalStore } from 'react';

/**
 * Custom hook for responsive design media queries
 * Usage: const isMobile = useMediaQuery('(max-width: 768px)')
 * Uses useSyncExternalStore for optimal performance and SSR compatibility
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = (callback: () => void) => {
    const matchMedia = window.matchMedia(query);
    matchMedia.addEventListener('change', callback);
    return () => matchMedia.removeEventListener('change', callback);
  };

  const getSnapshot = () => {
    return window.matchMedia(query).matches;
  };

  const getServerSnapshot = () => {
    return false; // Default value for SSR
  };

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Convenience hooks
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsTablet = () => useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');
