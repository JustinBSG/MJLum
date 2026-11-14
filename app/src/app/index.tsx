import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
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
});
