import { useSQLiteContext } from 'expo-sqlite';
import { useMemo } from 'react';

import { createSqliteSessionRepository } from './sqlite-repository.ts';
import type { SessionRepository } from './repository-types.ts';

export function useSessionRepository(): SessionRepository {
  const db = useSQLiteContext();
  return useMemo(() => createSqliteSessionRepository(db), [db]);
}
