import { useMemo } from 'react';

import { createMemoryRuleRepository } from './memory-repository.ts';
import type { RuleRepository } from './repository-types.ts';

const memory = createMemoryRuleRepository();

/** Web is not a first-release platform. This keeps the setup screens tappable in a browser. */
export function useRuleRepository(): RuleRepository {
  return useMemo(() => memory, []);
}
