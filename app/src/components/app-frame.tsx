import type { ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, usePathname } from "expo-router";
import { Action, palette } from "./table-ui";
import { ThemedText } from "./themed-text";
export function AppFrame({ children }: { children: ReactNode }) {
  const path = usePathname();
  const titles: Record<string, string> = {
    "/rules": "玩法設定",
    "/rules/hong-kong": "香港玩法",
    "/rules/family": "玩法",
    "/session/seat": "玩家入座",
  };
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: palette.background, paddingTop: 16 }}
    >
      {titles[path] ? (
        <View
          style={{
            paddingHorizontal: 24,
            paddingBottom: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Action
            label="返回"
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/")
            }
          />
          <ThemedText type="subtitle">{titles[path]}</ThemedText>
        </View>
      ) : null}
      {children}
    </SafeAreaView>
  );
}
