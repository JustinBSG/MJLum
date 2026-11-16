import { ScrollView, View, StyleSheet } from "react-native";
import { ThemedText } from "./themed-text";
import { palette } from "./table-ui";
export function DataTable({
  headers,
  rows,
  widths,
}: {
  headers: string[];
  rows: (string | number)[][];
  widths?: number[];
}) {
  const sizes = widths ?? headers.map(() => 120);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator
      accessibilityLabel="資料表格"
    >
      <View style={s.table}>
        <View style={[s.row, s.head]}>
          {headers.map((h, i) => (
            <ThemedText
              key={i}
              accessibilityRole="header"
              style={[
                s.cell,
                { width: sizes[i], fontWeight: "700", color: palette.primary },
              ]}
            >
              {h}
            </ThemedText>
          ))}
        </View>
        {rows.length ? (
          rows.map((row, r) => (
            <View
              key={r}
              style={[
                s.row,
                r % 2 === 1 && { backgroundColor: palette.background },
              ]}
            >
              {row.map((v, c) => (
                <ThemedText
                  key={c}
                  style={[
                    s.cell,
                    { width: sizes[c], fontVariant: ["tabular-nums"] },
                  ]}
                >
                  {v}
                </ThemedText>
              ))}
            </View>
          ))
        ) : (
          <ThemedText style={{ padding: 20 }}>未有記錄</ThemedText>
        )}
      </View>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 12,
    overflow: "hidden",
  },
  row: { flexDirection: "row", backgroundColor: palette.surface },
  head: { backgroundColor: palette.selected },
  cell: {
    padding: 12,
    minHeight: 48,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: palette.line,
    fontSize: 15,
  },
});
