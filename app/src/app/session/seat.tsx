import { Action, palette } from "@/components/table-ui";
import { router, Stack, useFocusEffect, type Href } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { APP_LOCALE } from "@/locale";
import { useRuleRepository } from "@/rules/repository";
import type { RuleSetup } from "@/rules/types";
import {
  clearRoster,
  peekRoster,
  type StagedRoster,
} from "@/session/pending-roster";
import { useSessionRepository } from "@/session/repository";
import { missingHighFans } from "@/rules/setup";
import {
  canStart,
  claimOutbound,
  namedPlayer,
  seatCount,
  sessionFromRoster,
  startSession,
} from "@/session/session";

export default function SeatScreen() {
  const theme = useTheme();
  const rulesRepo = useRuleRepository();
  const sessions = useSessionRepository();
  const [rules, setRules] = useState<RuleSetup | null>(null);
  const [roster, setRoster] = useState<StagedRoster | null>(null);
  const [names, setNames] = useState<string[]>([]);
  const [chosen, setChosen] = useState<string[]>([]);
  const [extraNames, setExtraNames] = useState<string[]>([]);
  const [dealerIndex, setDealerIndex] = useState(0);

  const count = rules ? seatCount(rules) : 0;
  const matching = roster !== null && roster.seatedIds.length === count;
  if (!roster && rules && names.length !== count) {
    setNames(Array.from({ length: count }, () => ""));
  }
  if (matching && roster && names.length !== count) {
    setNames(
      roster.seatedIds.map(
        (id) => roster.players.find((player) => player.id === id)?.name ?? "",
      ),
    );
    setDealerIndex(0);
  }
  const openSeats = Math.max(0, count - chosen.length);
  if (roster && !matching && extraNames.length !== openSeats) {
    setExtraNames(
      Array.from({ length: openSeats }, (_, index) => extraNames[index] ?? ""),
    );
  }

  useFocusEffect(
    useCallback(() => {
      let live = true;
      Promise.all([rulesRepo.getActive(), sessions.getOpen()]).then(
        ([active, open]) => {
          if (!live) return;
          if (open) {
            router.replace("/session" as Href);
            return;
          }
          if (!active) {
            router.replace("/rules" as Href);
            return;
          }
          setRules(active);
          setRoster(peekRoster());
        },
      );
      return () => {
        live = false;
      };
    }, [rulesRepo, sessions]),
  );

  async function start() {
    if (!rules) return;
    const startedAt = new Date().toISOString();
    if (roster && matching) {
      const players = roster.players.map((player) => {
        const seat = roster.seatedIds.indexOf(player.id);
        return seat >= 0
          ? { ...player, name: names[seat]?.trim() ?? player.name }
          : player;
      });
      if (players.some((player) => player.name.trim() === "")) return;
      const session = sessionFromRoster({
        rules,
        players,
        seatPlayerIds: roster.seatedIds,
        dealerIndex: rules.trackDealer ? dealerIndex : null,
        startedAt,
      });
      clearRoster();
      await openClaimed(session);
      return;
    }
    if (roster) {
      const extras = extraNames.map((name) => name.trim());
      if (
        chosen.length + extras.length !== count ||
        extras.some((name) => name === "")
      )
        return;
      const players = [
        ...roster.players,
        ...extras.map((name, index) =>
          namedPlayer(name, roster.players.length + index),
        ),
      ];
      const session = sessionFromRoster({
        rules,
        players,
        seatPlayerIds: [
          ...chosen,
          ...players.slice(roster.players.length).map((player) => player.id),
        ],
        dealerIndex: rules.trackDealer ? dealerIndex : null,
        startedAt,
      });
      clearRoster();
      await openClaimed(session);
      return;
    }
    if (!canStart(rules, names, dealerIndex)) return;
    const session = startSession({
      rules,
      names,
      dealerIndex: rules.trackDealer ? dealerIndex : null,
      startedAt,
    });
    await openClaimed(session);
  }

  async function openClaimed(session: ReturnType<typeof startSession>) {
    const claimed = claimOutbound(session, await sessions.listArchived());
    await sessions.saveOpen(claimed.session);
    if (claimed.archive) await sessions.saveArchived(claimed.archive);
    router.replace("/session" as Href);
  }

  function toggle(playerId: string) {
    setChosen((current) => {
      if (current.includes(playerId))
        return current.filter((id) => id !== playerId);
      if (current.length >= count) return current;
      return [...current, playerId];
    });
    setDealerIndex(0);
  }

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen options={{ title: "入座" }} />
      {rules ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          keyboardDismissMode="interactive"
          contentContainerStyle={styles.content}
        >
          <ThemedText type="title">齊人就開枱</ThemedText>
          <ThemedText themeColor="textSecondary">
            輸入玩家名稱，再揀邊位起莊。
          </ThemedText>
          <ThemedText accessibilityLanguage={APP_LOCALE}>
            {rules.name}
          </ThemedText>
          {missingHighFans(rules).length > 0 ? (
            <ThemedText
              accessibilityLanguage={APP_LOCALE}
            >{`請先填 ${missingHighFans(rules).join("、")} 番嘅食糊分數`}</ThemedText>
          ) : null}
          {roster && !matching ? (
            <ThemedText accessibilityLanguage={APP_LOCALE}>
              請選出今局入座嘅人。未入座者留作後備。
            </ThemedText>
          ) : null}
          {roster && !matching
            ? roster.players.map((player) => {
                const seat = chosen.indexOf(player.id);
                return (
                  <ThemedView key={player.id} style={styles.seat}>
                    <Pressable
                      accessibilityLanguage={APP_LOCALE}
                      accessibilityRole="button"
                      accessibilityState={{ selected: seat >= 0 }}
                      onPress={() => toggle(player.id)}
                      style={[
                        styles.mark,
                        {
                          borderWidth: 1,
                          borderColor: palette.line,
                          borderRadius: 12,
                        },
                      ]}
                    >
                      <ThemedText>{`${seat >= 0 ? "入座 · 已選" : "入座"} ${player.name}`}</ThemedText>
                    </Pressable>
                    {seat >= 0 && rules.trackDealer ? (
                      <Pressable
                        accessibilityLanguage={APP_LOCALE}
                        accessibilityRole="button"
                        accessibilityState={{ selected: dealerIndex === seat }}
                        onPress={() => setDealerIndex(seat)}
                        style={[
                          styles.mark,
                          {
                            borderWidth: 1,
                            borderColor: palette.line,
                            borderRadius: 12,
                          },
                        ]}
                      >
                        <ThemedText>
                          {dealerIndex === seat ? "✓ 起莊玩家" : "設為起莊玩家"}
                        </ThemedText>
                      </Pressable>
                    ) : null}
                  </ThemedView>
                );
              })
            : null}
          {(roster && !matching ? extraNames : names).map((name, index) => (
            <SeatField
              dealerIndex={dealerIndex}
              index={roster && !matching ? chosen.length + index : index}
              key={`${roster && !matching ? "extra" : "seat"}-${index}`}
              name={name}
              onDealer={setDealerIndex}
              onName={(text) => {
                const source = roster && !matching ? extraNames : names;
                const next = source.map((item, itemIndex) =>
                  itemIndex === index ? text : item,
                );
                if (roster && !matching) setExtraNames(next);
                else setNames(next);
              }}
              showDealer={rules.trackDealer}
              themeText={theme.text}
              themeSecondary={theme.textSecondary}
            />
          ))}
          <Action
            label="開始記分"
            primary
            disabled={
              missingHighFans(rules).length > 0 ||
              (roster && !matching
                ? chosen.length + extraNames.filter((n) => n.trim()).length !==
                  count
                : names.some((n) => !n.trim()) || names.length !== count)
            }
            onPress={start}
          />
        </ScrollView>
      ) : null}
    </ThemedView>
  );
}

