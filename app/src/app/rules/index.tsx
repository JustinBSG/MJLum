import { router, Stack, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { APP_LOCALE } from '@/locale';
import { RULE_FAMILIES } from '@/rules/presets';

export default function RulesScreen() {
  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen options={{ title: '玩法設定' }} />
      <ScrollView contentContainerStyle={styles.content}>
        {RULE_FAMILIES.map((family) => (
          <Pressable
            accessibilityLanguage={APP_LOCALE}
            accessibilityRole="button"
            key={family.id}
            onPress={() =>
              router.push(
                (family.id === 'hong-kong'
                  ? '/rules/hong-kong'
                  : `/rules/family?id=${family.id}`) as Href,
              )
            }
            style={styles.row}
          >
            <ThemedText>{family.label}</ThemedText>
          </Pressable>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: 20,
    gap: 16,
  },
  row: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 8,
    minHeight: 64,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
