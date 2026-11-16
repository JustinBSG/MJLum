import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { ui } from '@/locale';
import { LocalStoreRoot } from '@/storage/local-store-root';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <LocalStoreRoot>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            title: ui.appName,
            headerBackTitle: '返回',
            headerTintColor: '#1E3A8A',
            headerStyle: { backgroundColor: '#FFFFFF' },
            contentStyle: { backgroundColor: '#F8FAFC' },
          }}
        />
      </LocalStoreRoot>
    </ThemeProvider>
  );
}
