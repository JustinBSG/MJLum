import type { ReactNode } from 'react';
import { SQLiteProvider } from 'expo-sqlite';

import { DATABASE_NAME, migrateLocalStore } from '@/storage/local-store';

export function LocalStoreRoot({ children }: { children: ReactNode }) {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateLocalStore}>
      {children}
    </SQLiteProvider>
  );
}
