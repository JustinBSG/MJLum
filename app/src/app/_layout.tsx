import { AppFrame } from "@/components/app-frame";
import { DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { ui } from "@/locale";
import { LocalStoreRoot } from "@/storage/local-store-root";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <LocalStoreRoot>
        <AppFrame>
          <Stack screenOptions={{ headerShown: false, title: ui.appName }} />
        </AppFrame>
      </LocalStoreRoot>
    </ThemeProvider>
  );
}
