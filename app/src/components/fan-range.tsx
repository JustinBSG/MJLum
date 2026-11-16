import { useRef, useState, useEffect, useMemo } from "react";
import { PanResponder, Pressable, View, StyleSheet } from "react-native";
import { ThemedText } from "./themed-text";
import { palette } from "./table-ui";
export function FanRange({
  min,
  max,
  onChange,
}: {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}) {
  const [width, setWidth] = useState(1);
  const [extent, setExtent] = useState(13);
  const limit = Math.max(extent, max);
  const usable = Math.max(1, width - 48);
  function update(kind: "min" | "max", v: number) {
    v = Math.max(0, Math.min(limit, Math.round(v)));
    if (kind === "min") onChange(Math.min(v, max), max);
    else onChange(min, Math.max(min, v));
  }
  return (
    <View style={s.box}>
      <View style={s.labels}>
        <ThemedText style={s.label}>{`起糊 ${min} 番`}</ThemedText>
        <ThemedText style={s.label}>{`滿糊 ${max} 番`}</ThemedText>
      </View>
      <View
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        style={{ height: 64 }}
      >
        <Pressable
          accessibilityLabel="按滑桿調整最近端點"
          onPress={(e) => {
            const v = (e.nativeEvent.locationX / usable) * limit;
            update(Math.abs(v - min) < Math.abs(v - max) ? "min" : "max", v);
          }}
          hitSlop={{ top: 18, bottom: 18 }}
          style={[s.track, { left: 24, right: 24 }]}
        />
        <View
          pointerEvents="none"
          style={[
            s.fill,
            {
              left: 24 + (min / limit) * usable,
              width: ((max - min) / limit) * usable,
            },
          ]}
        />
        <Handle
          label="起糊"
          value={min}
          left={(min / limit) * usable}
          limit={limit}
          usable={usable}
          onValue={(v) => update("min", v)}
        />
        <Handle
          label="滿糊"
          value={max}
          left={(max / limit) * usable}
          limit={limit}
          usable={usable}
          onValue={(v) => update("max", v)}
        />
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        拖動兩端圓點，設定可選番數範圍。
      </ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`顯示更高番數，目前滑桿範圍0至${limit}番`}
        onPress={() => setExtent(limit + 13)}
        style={({ pressed }) => ({
          minHeight: 48,
          justifyContent: "center",
          borderRadius: 8,
          paddingHorizontal: 8,
          backgroundColor: pressed ? palette.selected : palette.surface,
        })}
      >
        <ThemedText type="small" style={{ color: palette.primary }}>
          顯示更高番數
        </ThemedText>
      </Pressable>
    </View>
  );
}
function Handle({
  label,
  value,
  left,
  limit,
  usable,
  onValue,
}: {
  label: string;
  value: number;
  left: number;
  limit: number;
  usable: number;
  onValue: (v: number) => void;
}) {
  const latest = useRef({ value, limit, usable, onValue });
  useEffect(() => {
    latest.current = { value, limit, usable, onValue };
  }, [value, limit, usable, onValue]);
  const base = useRef(value);
  // PanResponder invokes these callbacks only during gestures, after render.
  // Keep one responder for the entire drag while reading the latest bounds.
  /* eslint-disable react-hooks/refs, react-hooks/preserve-manual-memoization */
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          base.current = latest.current.value;
        },
        onPanResponderMove: (_, g) =>
          latest.current.onValue(
            base.current +
              (g.dx / latest.current.usable) * latest.current.limit,
          ),
        onPanResponderTerminationRequest: () => false,
      }),
    [],
  );
  /* eslint-enable react-hooks/refs, react-hooks/preserve-manual-memoization */
  return (
    <View
      {...responder.panHandlers}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{
        min: 0,
        max: limit,
        now: value,
        text: `${value}番`,
      }}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      onAccessibilityAction={(e) =>
        onValue(value + (e.nativeEvent.actionName === "increment" ? 1 : -1))
      }
      style={[s.handle, { left }]}
    >
      <View style={s.dot} />
    </View>
  );
}
const s = StyleSheet.create({
  box: {
    gap: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 16,
    backgroundColor: palette.surface,
  },
  labels: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontWeight: "700", color: palette.primary },
  track: {
    position: "absolute",
    top: 26,
    height: 12,
    backgroundColor: palette.line,
    borderRadius: 6,
  },
  fill: {
    position: "absolute",
    top: 26,
    height: 12,
    backgroundColor: palette.primary,
    borderRadius: 6,
  },
  handle: {
    position: "absolute",
    top: 8,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: palette.surface,
    borderWidth: 5,
    borderColor: palette.primary,
  },
});
