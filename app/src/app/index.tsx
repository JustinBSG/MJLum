import { router, useFocusEffect, type Href } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { APP_LOCALE, ui } from '@/locale';
import { useRuleRepository } from '@/rules/repository';
import { useSessionRepository } from '@/session/repository';

export default function HomeScreen() {
  const rules = useRuleRepository();
  const sessions = useSessionRepository();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [hasRules, setHasRules] = useState(false);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useFocusEffect(
    useCallback(() => {
      let live = true;
      Promise.all([sessions.getOpen(), rules.getActive()]).then(([open, active]) => {
        if (!live) return;
        setHasSession(open !== null);
        setHasRules(active !== null);
        setReady(true);
      });
      return () => {
        live = false;
      };
    }, [rules, sessions]),
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText accessibilityLanguage={APP_LOCALE} type="title" style={styles.title}>
        {ui.appName}
      </ThemedText>
      {ready && hasSession ? (
        <Pressable
          accessibilityLanguage={APP_LOCALE}
          accessibilityRole="button"
          onPress={() => router.push('/session' as Href)}
          style={styles.button}>
          <ThemedText>現時賽果</ThemedText>
        </Pressable>
      ) : null}
      {ready && !hasSession ? (
        <Pressable
          accessibilityLanguage={APP_LOCALE}
          accessibilityRole="button"
          onPress={() => router.push((hasRules ? '/session/seat' : '/rules') as Href)}
          style={styles.button}>
          <ThemedText>入座</ThemedText>
        </Pressable>
      ) : null}
      <Pressable
        accessibilityLanguage={APP_LOCALE}
        accessibilityRole="button"
        onPress={() => router.push('/rules' as Href)}
        style={styles.button}>
        <ThemedText>玩法設定</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  button: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
});
