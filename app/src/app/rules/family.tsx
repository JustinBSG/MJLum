import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { APP_LOCALE } from '@/locale';
import { RULE_FAMILIES } from '@/rules/presets';

export default function RuleFamilyScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const family = RULE_FAMILIES.find((item) => item.id === id);

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen options={{ title: family?.label ?? '玩法' }} />
      <ThemedText accessibilityLanguage={APP_LOCALE} type="subtitle">
        {family?.label ?? '玩法'}
      </ThemedText>
      <ThemedText>詳細計法未有紀錄</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: Spacing.three, gap: Spacing.two },
});
