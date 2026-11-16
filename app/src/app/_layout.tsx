import { AppFrame } from "@/components/app-frame";
import { StartupCover } from "@/components/loading-screen";
import { View } from "react-native";
import { DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { ui } from "@/locale";
import { LocalStoreRoot } from "@/storage/local-store-root";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <View style={{ flex: 1 }}>
        <LocalStoreRoot>
          <AppFrame>
            <Stack screenOptions={{ headerShown: false, title: ui.appName }} />
          </AppFrame>
          <StartupCover />
        </LocalStoreRoot>
      </View>
    </ThemeProvider>
  );
}
