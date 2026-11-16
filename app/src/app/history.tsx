import { DataTable } from "@/components/data-table";
import { LedgerTable } from "@/components/ledger-table";
import { Action } from "@/components/table-ui";
import { router, Stack, useFocusEffect, type Href } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { APP_LOCALE } from "@/locale";
import { useSessionRepository } from "@/session/repository";
import {
  formatBalance,
  resumeSession,
  sessionStatusLabel,
} from "@/session/session";
import type { Session } from "@/session/types";

export default function HistoryScreen() {
  const repo = useSessionRepository();
  const [open, setOpen] = useState<Session | null>(null);
  const [archived, setArchived] = useState<Session[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(() => {
    let live = true;
    Promise.all([repo.getOpen(), repo.listArchived()]).then(
      ([current, history]) => {
        if (!live) return;
        setOpen(current);
        setArchived(history);
      },
    );
    return () => {
      live = false;
    };
  }, [repo]);

  useFocusEffect(load);

  const rows = [
    ...(open ? [open] : []),
    ...archived.filter((session) => session.id !== open?.id),
  ];
  const selected = rows.find((session) => session.id === selectedId) ?? null;

  async function resume(session: Session) {
    if (session.status === "void") return;
    const current = await repo.getOpen();
    if (current && current.id !== session.id) {
      setNotice("請先完成現時牌局");
      return;
    }
    await repo.saveOpen(resumeSession(session));
    if (!current) await repo.deleteArchived(session.id);
    router.replace("/session" as Href);
  }

  async function remove(session: Session) {
    const current = await repo.getOpen();
    if (current?.id === session.id) {
      setNotice("進行中的牌局不能刪除");
      return;
    }
    await repo.deleteArchived(session.id);
    setSelectedId(null);
    const history = await repo.listArchived();
    setArchived(history);
  }

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen options={{ title: "牌局紀錄" }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Action label="返回首頁" onPress={() => router.replace("/")} />
        <ThemedText accessibilityLanguage={APP_LOCALE} type="title">
          牌局紀錄
        </ThemedText>
        {notice ? (
          <ThemedText accessibilityLanguage={APP_LOCALE}>{notice}</ThemedText>
        ) : null}
        {rows.length === 0 ? (
          <ThemedText accessibilityLanguage={APP_LOCALE}>未有牌局</ThemedText>
        ) : null}
        {rows.map((session) => (
          <View key={session.id} style={{ gap: 12, paddingVertical: 12 }}>
            <ThemedText type="subtitle">{heading(session)}</ThemedText>
            <DataTable
              headers={["玩法", "狀態"]}
              widths={[200, 110]}
              rows={[[session.rules.name, sessionStatusLabel(session.status)]]}
            />
            <DataTable
              headers={["玩家", "累積分數"]}
              widths={[160, 150]}
              rows={session.players.map((p) => [
                p.name,
                formatBalance(p.balance),
              ])}
            />
            <Action
              label="查看牌局明細"
              onPress={() => setSelectedId(session.id)}
            />
          </View>
        ))}
        {selected ? (
          <ThemedView style={styles.detail}>
            <ThemedText accessibilityLanguage={APP_LOCALE}>
              {heading(selected)}
            </ThemedText>
            <LedgerTable session={selected} />
            {selected.status === "void" ? null : (
              <Pressable
                accessibilityLanguage={APP_LOCALE}
                accessibilityRole="button"
                onPress={() => resume(selected)}
                style={styles.row}
              >
                <ThemedText>繼續牌局</ThemedText>
              </Pressable>
            )}
            <Pressable
              accessibilityLanguage={APP_LOCALE}
              accessibilityRole="button"
              onPress={() => remove(selected)}
              style={styles.row}
            >
              <ThemedText>刪除</ThemedText>
            </Pressable>
          </ThemedView>
        ) : null}
        <Pressable
          accessibilityLanguage={APP_LOCALE}
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.row}
        >
          <ThemedText>返回</ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

function heading(session: Session): string {
  const when = new Intl.DateTimeFormat("zh-Hant-HK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(session.startedAt));
  return session.title ? `${session.title} · ${when}` : when;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    padding: 24,
    gap: 16,
  },
  row: { gap: Spacing.one, paddingVertical: Spacing.two },
  detail: { gap: Spacing.one, paddingVertical: Spacing.two },
});
