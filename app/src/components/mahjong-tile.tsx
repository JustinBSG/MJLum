import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';
import { ThemedText } from './themed-text';

export const MahjongColors = {
  jade: '#245B48',
  felt: '#EDF4EF',
  ivory: '#FFFEF8',
  edge: '#C8D7CB',
  red: '#A93228',
};

/** A physical tile silhouette; it is never an interactive control. */
export function MahjongTile({
  face,
  compact = false,
  red = false,
  label,
}: {
  face: string;
  compact?: boolean;
  red?: boolean;
  label?: string;
}) {
  return (
    <View
      accessible={!!label}
      accessibilityLabel={label}
      accessibilityLanguage="zh-Hant-HK"
      style={[styles.tile, compact && styles.compact]}
    >
      {face === 'dots' ? (
        <Svg width={32} height={40} viewBox="0 0 32 40" aria-hidden={true}>
          {[
            { x: 8, y: 9, color: MahjongColors.jade },
            { x: 16, y: 20, color: MahjongColors.red },
            { x: 24, y: 31, color: '#1E3A8A' },
          ].map((pip) => (
            <Circle
              key={pip.y}
              cx={pip.x}
              cy={pip.y}
              r={5}
              fill="none"
              stroke={pip.color}
              strokeWidth={2.5}
            />
          ))}
        </Svg>
      ) : face === '白' ? (
        <Svg width={30} height={38} viewBox="0 0 30 38" aria-hidden={true}>
          <Rect
            x={4}
            y={4}
            width={22}
            height={30}
            rx={2}
            fill="none"
            stroke="#1E3A8A"
            strokeWidth={2}
          />
          <Rect
            x={7}
            y={7}
            width={16}
            height={24}
            rx={1}
            fill="none"
            stroke="#1E3A8A"
            strokeWidth={1}
          />
        </Svg>
      ) : (
        <ThemedText
          style={[styles.face, compact && styles.smallFace, red && styles.red]}
        >
          {face}
        </ThemedText>
      )}
    </View>
  );
}

export function MahjongMotif() {
  return (
    <View
      style={styles.motif}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden={true}
    >
      <MahjongTile face="中" red />
      <MahjongTile face="發" />
      <MahjongTile face="白" />
      <MahjongTile face="dots" />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: 44,
    height: 58,
    borderRadius: 7,
    backgroundColor: MahjongColors.ivory,
    borderWidth: 1,
    borderColor: MahjongColors.edge,
    borderBottomWidth: 5,
    borderBottomColor: MahjongColors.jade,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: { width: 34, height: 44, borderRadius: 6, borderBottomWidth: 4 },
  face: {
    fontSize: 29,
    lineHeight: 40,
    fontWeight: '700',
    color: MahjongColors.jade,
  },
  smallFace: { fontSize: 23, lineHeight: 32 },
  red: { color: MahjongColors.red },
  motif: { flexDirection: 'row', gap: 8, alignItems: 'center' },
});
