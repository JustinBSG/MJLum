import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * One local database on this device. No account, no cloud, and no sync.
 * Game records are added by later features into this same file. Score columns
 * must store Score.toExact() text. Do not store a score as a SQLite REAL.
 *
 * Suggested library: expo-sqlite. It is not a locked choice.
 *
 * Backup exclusion is incomplete, and that gap stays open.
 * docs/development.md says not to invent a product rule for it:
 * - expo-sqlite has no isExcludedFromBackup API. Re-setting that iOS flag
 *   needs a native helper. This Expo Go build does not add one. The file
 *   stays in the library default directory, which is neither the cache
 *   (the system may delete cache) nor a new Documents path chosen here.
 * - android.allowBackup is false in app config. On API 31 and later, some
 *   device-to-device transfers still ignore that flag. getNoBackupFilesDir()
 *   is not available from this JavaScript API.
 */
export const DATABASE_NAME = 'mjlum.db';

export const LOCAL_STORE_VERSION = 1;

export async function migrateLocalStore(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;
  if (current >= LOCAL_STORE_VERSION) return;

  if (current === 0) {
    await db.execAsync(`PRAGMA journal_mode = WAL;`);
  }

  await db.execAsync(`PRAGMA user_version = ${LOCAL_STORE_VERSION}`);
}
