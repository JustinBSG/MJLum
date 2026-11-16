import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

function subscribe() {
  return () => {};
}

/**
 * Static web rendering must use one color scheme on the server and the first
 * client render, then the device scheme after hydration.
 */
export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
