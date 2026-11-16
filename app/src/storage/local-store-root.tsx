import { Suspense, type ReactNode } from "react";
import { LoadingScreen } from "@/components/loading-screen";
import { SQLiteProvider } from "expo-sqlite";

import { DATABASE_NAME, migrateLocalStore } from "@/storage/local-store";

export function LocalStoreRoot({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <SQLiteProvider
        databaseName={DATABASE_NAME}
        onInit={migrateLocalStore}
        useSuspense
      >
        {children}
      </SQLiteProvider>
    </Suspense>
  );
}
