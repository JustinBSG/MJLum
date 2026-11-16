import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  View,
} from "react-native";
import Svg, { Circle, Rect } from "react-native-svg";
import { Minus, Plus } from "lucide-react-native";
import {
  clampDiceCount,
  MIN_DICE,
  MAX_DICE,
  rollDice,
  type DiceRoll,
} from "@/session/dice";
import { Action, palette } from "./table-ui";
import { ThemedText } from "./themed-text";

const PIPS = [
  [],
  [[24, 24]],
  [
    [12, 12],
    [36, 36],
  ],
  [
    [12, 12],
    [24, 24],
    [36, 36],
  ],
  [
    [12, 12],
    [36, 12],
    [12, 36],
    [36, 36],
  ],
  [
    [12, 12],
    [36, 12],
    [24, 24],
    [12, 36],
    [36, 36],
  ],
  [
    [12, 12],
    [36, 12],
    [12, 24],
    [36, 24],
    [12, 36],
    [36, 36],
  ],
];

export function DiceRoller({ onClose }: { onClose: () => void }) {
  const [count, setCount] = useState(MIN_DICE);
  const [faces, setFaces] = useState<number[]>([1]);
  const [result, setResult] = useState<DiceRoll | null>(null);
  const [rolling, setRolling] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(true);
  const [motion] = useState(() => new Animated.Value(0));
  const locked = useRef(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const animation = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    let live = true;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (live) setReduceMotion(value);
      })
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    return () => {
      live = false;
      subscription.remove();
    };
  }, []);

  useEffect(
    () => () => {
      if (timer.current !== null) clearInterval(timer.current);
      animation.current?.stop();
    },
    [],
  );

  function changeCount(next: number) {
    if (locked.current) return;
    const n = clampDiceCount(next);
    setCount(n);
    setFaces(Array(n).fill(1));
    setResult(null);
  }

  function roll() {
    if (locked.current) return;
    // Only this call determines the result; intermediate faces are decorative.
    const final = rollDice(count);
    if (reduceMotion) {
      setFaces(final.faces);
      setResult(final);
      return;
    }
    locked.current = true;
    setRolling(true);
    setResult(null);
    let frame = 0;
    timer.current = setInterval(() => {
      frame += 1;
      setFaces(
        Array.from({ length: count }, (_, i) => 1 + ((frame + i * 2) % 6)),
      );
    }, 70);
    motion.setValue(0);
    animation.current = Animated.timing(motion, {
      toValue: 1,
      duration: 720,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.current.start(({ finished }) => {
      if (timer.current !== null) clearInterval(timer.current);
      timer.current = null;
      locked.current = false;
      if (!finished) return;
      setFaces(final.faces);
      setResult(final);
      setRolling(false);
    });
  }

  return (
    <View style={styles.panel}>
      <ThemedText type="subtitle">擲骰</ThemedText>
      <View style={styles.controls}>
        <Action
          label="減少"
          icon={Minus}
          onPress={() => changeCount(count - 1)}
          disabled={rolling || count === MIN_DICE}
        />
        <ThemedText style={styles.count}>{`${count} 粒`}</ThemedText>
        <Action
          label="增加"
          icon={Plus}
          onPress={() => changeCount(count + 1)}
          disabled={rolling || count === MAX_DICE}
        />
      </View>
      <View
        style={styles.tray}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {faces.map((face, i) => (
          <Animated.View
            key={i}
            style={{
              transform: [
                {
                  translateY: motion.interpolate({
                    inputRange: [0, 0.2, 0.4, 0.65, 0.85, 1],
                    outputRange: [0, -16, -4, -12, -2, 0],
                  }),
                },
                {
                  rotate: motion.interpolate({
                    inputRange: [0, 0.25, 0.5, 0.75, 1],
                    outputRange:
                      i % 2
                        ? ["0deg", "-100deg", "45deg", "-25deg", "0deg"]
                        : ["0deg", "100deg", "-45deg", "25deg", "0deg"],
                  }),
                },
              ],
            }}
          >
            <Svg width={56} height={56} viewBox="0 0 48 48" aria-hidden>
              <Rect
                x={1}
                y={1}
                width={46}
                height={46}
                rx={10}
                fill={palette.surface}
                stroke={palette.line}
                strokeWidth={2}
              />
              {PIPS[face].map(([cx, cy], p) => (
                <Circle
                  key={p}
                  cx={cx}
                  cy={cy}
                  r={3.5}
                  fill={
                    face === 1 || face === 4
                      ? palette.negative
                      : palette.primary
                  }
                />
              ))}
            </Svg>
          </Animated.View>
        ))}
      </View>
      <View
        style={styles.result}
        accessibilityLiveRegion="polite"
        accessible
        accessibilityLabel={
          rolling
            ? "擲骰中"
            : result
              ? `骰仔點數 ${result.faces.join("、")}，總點數 ${result.total}，${result.seat}`
              : "按擲骰開始"
        }
      >
        <ThemedText type="small" themeColor="textSecondary">
          {rolling ? "擲骰中…" : result ? "總點數" : "按擲骰開始"}
        </ThemedText>
        {result ? (
          <>
            <ThemedText style={styles.total}>{result.total}</ThemedText>
            <ThemedText style={styles.seat}>{result.seat}</ThemedText>
          </>
        ) : null}
      </View>
      <Action
        label={rolling ? "擲骰中…" : "擲骰"}
        primary
        onPress={roll}
        disabled={rolling}
      />
      <Action label="返回牌桌" onPress={onClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: 20,
    padding: 20,
    borderRadius: 20,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
  },
  controls: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  count: { fontSize: 20, fontWeight: "700", fontVariant: ["tabular-nums"] },
  tray: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "center",
    padding: 20,
    paddingTop: 32,
    backgroundColor: palette.background,
    borderRadius: 16,
    minHeight: 112,
  },
  result: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 114,
    gap: 4,
  },
  total: {
    fontSize: 44,
    lineHeight: 52,
    fontWeight: "700",
    color: palette.primary,
    fontVariant: ["tabular-nums"],
  },
  seat: { fontSize: 20, fontWeight: "600" },
});
