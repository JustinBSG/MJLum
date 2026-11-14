import { router, Stack, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { APP_LOCALE } from '@/locale';
import { useRuleRepository } from '@/rules/repository';
import type { RuleSetup } from '@/rules/types';
import { useSessionRepository } from '@/session/repository';
import { canStart, seatCount, startSession } from '@/session/session';

export default function SeatScreen() {
  const theme = useTheme();
  const rulesRepo = useRuleRepository();
  const sessions = useSessionRepository();
  const [rules, setRules] = useState<RuleSetup | null>(null);
  const [names, setNames] = useState<string[]>([]);
  const [dealerIndex, setDealerIndex] = useState(0);

  const count = rules ? seatCount(rules) : 0;
  if (rules && names.length !== count) {
    setNames(Array.from({ length: count }, () => ''));
  }

  useFocusEffect(
    useCallback(() => {
      let live = true;
      Promise.all([rulesRepo.getActive(), sessions.getOpen()]).then(([active, open]) => {
        if (!live) return;
        if (open) {
          router.replace('/session' as Href);
          return;
        }
        if (!active) {
          router.replace('/rules' as Href);
          return;
        }
        setRules(active);
      });
      return () => {
        live = false;
      };
    }, [rulesRepo, sessions]),
  );

  async function start() {
    if (!rules || !canStart(rules, names, dealerIndex)) return;
    const session = startSession({
      rules,
      names,
      dealerIndex: rules.trackDealer ? dealerIndex : null,
      startedAt: new Date().toISOString(),
    });
    await sessions.saveOpen(session);
    router.replace('/session' as Href);
  }

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen options={{ title: '入座' }} />
      {rules ? (
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText accessibilityLanguage={APP_LOCALE}>{rules.name}</ThemedText>
          {names.map((name, index) => (
            <ThemedView key={index} style={styles.seat}>
              <TextInput
                accessibilityLabel="玩家名稱"
                accessibilityLanguage={APP_LOCALE}
                onChangeText={(text) => setNames(names.map((item, itemIndex) => (itemIndex === index ? text : item)))}
                placeholder="玩家名稱"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                value={name}
              />
              {rules.trackDealer ? (
                <Pressable
                  accessibilityLanguage={APP_LOCALE}
                  accessibilityRole="button"
                  accessibilityState={{ selected: dealerIndex === index }}
                  onPress={() => setDealerIndex(index)}
                  style={styles.mark}>
                  <ThemedText>{dealerIndex === index ? '莊 · 已選' : '莊'}</ThemedText>
                </Pressable>
              ) : null}
            </ThemedView>
          ))}
          <Pressable accessibilityLanguage={APP_LOCALE} accessibilityRole="button" onPress={start} style={styles.mark}>
            <ThemedText>開始</ThemedText>
          </Pressable>
        </ScrollView>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: Spacing.three, gap: Spacing.two, paddingBottom: Spacing.six },
  seat: { gap: Spacing.one },
  input: { minHeight: 48, borderWidth: 1, paddingHorizontal: Spacing.two, fontSize: 18 },
  mark: { minHeight: 48, justifyContent: 'center', paddingHorizontal: Spacing.two },
});
