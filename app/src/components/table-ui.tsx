import { useState } from "react";
import { Pressable, StyleSheet, Switch, View } from "react-native";
import { Check, ChevronRight, type LucideIcon } from "lucide-react-native";
import { ThemedText } from "./themed-text";

export const palette = {
  ink: "#17243B",
  muted: "#475569",
  primary: "#1E3A8A",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  line: "#CBD5E1",
  selected: "#E8EEF9",
  positive: "#166534",
  negative: "#B42318",
};
export function Action({
  label,
  onPress,
  selected = false,
  disabled = false,
  primary = false,
  icon: Icon,
}: {
  label: string;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
  primary?: boolean;
  icon?: LucideIcon;
}) {
  const [focus, setFocus] = useState(false);
  const toggle = / (開|關|啟用|關閉)$/.test(label);
  const title = label
    .replace(/ (開|關|啟用|關閉)$/, "")
    .replaceAll("Jackpot", "彩池");
  if (toggle)
    return (
      <View style={s.toggle}>
        <ThemedText style={{ flex: 1 }}>{title}</ThemedText>
        <Switch
          accessibilityLabel={title}
          disabled={disabled}
          value={selected}
          onValueChange={onPress}
          thumbColor={palette.surface}
          hitSlop={8}
          trackColor={{ false: "#94A3B8", true: palette.primary }}
        />
      </View>
    );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={({ pressed }) => [
        s.action,
        selected && s.selected,
        primary && s.primary,
        pressed && { opacity: 0.75 },
        disabled && { opacity: 0.4 },
        focus && s.focus,
      ]}
    >
      {Icon ? (
        <Icon
          size={20}
          color={primary ? "white" : palette.primary}
          aria-hidden={true}
        />
      ) : null}
      <ThemedText
        style={[
          { flexShrink: 1, fontWeight: "600" },
          primary && { color: "white" },
        ]}
      >
        {title}
      </ThemedText>
      {selected ? (
        <Check size={18} color={palette.primary} aria-hidden={true} />
      ) : null}
    </Pressable>
  );
}
export function MenuRow({
  title,
  description,
  onPress,
  icon: Icon,
}: {
  title: string;
  description?: string;
  onPress: () => void;
  icon: LucideIcon;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [s.menu, pressed && s.selected]}
    >
      <Icon color={palette.primary} size={24} aria-hidden={true} />
      <View style={{ flex: 1, gap: 4 }}>
        <ThemedText style={{ fontWeight: "700" }}>{title}</ThemedText>
        {description ? (
          <ThemedText themeColor="textSecondary" type="small">
            {description}
          </ThemedText>
        ) : null}
      </View>
      <ChevronRight color={palette.muted} size={20} aria-hidden={true} />
    </Pressable>
  );
}
const s = StyleSheet.create({
  action: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: palette.muted,
    borderRadius: 12,
    backgroundColor: palette.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  selected: { backgroundColor: palette.selected, borderColor: palette.primary },
  primary: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
    minHeight: 56,
  },
  focus: { outlineWidth: 3, outlineColor: palette.primary, outlineOffset: 3 },
  toggle: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: palette.line,
    width: "100%",
  },
  menu: {
    minHeight: 80,
    padding: 20,
    backgroundColor: palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.line,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
});
