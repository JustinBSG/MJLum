import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { BrandMark } from "./brand-mark";
import { ThemedText } from "./themed-text";
import { palette } from "./table-ui";

export function LoadingScreen() {
  return (
    <View
      style={styles.screen}
      onLayout={() => {
        void SplashScreen.hideAsync();
      }}
    >
      <View style={styles.brand}>
        <BrandMark size={168} />
        <ThemedText style={styles.name}>麻雀諗</ThemedText>
        <ThemedText themeColor="textSecondary">
          好好打牌，記分交畀我。
        </ThemedText>
      </View>
      <View
        style={styles.status}
        accessibilityRole="progressbar"
        accessibilityLabel="正在讀取本機牌局"
      >
        <ActivityIndicator color={palette.primary} />
        <ThemedText type="small" themeColor="textSecondary">
          正在準備牌桌…
        </ThemedText>
      </View>
    </View>
  );
}

/** One brief launch cover per app mount; database initialization has its own fallback. */
export function StartupCover() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 650);
    return () => clearTimeout(timer);
  }, []);
  return visible ? (
    <View accessibilityViewIsModal style={StyleSheet.absoluteFill}>
      <LoadingScreen />
    </View>
  ) : null;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  brand: { alignItems: "center", gap: 16 },
  name: {
    fontSize: 34,
    lineHeight: 44,
    fontWeight: "700",
    color: palette.primary,
  },
  status: {
    marginTop: 56,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
});
