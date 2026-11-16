import { StyleSheet, View } from 'react-native';
import Svg, { Line, Polygon } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { APP_LOCALE } from '@/locale';
import { Score } from '@/score/score';
import { formatRate } from '@/session/statistics';

const AXES = [
  { key: 'attack', label: '進攻', angle: -Math.PI / 2 },
  { key: 'strength', label: '牌力', angle: -Math.PI / 2 + (2 * Math.PI) / 3 },
  { key: 'defense', label: '防守', angle: -Math.PI / 2 + (4 * Math.PI) / 3 },
] as const;

const SIZE = 240;
const CENTER = SIZE / 2;
const RADIUS = 62;

export function RadarChart({
  attack,
  strength,
  defense,
  color,
  track,
}: {
  attack: string | null;
  strength: string | null;
  defense: string | null;
  color: string;
  track: string;
}) {
  const values = { attack, strength, defense };
  const ring = (ratio: number) =>
    AXES.map((axis) => spot(axis.angle, ratio))
      .map((point) => `${point.x},${point.y}`)
      .join(' ');
  const valueRing = AXES.map((axis) => spot(axis.angle, unit(values[axis.key])))
    .map((point) => `${point.x},${point.y}`)
    .join(' ');

  return (
    <View style={styles.chart}>
      <Svg width={SIZE} height={SIZE}>
        <Polygon points={ring(1)} fill={track} stroke={color} strokeWidth={1} />
        <Polygon
          points={ring(0.5)}
          fill="none"
          stroke={color}
          strokeWidth={1}
        />
        {AXES.map((axis) => {
          const end = spot(axis.angle, 1);
          return (
            <Line
              key={axis.key}
              x1={CENTER}
              y1={CENTER}
              x2={end.x}
              y2={end.y}
              stroke={color}
              strokeWidth={1}
            />
          );
        })}
        {attack !== null && strength !== null && defense !== null ? (
          <Polygon
            points={valueRing}
            fill={color}
            fillOpacity={0.15}
            stroke={color}
            strokeWidth={2}
          />
        ) : null}
      </Svg>
      {AXES.map((axis) => {
        const point = spot(axis.angle, 1.22);
        return (
          <ThemedText
            accessibilityLanguage={APP_LOCALE}
            key={axis.key}
            style={[styles.label, { left: point.x - 50, top: point.y - 10 }]}
          >
            {axisCaption(axis.label, values[axis.key])}
          </ThemedText>
        );
      })}
    </View>
  );
}

function spot(angle: number, ratio: number): { x: number; y: number } {
  return {
    x: CENTER + Math.cos(angle) * RADIUS * ratio,
    y: CENTER + Math.sin(angle) * RADIUS * ratio,
  };
}

function axisCaption(label: string, exact: string | null): string {
  return exact === null ? `${label} 未有資料` : `${label} ${formatRate(exact)}`;
}

/** Pixel radius only. The stored rate stays an exact string. A missing axis sits at the centre. */
function unit(exact: string | null): number {
  if (exact === null) return 0;
  const value = Score.fromString(exact);
  const zero = Score.fromString('0');
  const hundred = Score.fromString('100');
  const clamped =
    value.compare(zero) < 0
      ? zero
      : value.compare(hundred) > 0
        ? hundred
        : value;
  return Number(clamped.numerator) / Number(clamped.denominator) / 100;
}

const styles = StyleSheet.create({
  chart: { width: SIZE, height: SIZE, alignSelf: 'center' },
  label: {
    position: 'absolute',
    width: 100,
    fontSize: 14,
    textAlign: 'center',
  },
});
