import type { ReactNode } from 'react';

/**
 * Web is not a first-release platform. The local store is opened on iOS and
 * Android. This file exists so the shell can render in a browser without the
 * native database.
 */
export function LocalStoreRoot({ children }: { children: ReactNode }) {
  return children;
}