function SeatField({
  name,
  index,
  dealerIndex,
  showDealer,
  onName,
  onDealer,
  themeText,
  themeSecondary,
}: {
  name: string;
  index: number;
  dealerIndex: number;
  showDealer: boolean;
  onName: (text: string) => void;
  onDealer: (index: number) => void;
  themeText: string;
  themeSecondary: string;
}) {
  return (
    <ThemedView style={styles.seat}>
      <ThemedText
        type="small"
        themeColor="textSecondary"
      >{`座位 ${index + 1}`}</ThemedText>
      <TextInput
        accessibilityLabel={`座位${index + 1}玩家名稱`}
        accessibilityLanguage={APP_LOCALE}
        onChangeText={onName}
        placeholder="玩家名稱"
        placeholderTextColor={themeSecondary}
        style={[
          styles.input,
          { color: themeText, borderColor: themeSecondary },
        ]}
        value={name}
      />
      {showDealer ? (
        <Pressable
          accessibilityLanguage={APP_LOCALE}
          accessibilityRole="button"
          accessibilityState={{ selected: dealerIndex === index }}
          onPress={() => onDealer(index)}
          style={[
            styles.mark,
            dealerIndex === index && {
              backgroundColor: palette.selected,
              borderWidth: 2,
              borderColor: palette.primary,
              borderRadius: 12,
            },
          ]}
        >
          <ThemedText>
            {dealerIndex === index ? "✓ 起莊玩家" : "設為起莊玩家"}
          </ThemedText>
        </Pressable>
      ) : null}
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
    paddingBottom: Spacing.six,
  },
  seat: {
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 16,
    backgroundColor: palette.surface,
  },
  input: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 18,
  },
  mark: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: Spacing.two,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 12,
  },
});
