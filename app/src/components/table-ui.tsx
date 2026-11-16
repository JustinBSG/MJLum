import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedText } from './themed-text';

export const TableColors = {
  ink: '#172B4D',
  navy: '#1E3A8A',
  muted: '#475569',
  paper: '#F8FAFC',
  line: '#CBD5E1',
  soft: '#E9EEF5',
  positive: '#166534',
  negative: '#B42318',
};
export type IconName =
  | 'plus'
  | 'arrow'
  | 'back'
  | 'chart'
  | 'scores'
  | 'wallet'
  | 'history'
  | 'settings'
  | 'check'
  | 'shield';
// Heroicons outline, 24 × 24, MIT licence.
const paths: Record<IconName, string> = {
  plus: 'M12 4.5v15m7.5-7.5h-15',
  arrow: 'M4.5 12h15m-6-6 6 6-6 6',
  back: 'm15.75 19.5-7.5-7.5 7.5-7.5',
  chart: 'M3 3v18h18M7.5 16.5v-6m4.5 6V6m4.5 10.5v-9',
  scores: 'M3.75 3.75h6v6h-6zm10.5 0h6v6h-6zm-10.5 10.5h6v6h-6zm10.5 0h6v6h-6z',
  wallet:
    'M21 8.25v10.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.75V6a2.25 2.25 0 0 1 2.25-2.25h12A1.5 1.5 0 0 1 18.75 5.25V7.5M3 7.5h16.5A1.5 1.5 0 0 1 21 9m-4.5 4.5h.008v.008H16.5z',
  history: 'M12 6v6l4 2M3 10a9 9 0 1 1 1.5 7M3 4v6h6',
  settings: 'M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6m-8 0v6',
  check: 'm4.5 12.75 6 6 9-13.5',
  shield:
    'M12 3 3.75 6v5.25c0 4.5 3 7.5 8.25 9.75 5.25-2.25 8.25-5.25 8.25-9.75V6L12 3zm-4 9 2.5 2.5 5-5',
};
export function Icon({
  name,
  color = TableColors.navy,
  size = 24,
}: {
  name: IconName;
  color?: string;
  size?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden={true}
    >
      <Path
        d={paths[name]}
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
export function TableButton({
  label,
  icon,
  primary = false,
  selected = false,
  busy = false,
  style,
  ...props
}: PressableProps & {
  label: string;
  icon?: IconName;
  primary?: boolean;
  selected?: boolean;
  busy?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const filled = primary || selected;
  return (
    <Pressable
      {...props}
      disabled={props.disabled || busy}
      accessibilityRole="button"
      accessibilityLanguage="zh-HK"
      accessibilityState={{
        selected,
        disabled: !!props.disabled || busy,
        busy,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={(state) => [
        s.button,
        filled && s.filled,
        state.pressed && s.pressed,
        (props.disabled || busy) && s.disabled,
        focused && s.focus,
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={filled ? '#FFFFFF' : TableColors.navy} />
      ) : icon ? (
        <Icon
          name={icon}
          color={filled ? '#FFFFFF' : TableColors.navy}
          size={21}
        />
      ) : null}
      <ThemedText style={[s.buttonText, filled && s.white]}>{label}</ThemedText>
      {selected && !icon ? (
        <Icon name="check" color="#FFFFFF" size={18} />
      ) : null}
    </Pressable>
  );
}
export function PageHeader({
  title,
  subtitle,
  home = true,
  action,
}: {
  title: string;
  subtitle?: string;
  home?: boolean;
  action?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.header, { paddingTop: insets.top + 12 }]}>
      <View style={s.headerRow}>
        {home ? (
          <TableButton
            label="主頁"
            icon="back"
            onPress={() => router.navigate('/')}
          />
        ) : (
          <View style={s.brand}>
            <ThemedText style={s.brandText}>諗</ThemedText>
          </View>
        )}
        <View style={s.headerTitle}>
          <ThemedText accessibilityRole="header" style={s.title}>
            {title}
          </ThemedText>
          {subtitle ? (
            <ThemedText style={s.caption}>{subtitle}</ThemedText>
          ) : null}
        </View>
        {action}
      </View>
    </View>
  );
}
export type TableTab = 'scores' | 'entry' | 'settle' | 'stats';
export function TableNav({
  active,
  onChange,
}: {
  active: TableTab;
  onChange: (tab: TableTab) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.nav, { paddingBottom: Math.max(10, insets.bottom) }]}>
      {(
        [
          { id: 'scores', label: '賽果', icon: 'scores' },
          { id: 'entry', label: '記分', icon: 'plus' },
          { id: 'settle', label: '找數', icon: 'wallet' },
          { id: 'stats', label: '統計', icon: 'chart' },
        ] as const
      ).map((item) => (
        <TableButton
          key={item.id}
          label={item.label}
          icon={item.icon}
          selected={active === item.id}
          onPress={() => onChange(item.id)}
          style={s.navItem}
        />
      ))}
    </View>
  );
}
export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <ThemedText accessibilityRole="header" style={s.section}>
      {children}
    </ThemedText>
  );
}
const s = StyleSheet.create({
  button: {
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: TableColors.line,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    cursor: 'pointer',
  },
  filled: { backgroundColor: TableColors.navy, borderColor: TableColors.navy },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: TableColors.navy,
    flexShrink: 1,
  },
  white: { color: '#FFFFFF' },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.45 },
  focus: { outlineWidth: 3, outlineColor: '#1E3A8A', outlineOffset: 3 },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: TableColors.line,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
  headerTitle: { flex: 1 },
  title: { fontSize: 23, lineHeight: 32, fontWeight: '700' },
  caption: { fontSize: 14, color: TableColors.muted },
  brand: {
    width: 48,
    height: 56,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: TableColors.navy,
    borderBottomWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { color: TableColors.navy, fontSize: 26, fontWeight: '700' },
  nav: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderColor: TableColors.line,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  navItem: {
    flex: 1,
    maxWidth: 180,
    flexDirection: 'column',
    paddingHorizontal: 4,
    gap: 4,
    borderWidth: 0,
  },
  section: { fontSize: 19, lineHeight: 28, fontWeight: '700', marginTop: 8 },
});
