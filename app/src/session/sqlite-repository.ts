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
    async archiveOpen() {
      const row = await db.getFirstAsync<{ document: string }>('SELECT document FROM open_session WHERE id = 1');
      if (!row) return;
      const session = parseSession(row.document);
      await db.runAsync(
        `INSERT INTO archived_session (id, document) VALUES (?, ?)
         ON CONFLICT(id) DO UPDATE SET document = excluded.document`,
        session.id,
        row.document,
      );
      await db.runAsync('DELETE FROM open_session WHERE id = 1');
    },
    async listArchived() {
      const rows = await db.getAllAsync<{ document: string }>(
        'SELECT document FROM archived_session ORDER BY rowid',
      );
      return rows.map((row) => parseSession(row.document));
    },
    async saveArchived(session: Session) {
      await db.runAsync(
        `INSERT INTO archived_session (id, document) VALUES (?, ?)
         ON CONFLICT(id) DO UPDATE SET document = excluded.document`,
        session.id,
        serializeSession(session),
      );
    },
  };
}
