import { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  ChartNoAxesColumn,
} from "lucide-react-native";

import type { Session } from "@/session/types";
import { Score } from "@/score/score";
import { formatBalance } from "@/session/session";
import { settlementRows, poolUnallocated } from "@/session/settlement";
import {
  rosterStatistics,
  formatAverage,
  formatCountRate,
} from "@/session/statistics";
import { formatAmount } from "@/rules/setup";
import { RadarChart } from "./radar-chart";
import { Action, palette } from "./table-ui";
import { ThemedText } from "./themed-text";

export function SettlementSummary({
  session,
  onPool,
}: {
  session: Session;
  onPool: () => void;
}) {
  const rows = settlementRows(session);
  return (
    <View style={s.stack}>
      <ThemedText themeColor="textSecondary">
        各人累積淨額。正數收取，負數支付。
      </ThemedText>
      <View style={s.card}>
        {rows.length === 0 ? (
          <View style={s.empty}>
            <Wallet color={palette.muted} size={32} aria-hidden />
            <ThemedText type="subtitle">暫時毋須找數</ThemedText>
            <ThemedText themeColor="textSecondary">
              記錄食糊後，這裡會顯示各人淨額。
            </ThemedText>
          </View>
        ) : (
          rows.map((row) => {
            const receive =
              Score.fromString(row.balance).compare(Score.fromString("0")) > 0;
            const Icon = receive ? ArrowDownLeft : ArrowUpRight;
            return (
              <View key={row.playerId} style={s.netRow}>
                <Icon
                  color={receive ? palette.positive : palette.negative}
                  size={24}
                  aria-hidden
                />
                <View style={{ flex: 1, gap: 4 }}>
                  <ThemedText style={{ fontWeight: "700" }}>
                    {row.name}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {receive ? "應收" : "應付"}
                  </ThemedText>
                </View>
                <View style={{ alignItems: "flex-end", flexShrink: 1 }}>
                  <ThemedText
                    style={[
                      s.net,
                      { color: receive ? palette.positive : palette.negative },
                    ]}
                  >
                    {formatBalance(row.balance)}
                  </ThemedText>
                  {formatBalance(row.balance).startsWith("≈") ? (
                    <ThemedText type="small">{`精確 ${formatAmount(row.balance)}`}</ThemedText>
                  ) : null}
                </View>
              </View>
            );
          })
        )}
      </View>
      <View style={s.card}>
        <View style={s.line}>
          <ThemedText style={{ fontWeight: "700" }}>彩池餘額</ThemedText>
          <ThemedText style={s.net}>{formatBalance(session.pool)}</ThemedText>
        </View>
        {poolUnallocated(session) ? (
          <>
            <ThemedText themeColor="textSecondary">
              尚未分配，請先處理彩池再完成牌局。
            </ThemedText>
            <Action label="分配彩池" onPress={onPool} />
          </>
        ) : (
          <ThemedText type="small" themeColor="textSecondary">
            沒有未分配彩池。
          </ThemedText>
        )}
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        此頁只列淨額，付款安排由玩家自行決定。
      </ThemedText>
    </View>
  );
}

export function StatisticsSummary({ session }: { session: Session }) {
  const [detail, setDetail] = useState<string | null>(null);
  const rows = rosterStatistics(session);
  const hands = Math.max(0, ...rows.map((row) => row.hands));
  return (
    <View style={s.stack}>
      <View style={s.line}>
        <ThemedText themeColor="textSecondary">
          按每位玩家實際參與紀錄計算
        </ThemedText>
        <ChartNoAxesColumn size={24} color={palette.primary} aria-hidden />
      </View>
      {hands === 0 ? (
        <View style={s.card}>
          <ThemedText>未有有效手數</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            開始記分後會更新統計；沒有分母時顯示「—」。
          </ThemedText>
        </View>
      ) : null}
      {rows.map((row) => (
        <View style={s.card} key={row.playerId}>
          <View style={s.line}>
            <ThemedText type="subtitle">{row.name}</ThemedText>
            <ThemedText
              themeColor="textSecondary"
              type="small"
            >{`參與 ${row.hands} 手`}</ThemedText>
          </View>
          <View style={s.counts}>
            {[
              { label: "食糊", value: row.wins },
              { label: "自摸", value: row.selfDraws },
              { label: "出銃", value: row.discards },
            ].map((item) => (
              <View key={item.label} style={s.count}>
                <ThemedText style={s.countNumber}>{item.value}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {item.label}
                </ThemedText>
              </View>
            ))}
          </View>
          {row.titles.length ? (
            <View style={s.tags}>
              {row.titles.map((title) => (
                <ThemedText key={title} style={s.tag}>
                  {title}
                </ThemedText>
              ))}
            </View>
          ) : null}
          <Action
            label={detail === row.playerId ? "收起詳細統計" : "查看詳細統計"}
            selected={detail === row.playerId}
            onPress={() =>
              setDetail(detail === row.playerId ? null : row.playerId)
            }
          />
          {detail === row.playerId ? (
            <>
              {[
                [
                  "自摸率",
                  formatCountRate(row.selfDrawRate, row.selfDraws, row.wins),
                ],
                ["食糊率", formatCountRate(row.winRate, row.wins, row.hands)],
                [
                  "出銃率",
                  formatCountRate(row.discardRate, row.discards, row.hands),
                ],
                ["平均番數", formatAverage(row.averageFan)],
                ["平均出銃番數", formatAverage(row.averageDiscardFan)],
              ].map(([label, value]) => (
                <View key={label} style={s.line}>
                  <ThemedText themeColor="textSecondary">{label}</ThemedText>
                  <ThemedText
                    style={{ fontWeight: "700", fontVariant: ["tabular-nums"] }}
                  >
                    {value}
                  </ThemedText>
                </View>
              ))}
              <ThemedText type="small" themeColor="textSecondary">
                平均出銃番數按同一手多響番數合計。
              </ThemedText>
              <View style={{ alignSelf: "center" }}>
                <RadarChart
                  attack={row.attack}
                  strength={row.strength}
                  defense={row.defense}
                  color={palette.primary}
                  track={palette.line}
                />
              </View>
            </>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  stack: { gap: 16 },
  card: {
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 20,
    padding: 20,
    backgroundColor: palette.surface,
    gap: 16,
  },
  line: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  netRow: {
    minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderColor: palette.line,
    paddingVertical: 12,
  },
  net: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  empty: { alignItems: "center", paddingVertical: 24, gap: 12 },
  counts: {
    flexDirection: "row",
    backgroundColor: palette.background,
    borderRadius: 12,
    paddingVertical: 16,
  },
  count: { flex: 1, alignItems: "center", gap: 4 },
  countNumber: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    backgroundColor: palette.selected,
    color: palette.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 14,
  },
});
