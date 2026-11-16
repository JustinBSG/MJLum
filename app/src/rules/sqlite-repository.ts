import type { SQLiteDatabase } from 'expo-sqlite';

import { parseRuleSetup, serializeRuleSetup } from './document.ts';
import type { RuleSetup } from './types.ts';
import type { RuleRepository } from './repository-types.ts';

export function createSqliteRuleRepository(db: SQLiteDatabase): RuleRepository {
  return {
    async listSaved() {
      const rows = await db.getAllAsync<{ document: string }>(
        'SELECT document FROM saved_rule_setup ORDER BY rowid',
      );
      return rows.map((row) => parseRuleSetup(row.document));
    },
    async save(setup: RuleSetup) {
      await db.runAsync(
        `INSERT INTO saved_rule_setup (id, document) VALUES (?, ?)
         ON CONFLICT(id) DO UPDATE SET document = excluded.document`,
        setup.id,
        serializeRuleSetup(setup),
      );
    },
    async deleteSaved(id: string) {
      await db.runAsync('DELETE FROM saved_rule_setup WHERE id = ?', id);
    },
    async getActive() {
      const row = await db.getFirstAsync<{ document: string }>(
        'SELECT document FROM active_rule_setup WHERE id = 1',
      );
      return row ? parseRuleSetup(row.document) : null;
    },
    async setActive(setup: RuleSetup) {
      await db.runAsync(
        `INSERT INTO active_rule_setup (id, document) VALUES (1, ?)
         ON CONFLICT(id) DO UPDATE SET document = excluded.document`,
        serializeRuleSetup(setup),
      );
    },
  };
}
