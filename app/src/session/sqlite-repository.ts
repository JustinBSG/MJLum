import type { SQLiteDatabase } from 'expo-sqlite';

import { parseSession, serializeSession } from './document.ts';
import type { SessionRepository } from './repository-types.ts';
import type { Session } from './types.ts';

export function createSqliteSessionRepository(db: SQLiteDatabase): SessionRepository {
  return {
    async getOpen() {
      const row = await db.getFirstAsync<{ document: string }>('SELECT document FROM open_session WHERE id = 1');
      return row ? parseSession(row.document) : null;
    },
    async saveOpen(session: Session) {
      await db.runAsync(
        `INSERT INTO open_session (id, document) VALUES (1, ?)
         ON CONFLICT(id) DO UPDATE SET document = excluded.document`,
        serializeSession(session),
      );
    },
    async clearOpen() {
      await db.runAsync('DELETE FROM open_session WHERE id = 1');
    },
  };
}
