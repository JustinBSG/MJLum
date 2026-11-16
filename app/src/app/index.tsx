import { router, useFocusEffect, type Href } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import {
  PageHeader,
  TableButton,
  Icon,
  SectionHeading,
  TableColors as C,
} from '@/components/table-ui';
import { ThemedText } from '@/components/themed-text';
import { useRuleRepository } from '@/rules/repository';
import { useSessionRepository } from '@/session/repository';
import type { Session } from '@/session/types';

export default function HomeScreen() {
  const rules = useRuleRepository();
  const sessions = useSessionRepository();
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState<Session | null>(null);
  const [hasRules, setHasRules] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);
  const load = useCallback(() => {
    let live = true;
    setError(false);
    Promise.all([sessions.getOpen(), rules.getActive()])
      .then(([session, active]) => {
        if (live) {
          setOpen(session);
          setHasRules(!!active);
          setReady(true);
        }
      })
      .catch(() => {
        if (live) setError(true);
      });
    return () => {
      live = false;
    };
  }, [rules, sessions]);
  useFocusEffect(load);
  return (
    <View style={s.screen}>
      <PageHeader title="麻雀諗" subtitle="香港麻雀・牌枱記分" home={false} />
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.intro}>
          <ThemedText style={s.eyebrow}>坐低，開枱。</ThemedText>
          <ThemedText accessibilityRole="header" style={s.hero}>
            專心打牌，{'\n'}記分交畀麻雀諗。
          </ThemedText>
          <ThemedText style={s.description}>
            由第一手到最後找數，每筆都清清楚楚。
          </ThemedText>
        </View>
        {error ? (
          <View style={s.card}>
            <ThemedText accessibilityRole="alert">
              暫時未能讀取牌局，請再試。
            </ThemedText>
            <TableButton label="重試" onPress={load} />
          </View>
        ) : !ready ? (
          <ActivityIndicator accessibilityLabel="正在讀取牌局" color={C.navy} />
        ) : (
          <View style={s.card}>
            <View style={s.status}>
              <View style={s.dot} />
              <ThemedText style={s.eyebrow}>
                {open ? '牌局進行中' : '準備開新枱'}
              </ThemedText>
            </View>
            <ThemedText style={s.cardTitle}>
              {open ? open.title || open.rules.name : '今次同邊幾位打？'}
            </ThemedText>
            <ThemedText style={s.description}>
              {open
                ? `${open.players
                    .filter((p) =>
                      open.seats.some((seat) => seat.playerId === p.id),
                    )
                    .map((p) => p.name)
                    .join('、')} · 已打 ${open.handCount} 局`
                : '先揀玩法，再填玩家名稱，就可以開始。'}
            </ThemedText>
            <TableButton
              primary
              label={
                open ? '繼續牌局' : hasRules ? '入座開局' : '設定玩法，開始記分'
              }
              icon="arrow"
              onPress={() =>
                router.push(
                  (open
                    ? '/session'
                    : hasRules
                      ? '/session/seat'
                      : '/rules/hong-kong') as Href,
                )
              }
            />
          </View>
        )}
        <SectionHeading>牌枱工具</SectionHeading>
        <View style={s.tools}>
          <View style={s.tool}>
            <Icon name="settings" />
            <ThemedText style={s.toolTitle}>玩法設定</ThemedText>
            <ThemedText style={s.description}>
              預設玩法、番數及分數表
            </ThemedText>
            <TableButton
              label="設定玩法"
              onPress={() => router.push('/rules/hong-kong' as Href)}
            />
          </View>
          <View style={s.tool}>
            <Icon name="history" />
            <ThemedText style={s.toolTitle}>牌局紀錄</ThemedText>
            <ThemedText style={s.description}>翻查以往牌局與賽果</ThemedText>
            <TableButton
              label="查看紀錄"
              onPress={() => router.push('/history' as Href)}
            />
          </View>
        </View>
        <View style={s.privacy}>
          <Icon name="shield" size={19} color={C.muted} />
          <ThemedText style={s.small}>
            紀錄只儲存喺呢部裝置，毋須登入。
          </ThemedText>
        </View>
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.paper },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: 24,
    paddingBottom: 48,
    gap: 20,
  },
  intro: { paddingVertical: 16, gap: 12 },
  eyebrow: { fontSize: 14, fontWeight: '600', color: C.navy },
  hero: { fontSize: 32, lineHeight: 46, fontWeight: '700' },
  description: { color: C.muted, lineHeight: 26 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.line,
    padding: 24,
    gap: 16,
  },
  cardTitle: { fontSize: 23, lineHeight: 34, fontWeight: '700' },
  status: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.navy },
  tools: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  tool: {
    flexGrow: 1,
    flexBasis: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: C.line,
  },
  toolTitle: { fontSize: 19, fontWeight: '700' },
  privacy: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  small: { fontSize: 14, color: C.muted, flex: 1 },
});
