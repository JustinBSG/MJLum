import { router, type Href } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { APP_LOCALE, ui } from '@/locale';

export default function HomeScreen() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedText accessibilityLanguage={APP_LOCALE} type="title" style={styles.title}>
        {ui.appName}
      </ThemedText>
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
