import { palette } from "@/components/table-ui";
import { router, Stack, useFocusEffect, type Href } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { APP_LOCALE } from "@/locale";
import { HONG_KONG_PRESETS, presetCaption } from "@/rules/presets";
import { useRuleRepository } from "@/rules/repository";
import type { RuleSetup } from "@/rules/types";

export default function HongKongRulesScreen() {
  const repo = useRuleRepository();
  const [saved, setSaved] = useState<RuleSetup[]>([]);
  const [active, setActive] = useState<RuleSetup | null>(null);

  useFocusEffect(
    useCallback(() => {
      let live = true;
      Promise.all([repo.listSaved(), repo.getActive()]).then(
        ([nextSaved, nextActive]) => {
          if (!live) return;
          setSaved(nextSaved);
          setActive(nextActive);
        },
      );
      return () => {
        live = false;
      };
    }, [repo]),
  );

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen options={{ title: "香港" }} />
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText accessibilityLanguage={APP_LOCALE} type="small">
          {active ? `現時玩法 ${active.name}` : "未選擇"}
        </ThemedText>

        <ThemedText type="subtitle">預設玩法</ThemedText>
        {HONG_KONG_PRESETS.map((preset) => (
          <Pressable
            accessibilityRole="button"
            key={preset.id}
            onPress={() =>
              router.push(`/rules/edit?kind=preset&id=${preset.id}` as Href)
            }
            style={styles.row}
          >
            <ThemedText>{preset.name}</ThemedText>
            <ThemedText type="small">{presetCaption(preset)} · 全銃</ThemedText>
          </Pressable>
        ))}

        <ThemedText type="subtitle">自訂玩法</ThemedText>
        {saved.length === 0 ? <ThemedText>未有自訂玩法</ThemedText> : null}
        {saved.map((setup) => (
          <Pressable
            accessibilityRole="button"
            key={setup.id}
            onPress={() =>
              router.push(`/rules/edit?kind=saved&id=${setup.id}` as Href)
            }
            style={styles.row}
          >
            <ThemedText>{setup.name}</ThemedText>
          </Pressable>
        ))}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/rules/edit?kind=custom" as Href)}
          style={styles.row}
        >
          <ThemedText>增加玩法</ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    padding: 24,
    gap: 16,
  },
  row: {
    minHeight: 64,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 16,
    backgroundColor: palette.surface,
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.one,
  },
});
