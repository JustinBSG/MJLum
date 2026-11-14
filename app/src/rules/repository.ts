import { useSQLiteContext } from 'expo-sqlite';
import { useMemo } from 'react';

import type { RuleRepository } from './repository-types.ts';
import { createSqliteRuleRepository } from './sqlite-repository.ts';

export function useRuleRepository(): RuleRepository {
  const db = useSQLiteContext();
  return useMemo(() => createSqliteRuleRepository(db), [db]);
}
