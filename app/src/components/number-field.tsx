import { useRef, useState, type ComponentRef } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Delete } from "lucide-react-native";
import { Action, palette } from "./table-ui";
import { ThemedText } from "./themed-text";

export function NumberField(props: TextInputProps) {
  const numeric =
    props.keyboardType === "number-pad" ||
    props.keyboardType === "decimal-pad" ||
    /分數|金額|倍數|倍率|須付/.test(props.accessibilityLabel ?? "");
  const [open, setOpen] = useState(false);
  const [stored, setStored] = useState(props.defaultValue ?? "");
  const [draft, setDraft] = useState("");
  const inset = useSafeAreaInsets();
  const trigger = useRef<ComponentRef<typeof View>>(null);
  if (!numeric) return <TextInput {...props} />;
  const value = props.value ?? stored;
  const integer = props.keyboardType === "number-pad";
  function key(k: string) {
    setDraft((v) =>
      k === "刪除" ? v.slice(0, -1) : k === "清除" ? "" : v + k,
    );
  }
  const valid = integer
    ? /^\d+$/.test(draft)
    : /^[+-]?(?:\d+|\d+\.\d+|\d+\/[1-9]\d*)$/.test(draft);
  function finish() {
    if (!valid) return;
    setStored(draft);
    props.onChangeText?.(draft);
    setOpen(false);
  }
  return (
    <>
      <Pressable
        ref={trigger}
        accessibilityRole="button"
        accessibilityLanguage="zh-HK"
        disabled={props.editable === false}
        accessibilityLabel={`${props.accessibilityLabel}，${value || "未填"}，按下輸入`}
        onPress={() => {
          setDraft(value);
          setOpen(true);
        }}
        style={[s.field, props.style]}
      >
        <ThemedText
          style={{
            fontSize: 20,
            fontVariant: ["tabular-nums"],
            color: value ? palette.ink : palette.muted,
          }}
        >
          {value || props.placeholder || "輸入數字"}
        </ThemedText>
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="none"
        onRequestClose={() => setOpen(false)}
        onDismiss={() => trigger.current?.focus()}
      >
        <View style={s.scrim}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
          >
            <View
              role="dialog"
              accessibilityLabel={props.accessibilityLabel}
              accessibilityViewIsModal
              style={[s.sheet, { paddingBottom: Math.max(24, inset.bottom) }]}
            >
              <ThemedText type="subtitle">
                {props.accessibilityLabel}
              </ThemedText>
              <TextInput
                accessibilityLabel={props.accessibilityLabel}
                value={draft}
                onChangeText={setDraft}
                showSoftInputOnFocus={false}
                autoFocus={Platform.OS === "web"}
                style={s.display}
              />
              <View style={s.keys}>
                {[
                  "1",
                  "2",
                  "3",
                  "4",
                  "5",
                  "6",
                  "7",
                  "8",
                  "9",
                  integer ? "清除" : ".",
                  "0",
                  "刪除",
                  ...(!integer ? ["/", "−", "清除"] : []),
                ].map((k) => (
                  <Pressable
                    key={k}
                    accessibilityRole="button"
                    accessibilityLabel={k === "/" ? "分數線" : k}
                    onPress={() => key(k === "−" ? "-" : k)}
                    style={({ pressed }) => [
                      s.key,
                      pressed && { backgroundColor: palette.selected },
                    ]}
                  >
                    {k === "刪除" ? (
                      <Delete color={palette.ink} size={24} aria-hidden />
                    ) : (
                      <ThemedText style={{ fontSize: k === "清除" ? 16 : 24 }}>
                        {k}
                      </ThemedText>
                    )}
                  </Pressable>
                ))}
              </View>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Action label="取消" onPress={() => setOpen(false)} />
                </View>
                <View style={{ flex: 2 }}>
                  <Action
                    label="完成輸入"
                    disabled={!valid}
                    primary
                    onPress={finish}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
const s = StyleSheet.create({
  field: {
    minHeight: 52,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: palette.surface,
  },
  scrim: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.48)",
    justifyContent: "flex-end",
  },
  sheet: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    padding: 24,
    gap: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: palette.surface,
  },
  display: {
    fontSize: 36,
    fontVariant: ["tabular-nums"],
    color: palette.ink,
    minHeight: 64,
    borderBottomWidth: 2,
    borderColor: palette.primary,
    textAlign: "right",
  },
  keys: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  key: {
    width: "31%",
    flexGrow: 1,
    minHeight: 56,
    borderRadius: 12,
    backgroundColor: palette.background,
    alignItems: "center",
    justifyContent: "center",
  },
});
