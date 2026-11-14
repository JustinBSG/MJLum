import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { ui } from '@/locale';
import { LocalStoreRoot } from '@/storage/local-store-root';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <LocalStoreRoot>
        <Stack screenOptions={{ headerShown: false, title: ui.appName }} />
      </LocalStoreRoot>
    </ThemeProvider>
  );
}
