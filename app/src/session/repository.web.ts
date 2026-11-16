import { useMemo } from 'react';

import { createMemorySessionRepository } from './memory-repository.ts';
import type { SessionRepository } from './repository-types.ts';

const memory = createMemorySessionRepository();

/** Web is not a first-release platform. This keeps the session screens tappable in a browser. */
export function useSessionRepository(): SessionRepository {
  return useMemo(() => memory, []);
}
