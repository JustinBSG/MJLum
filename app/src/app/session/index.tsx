import { DiceRoller } from "@/components/dice-roller";
import { DataTable } from "@/components/data-table";
import { LedgerTable } from "@/components/ledger-table";
import { router, Stack, useFocusEffect, type Href } from "expo-router";
import {
  useCallback,
  useRef,
  useEffect,
  useState,
  type ComponentRef,
} from "react";
import { Pressable, ScrollView, StyleSheet, View, Modal } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Grid2X2,
  History,
  Wallet,
  ChartNoAxesColumn,
  ArrowLeft,
  Plus,
  Ellipsis,
  Undo2,
} from "lucide-react-native";
import { Action, palette } from "@/components/table-ui";
import { NumberField as TextInput } from "@/components/number-field";
import {
  SettlementSummary,
  StatisticsSummary,
} from "@/components/session-summary";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { APP_LOCALE } from "@/locale";
import { useRuleRepository } from "@/rules/repository";
import { formatAmount, formatMultiplier, selfDrawAmount } from "@/rules/setup";
import { Score } from "@/score/score";
import {
  eligibleJackpotIds,
  formatWinPreview,
  previewWin,
  recordDraw,
  recordWin,
  splitJackpot,
  winRefusal,
} from "@/session/hand";
import { reviseEntry } from "@/session/history";
import { useSessionRepository } from "@/session/repository";

import { clearRoster, stageRoster } from "@/session/pending-roster";

import {
  addReserve,
  adjustScore,
  canRemovePlayer,
  formatBalance,
  formatDealerBadge,
  formatStartDate,
  formatWind,
  markPoolTransfer,
  nextDealerId,
  removePlayer,
  renamePlayer,
  reopenSession,
  resumeSession,
  seatedPlayerIds,
  selectDealer,
  sessionStatusLabel,
  setProgressDisplay,
  setSessionTitle,
  substitute,
  swapSeats,
  completeSession,
  pauseSession,
  redoLatest,
  undoLatest,
  voidSession,
  type LedgerEmphasis,
} from "@/session/session";
import type { Session } from "@/session/types";

type Panel =
  | "win"
  | "draw"
  | "swap"
  | "roster"
  | "dealer"
  | "undo"
  | "fresh"
  | "pool"
  | "split"
  | "settle"
  | "stats"
  | "dice"
  | "rules"
  | "life"
  | "revise"
  | "adjust"
  | "ledger"
  | null;
type Payer = "self-draw" | string | null;

export default function SessionScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const [more, setMore] = useState(false);
  const [special, setSpecial] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const repo = useSessionRepository();
  const rulesRepo = useRuleRepository();
  const [session, setSession] = useState<Session | null>(null);
  const [panel, setPanelState] = useState<Panel>(null);
  function setPanel(next: Panel) {
    setMore(false);
    setPanelState(next);
  }

  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [panel]);
  const [reserveName, setReserveName] = useState("");
  const [incomingId, setIncomingId] = useState<string | null>(null);
  const [seatIndex, setSeatIndex] = useState<number | null>(null);
  const [billToOriginal, setBillToOriginal] = useState(false);
  const [rosterPlayerId, setRosterPlayerId] = useState<string | null>(null);
  const [rosterName, setRosterName] = useState("");
  const [swapA, setSwapA] = useState<number | null>(null);
  const [swapB, setSwapB] = useState<number | null>(null);
  const [dealerId, setDealerId] = useState<string | null>(null);
  const [resetConsecutive, setResetConsecutive] = useState(true);
  const [restartWind, setRestartWind] = useState(false);
  const [reusePlayers, setReusePlayers] = useState(false);
  const [reuseRules, setReuseRules] = useState(false);
  const [freshNotice, setFreshNotice] = useState<string | null>(null);
  const [direction, setDirection] = useState<"forward" | "reverse">("forward");
  const [emphasis, setEmphasis] = useState<LedgerEmphasis>("events");
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [fanText, setFanText] = useState("");
  const [payer, setPayer] = useState<Payer>(null);
  const [multi, setMulti] = useState(false);
  const [winnerIds, setWinnerIds] = useState<string[]>([]);
  const [selectedWinnerId, setSelectedWinnerId] = useState<string | null>(null);
  const [fans, setFans] = useState<Record<string, string>>({});
  const [falseWin, setFalseWin] = useState(false);
  const [falseWinAsSelfDraw, setFalseWinAsSelfDraw] = useState(false);
  const [discarderPaysSelfDraw, setDiscarderPaysSelfDraw] = useState(false);
  const [discarderPaysLoss, setDiscarderPaysLoss] = useState(false);
  const [winNotice, setWinNotice] = useState<string | null>(null);
  const [takeJackpot, setTakeJackpot] = useState(false);
  const [splitIds, setSplitIds] = useState<string[]>([]);

  const [lifeError, setLifeError] = useState<string | null>(null);
  const [sessionTitle, setSessionTitleText] = useState("");
  const [reviseId, setReviseId] = useState<string | null>(null);
  const [reviseFan, setReviseFan] = useState("");
  const [limitHand, setLimitHand] = useState(false);

  const [adjustPlayerId, setAdjustPlayerId] = useState<string | null>(null);
  const [adjustText, setAdjustText] = useState("");
  const [adjustNote, setAdjustNote] = useState("");

  useFocusEffect(
    useCallback(() => {
      let live = true;
      repo.getOpen().then((open) => {
        if (!live) return;
        if (!open) {
          router.replace("/session/seat" as Href);
          return;
        }
        setSession(open);
      });
      return () => {
        live = false;
      };
    }, [repo]),
  );

  async function persist(next: Session) {
    setSession(next);
    await repo.saveOpen(next);
  }

  function openPool() {
    setSplitIds([]);
    setPanel("pool");
  }

  async function confirmSplit() {
    if (!session || splitIds.length === 0) return;
    const next = splitJackpot(session, splitIds);
    if (next === session) return;
    setSplitIds([]);
    setPanel(null);
    await persist(next);
  }

  async function addNamedReserve() {
    if (!session) return;
    const next = addReserve(session, reserveName);
    if (next === session) return;
    setReserveName("");
    await persist(next);
  }

  async function confirmSwap() {
    if (!session || incomingId === null || seatIndex === null) return;
    const next = substitute(session, incomingId, seatIndex, billToOriginal);
    if (next === session) return;
    setIncomingId(null);
    setSeatIndex(null);
    setPanel(null);
    await persist(next);
  }

  async function confirmDealer() {
    if (!session || !dealerId) return;
    await persist(
      selectDealer(session, dealerId, resetConsecutive, restartWind),
    );
    setPanel(null);
  }

  async function confirmDraw() {
    if (!session) return;
    await persist(recordDraw(session));
    setPanel(null);
  }

  async function confirmUndo() {
    if (!session) return;
    await persist(undoLatest(session));
    setPanel(null);
  }

  async function confirmRedo() {
    if (!session) return;
    await persist(redoLatest(session));
  }

  async function confirmRevise() {
    if (!session || !reviseId) return;
    const entry = session.ledger.find((item) => item.id === reviseId);
    if (!entry?.action || entry.action.type !== "win") {
      setLifeError(entry ? `未能重算「${entry.label}」` : "找不到這筆記錄");
      return;
    }
    const fan = readFan(reviseFan);
    if (fan === null) return;
    const revised = reviseEntry(session, reviseId, {
      type: "win",
      input: { ...entry.action.input, fan },
    });
    if ("error" in revised) {
      setLifeError(revised.error);
      return;
    }
    setLifeError(null);
    setPanel(null);
    await persist(revised.session);
  }

  async function confirmFresh(carry = false) {
    if (!session) return;
    const poolLeft = !Score.fromString(session.pool).equals(
      Score.fromString("0"),
    );
    if (poolLeft && !carry) {
      setFreshNotice(
        "彩池尚未分配。請先分配、明確轉入新局，或取消以繼續舊局。",
      );
      return;
    }
    setFreshNotice(null);
    const source = carry ? markPoolTransfer(session) : session;
    const carried = carry ? session.pool : "0";
    if (reusePlayers && reuseRules) {
      const next = reopenSession(source, new Date().toISOString(), carried);
      const { outboundPool: _pool, ...archived } = source;
      await repo.saveOpen(archived);
      await repo.archiveOpen();
      await repo.saveOpen(next);
      setSession(next);
      setPanel(null);
      return;
    }
    if (reusePlayers) stageRoster(session);
    else clearRoster();
    if (!reusePlayers && reuseRules) await rulesRepo.setActive(session.rules);
    await repo.saveOpen(source);
    await repo.archiveOpen();
    setSession(null);
    setPanel(null);
    router.replace(
      (reusePlayers
        ? "/rules"
        : reuseRules
          ? "/session/seat"
          : "/rules") as Href,
    );
  }

  function openDealer() {
    setDealerId(
      session?.dealerId ??
        session?.seats.find((seat) => seat.playerId)?.playerId ??
        null,
    );
    setResetConsecutive(true);
    setRestartWind(false);
    setPanel("dealer");
  }

  function openFresh() {
    setReusePlayers(false);
    setReuseRules(false);
    setPanel("fresh");
  }

  function openDice() {
    setPanel("dice");
  }

  function openWin() {
    setSpecial(false);
    setSavedNotice(null);
    setWinnerId(null);
    setFanText("");
    setPayer(null);
    setMulti(false);
    setWinnerIds([]);
    setSelectedWinnerId(null);
    setFans({});
    setFalseWin(false);
    setFalseWinAsSelfDraw(false);
    setDiscarderPaysSelfDraw(false);
    setDiscarderPaysLoss(false);
    setWinNotice(null);
    setTakeJackpot(false);
    setLimitHand(false);
    setPanel("win");
  }

  function toggleMulti() {
    if (multi) {
      setMulti(false);
      setWinNotice(null);
      if (selectedWinnerId) {
        setWinnerId(selectedWinnerId);
        setFanText(fans[selectedWinnerId] ?? "");
      }
      return;
    }
    if (discarderPaysSelfDraw || discarderPaysLoss) {
      setWinNotice("請先取消包付，先可以開一炮多響");
      return;
    }
    setWinNotice(null);
    setMulti(true);
    setLimitHand(false);
    setTakeJackpot(false);
    if (payer === "self-draw") setPayer(null);
    if (winnerId) {
      setWinnerIds([winnerId]);
      setSelectedWinnerId(winnerId);
      setFans({ [winnerId]: fanText });
    } else {
      setWinnerIds([]);
      setSelectedWinnerId(null);
    }
  }

  function chooseWinner(playerId: string) {
    if (!multi) {
      setWinnerId(playerId);
      if (payer === playerId) setPayer(null);
      return;
    }
    if (
      (discarderPaysSelfDraw || discarderPaysLoss) &&
      !winnerIds.includes(playerId)
    ) {
      setWinNotice("請先取消包付，先可以加入另一個贏家");
      return;
    }
    if (payer === playerId) setPayer(null);
    if (
      !winnerIds.includes(playerId) &&
      winnerIds.length >= (session?.seats.length ?? 4) - 1
    )
      return;
    setSelectedWinnerId(playerId);
    if (!winnerIds.includes(playerId)) setWinnerIds([...winnerIds, playerId]);
  }

  function toggleFalseWin() {
    if (!falseWin) {
      if (multi && selectedWinnerId) {
        setWinnerId(selectedWinnerId);
        setFanText(fans[selectedWinnerId] ?? "");
      }
      setMulti(false);
      setDiscarderPaysSelfDraw(false);
      setDiscarderPaysLoss(false);
      setTakeJackpot(false);
      setLimitHand(false);
    }
    setFalseWin((current) => !current);
  }

  function toggleLimitHand() {
    setLimitHand((current) => {
      if (!current) {
        setFalseWin(false);
        setMulti(false);
      }
      return !current;
    });
  }

  function toggleCoverSelfDraw() {
    if (multi) return;
    setWinNotice(null);
    setDiscarderPaysSelfDraw((current) => {
      if (!current) {
        setDiscarderPaysLoss(false);
        if (payer === "self-draw") setPayer(null);
      }
      return !current;
    });
  }

  function toggleCoverLoss() {
    if (multi) return;
    setWinNotice(null);
    setDiscarderPaysLoss((current) => {
      if (!current) {
        setDiscarderPaysSelfDraw(false);
        if (payer === "self-draw") setPayer(null);
      }
      return !current;
    });
  }

  async function confirmAdjust() {
    if (!session || !adjustPlayerId) return;
    const note = adjustNote.trim();
    if (note === "") return;
    let next;
    try {
      next = adjustScore(session, adjustPlayerId, adjustText, note);
    } catch {
      return;
    }
    if (next === session) return;
    setAdjustText("");
    setAdjustNote("");
    setPanel(null);
    await persist(next);
  }

  async function confirmWin() {
    if (!session) return;
    if (falseWin) {
      if (!winnerId) return;
      const fan = readFan(fanText);
      if (fan === null) return;
      const next = recordWin(session, {
        winnerId,
        fan,
        discarderId: null,
        falseWin: true,
        falseWinAsSelfDraw,
      });
      if (next === session) return;
      setPanel(null);
      await persist(next);
      return;
    }
    if (payer === null) return;
    if (multi) {
      if (discarderPaysSelfDraw || discarderPaysLoss) return;
      if (!selectedWinnerId || payer === "self-draw") return;
      const fan = readFan(fans[selectedWinnerId] ?? "");
      if (fan === null) return;
      const also = winnerIds.flatMap((id) => {
        if (id === selectedWinnerId) return [];
        const value = readFan(fans[id] ?? "");
        return value === null ? [] : [{ playerId: id, fan: value }];
      });
      if (
        also.length !== winnerIds.filter((id) => id !== selectedWinnerId).length
      )
        return;
      const next = recordWin(session, {
        winnerId: selectedWinnerId,
        fan,
        discarderId: payer,
        also,
      });
      if (next === session) return;
      setPanel(null);
      await persist(next);
      return;
    }
    if (!winnerId || payer === null) return;
    const fan = limitHand ? session.rules.maxFan : readFan(fanText);
    if (fan === null) return;
    const next = recordWin(session, {
      winnerId,
      fan,
      discarderId: payer === "self-draw" ? null : payer,
      discarderPaysSelfDraw,
      discarderPaysLoss,
      takeJackpot: session.rules.jackpotEnabled && takeJackpot,
      limitHand,
    });
    if (next === session) return;
    setPanel(null);
    setSavedNotice("已記錄這手，分數已更新。");
    await persist(next);
  }

  const seated = session
    ? new Set(seatedPlayerIds(session))
    : new Set<string>();
  const reserves =
    session?.players.filter((player) => !seated.has(player.id)) ?? [];
  const previewWinnerId = multi ? selectedWinnerId : winnerId;
  const previewFan = limitHand
    ? (session?.rules.maxFan ?? null)
    : multi
      ? selectedWinnerId
        ? readFan(fans[selectedWinnerId] ?? "")
        : null
      : readFan(fanText);
  const also = multi
    ? winnerIds.flatMap((id) => {
        if (id === selectedWinnerId) return [];
        const value = readFan(fans[id] ?? "");
        return value === null ? [] : [{ playerId: id, fan: value }];
      })
    : [];
  const alsoComplete =
    !multi ||
    also.length === winnerIds.filter((id) => id !== selectedWinnerId).length;
  const winPreview =
    session &&
    previewWinnerId &&
    previewFan !== null &&
    alsoComplete &&
    (falseWin || payer !== null)
      ? previewWin(session, {
          winnerId: previewWinnerId,
          fan: previewFan,
          discarderId:
            falseWin || payer === "self-draw" || payer === null ? null : payer,
          also: falseWin ? [] : also,
          falseWin,
          falseWinAsSelfDraw,
          discarderPaysSelfDraw,
          discarderPaysLoss,
          takeJackpot:
            session.rules.jackpotEnabled && !falseWin && !multi && takeJackpot,
          limitHand,
        })
      : null;

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      {session ? (
        <ScrollView
          ref={scroll}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, { paddingTop: 24 }]}
        >
          <View style={styles.heading}>
            <View style={{ flex: 1 }}>
              <ThemedText type="small" themeColor="textSecondary">
                麻雀諗
              </ThemedText>
              <ThemedText type="title">
                {panel === "win"
                  ? "記低這手"
                  : panel === "settle"
                    ? "找數"
                    : panel === "stats"
                      ? "統計數據"
                      : panel === "dice"
                        ? "擲骰"
                        : panel === "swap"
                          ? "更換玩家"
                          : panel === "ledger"
                            ? "詳細記錄"
                            : panel && panel !== "draw" && panel !== "undo"
                              ? "牌局設定"
                              : "現時牌局"}
              </ThemedText>
            </View>
            <Action label="首頁" onPress={() => router.replace("/")} />
            {panel && panel !== "draw" && panel !== "undo" ? (
              <Action
                label="返回"
                icon={ArrowLeft}
                onPress={() => setPanel(null)}
              />
            ) : (
              <Action
                label="更多"
                icon={Ellipsis}
                onPress={() => setMore(true)}
              />
            )}
          </View>
          {panel === null || panel === "draw" || panel === "undo" ? (
            <>
              {savedNotice ? (
                <ThemedText
                  accessibilityLiveRegion="polite"
                  style={styles.notice}
                >
                  {savedNotice}
                </ThemedText>
              ) : null}

              {panel === null ? (
                <Choice
                  label={session.rules.name}
                  onPress={() => setPanel("rules")}
                  selected={false}
                />
              ) : (
                <ThemedText accessibilityLanguage={APP_LOCALE}>
                  {session.rules.name}
                </ThemedText>
              )}
              {session.pendingRules ? (
                <ThemedText
                  accessibilityLanguage={APP_LOCALE}
                >{`下一手 ${session.pendingRules.name}`}</ThemedText>
              ) : null}
              <ThemedText
                type="small"
                themeColor="textSecondary"
              >{`${formatStartDate(session.startedAt)} · 第 ${session.handCount} 手 · ${sessionStatusLabel(session.status)}`}</ThemedText>

              {session.title ? (
                <ThemedText accessibilityLanguage={APP_LOCALE}>
                  {session.title}
                </ThemedText>
              ) : null}
              <View style={styles.progressCard}>
                <View style={styles.heading}>
                  <ThemedText type="small" themeColor="textSecondary">
                    牌局進度
                  </ThemedText>
                  <View style={styles.row}>
                    <Choice
                      label="圈風"
                      selected={session.progressDisplay === "wind"}
                      onPress={() =>
                        persist(setProgressDisplay(session, "wind"))
                      }
                    />
                    <Choice
                      label="局數"
                      selected={session.progressDisplay === "hand-count"}
                      onPress={() =>
                        persist(setProgressDisplay(session, "hand-count"))
                      }
                    />
                  </View>
                </View>
                <ThemedText
                  style={{
                    fontSize: 28,
                    lineHeight: 38,
                    fontWeight: "700",
                    color: palette.primary,
                  }}
                >
                  {session.progressDisplay === "wind" &&
                  session.rules.trackDealer
                    ? formatWind(session.roundWind, session.seatWind)
                    : `已完成 ${session.handCount} 手`}
                </ThemedText>
                {session.progressDisplay === "wind" &&
                session.rules.trackDealer ? (
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {(
                      [
                        ["east", "東"],
                        ["south", "南"],
                        ["west", "西"],
                        ["north", "北"],
                      ] as const
                    ).map(([wind, label]) => (
                      <View
                        key={wind}
                        style={{
                          flex: 1,
                          alignItems: "center",
                          paddingVertical: 8,
                          borderRadius: 10,
                          backgroundColor:
                            session.seatWind === wind
                              ? palette.primary
                              : palette.surface,
                        }}
                      >
                        <ThemedText
                          style={{
                            fontWeight: "700",
                            color:
                              session.seatWind === wind
                                ? "#FFFFFF"
                                : palette.muted,
                          }}
                        >
                          {label}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                ) : null}
                <ThemedText
                  type="small"
                  themeColor="textSecondary"
                >{`莊家：${session.players.find((p) => p.id === session.dealerId)?.name ?? "未設定"}`}</ThemedText>
              </View>
              {session.rules.jackpotEnabled ? (
                panel === null && seated.size > 0 ? (
                  <Choice
                    label={`彩池 ${formatBalance(session.pool)}`}
                    onPress={openPool}
                    selected={false}
                  />
                ) : (
                  <ThemedText
                    accessibilityLanguage={APP_LOCALE}
                  >{`彩池 ${formatBalance(session.pool)}`}</ThemedText>
                )
              ) : null}

              <View style={styles.scoreGrid}>
                {session.seats.map((seat) => {
                  const player = session.players.find(
                    (item) => item.id === seat.playerId,
                  );
                  if (!player) return null;
                  const dealer =
                    session.rules.trackDealer && player.id === session.dealerId;
                  return (
                    <View
                      key={seat.index}

                      accessibilityLabel={`${player.name}，${formatBalance(player.balance)}`}
                      style={[
                        styles.scoreCard,
                        dealer && { borderColor: palette.primary },
                      ]}
                    >
                      <View style={styles.heading}>
                        <ThemedText
                          type="small"
                          themeColor="textSecondary"
                        >{`座位 ${seat.index + 1}`}</ThemedText>
                        {dealer ? (
                          <ThemedText style={styles.badge}>
                            {formatDealerBadge(session.dealerMark)}
                          </ThemedText>
                        ) : null}
                      </View>
                      <ThemedText style={{ fontSize: 20, fontWeight: "700" }}>
                        {player.name}
                      </ThemedText>
                      <ThemedText
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.5}
                        style={[
                          styles.score,
                          {
                            color:
                              Score.fromString(player.balance).compare(
                                Score.fromString("0"),
                              ) < 0
                                ? palette.negative
                                : palette.positive,
                          },
                        ]}
                      >
                        {formatBalance(player.balance)}
                      </ThemedText>
                    </View>
                  );
                })}
              </View>
              {session.status === "playing" ? (
                <View style={styles.row}>
                  <View style={{ flex: 2 }}>
                    <Action
                      label="食糊記分"
                      primary
                      icon={Plus}
                      onPress={openWin}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Action label="流局" onPress={() => setPanel("draw")} />
                  </View>
                  <Action
                    label="還原"
                    icon={Undo2}
                    disabled={!session.ledger.length}
                    onPress={() => setPanel("undo")}
                  />
                </View>
              ) : null}
              {reserves.length > 0 ? (
                <View style={styles.reserveSection}>
                  <View style={styles.heading}>
                    <ThemedText
                      accessibilityRole="header"
                      style={{ fontSize: 18, fontWeight: "700" }}
                    >
                      未入座玩家
                    </ThemedText>
                    <ThemedText
                      type="small"
                      themeColor="textSecondary"
                    >{`${reserves.length} 位`}</ThemedText>
                  </View>
                  {reserves.map((player) => {
                    const sign = Score.fromString(player.balance).compare(
                      Score.fromString("0"),
                    );
                    return (
                      <View
                        key={player.id}
                        accessible
                        accessibilityLabel={`${player.name}，未入座，累積分數 ${formatBalance(player.balance)}`}
                        style={styles.reserveCard}
                      >
                        <View style={{ flex: 1, gap: 8 }}>
                          <ThemedText
                            style={{ fontSize: 18, fontWeight: "700" }}
                          >
                            {player.name}
                          </ThemedText>
                          <ThemedText style={styles.reserveBadge}>
                            未入座
                          </ThemedText>
                        </View>
                        <View style={styles.reserveBalance}>
                          <ThemedText type="small" themeColor="textSecondary">
                            累積分數
                          </ThemedText>
                          <ThemedText
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.5}
                            style={[
                              styles.score,
                              {
                                fontSize: 28,
                                lineHeight: 36,
                                textAlign: "right",
                                color:
                                  sign < 0
                                    ? palette.negative
                                    : sign > 0
                                      ? palette.positive
                                      : palette.ink,
                              },
                            ]}
                          >
                            {formatBalance(player.balance)}
                          </ThemedText>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : null}
            </>
          ) : null}

          {panel === "win" ? (
            <ThemedView style={styles.panel}>
              <ThemedText type="subtitle">邊位食糊？</ThemedText>
              <ThemedText themeColor="textSecondary">
                揀玩家、選番數，再揀自摸或出銃者。
              </ThemedText>
              <View style={styles.row}>
                {session.seats.map((seat) => {
                  const player = session.players.find(
                    (item) => item.id === seat.playerId,
                  );
                  if (!player) return null;
                  const chosen = multi
                    ? winnerIds.includes(player.id)
                    : winnerId === player.id;
                  return (
                    <Choice
                      key={player.id}
                      label={
                        multi && player.id === selectedWinnerId
                          ? `${player.name} · 番數`
                          : player.name
                      }
                      onPress={() => chooseWinner(player.id)}
                      selected={chosen}
                    />
                  );
                })}
              </View>
              {multi && selectedWinnerId ? (
                <Action
                  label="移除此贏家"
                  onPress={() => {
                    const next = winnerIds.filter(
                      (id) => id !== selectedWinnerId,
                    );
                    setWinnerIds(next);
                    setSelectedWinnerId(next[0] ?? null);
                  }}
                />
              ) : null}
              {!limitHand ? (
                <View accessibilityLabel="選擇番數" style={styles.row}>
                  {session.rules.rows
                    .filter(
                      (row) =>
                        row.fan >= session.rules.minFan &&
                        row.fan <= session.rules.maxFan,
                    )
                    .map((row) => (
                      <Action
                        key={row.fan}
                        label={`${row.fan}番`}
                        selected={previewFan === row.fan}
                        onPress={() => {
                          if (multi && selectedWinnerId)
                            setFans((current) => ({
                              ...current,
                              [selectedWinnerId]: String(row.fan),
                            }));
                          else setFanText(String(row.fan));
                        }}
                      />
                    ))}
                </View>
              ) : null}
              {!falseWin ? (
                <ThemedText type="small" themeColor="textSecondary">
                  揀自摸，或選出銃玩家。
                </ThemedText>
              ) : null}
              {falseWin ||
              multi ||
              discarderPaysSelfDraw ||
              discarderPaysLoss ? null : (
                <Choice
                  label="自摸"
                  onPress={() => setPayer("self-draw")}
                  selected={payer === "self-draw"}
                />
              )}
              {session.rules.jackpotEnabled && !multi && !falseWin ? (
                <Choice
                  label={`領取彩池 ${takeJackpot ? "開" : "關"}`}
                  onPress={() => setTakeJackpot((value) => !value)}
                  selected={takeJackpot}
                />
              ) : null}
              {session.seats.map((seat) => {
                const player = session.players.find(
                  (item) => item.id === seat.playerId,
                );
                const blocked = multi
                  ? winnerIds.includes(player?.id ?? "")
                  : player?.id === winnerId;
                if (!player || blocked || falseWin) return null;
                return (
                  <Choice
                    key={`discard-${player.id}`}
                    label={`出銃者 ${player.name}`}
                    onPress={() => setPayer(player.id)}
                    selected={payer === player.id}
                  />
                );
              })}
              <Action
                label={special ? "收起特殊規則" : "特殊規則・多響、包付、詐糊"}
                onPress={() => setSpecial((v) => !v)}
                selected={special}
              />
              {special ? (
                <View style={{ gap: 8 }}>
                  <Choice
                    label={`詐糊 ${falseWin ? "開" : "關"}`}
                    onPress={toggleFalseWin}
                    selected={falseWin}
                  />
                  <Choice
                    label={`例牌 ${limitHand ? "開" : "關"}`}
                    onPress={toggleLimitHand}
                    selected={limitHand}
                  />
                  {limitHand ? (
                    <ThemedText type="small">{`按滿糊 ${session.rules.maxFan} 番計算`}</ThemedText>
                  ) : null}
                  {falseWin ? (
                    <Choice
                      label={`詐糊賠位自摸 ${falseWinAsSelfDraw ? "開" : "關"}`}
                      onPress={() => setFalseWinAsSelfDraw((v) => !v)}
                      selected={falseWinAsSelfDraw}
                    />
                  ) : (
                    <>
                      <Choice
                        label={`一炮多響 ${multi ? "開" : "關"}`}
                        onPress={toggleMulti}
                        selected={multi}
                      />
                      <Choice
                        label={`出銃者包自摸 ${discarderPaysSelfDraw ? "開" : "關"}`}
                        onPress={toggleCoverSelfDraw}
                        selected={discarderPaysSelfDraw}
                        disabled={multi}
                      />
                      <Choice
                        label={`出銃者包輸 ${discarderPaysLoss ? "開" : "關"}`}
                        onPress={toggleCoverLoss}
                        selected={discarderPaysLoss}
                        disabled={multi}
                      />
                    </>
                  )}
                </View>
              ) : null}

              {session &&
              winRefusal(session.rules, [
                previewFan ?? NaN,
                ...also.map((item) => item.fan),
              ]) ? (
                <ThemedText accessibilityLanguage={APP_LOCALE}>
                  番數不足
                </ThemedText>
              ) : null}
              {session.rules.paymentMode === "half-discard" &&
              (discarderPaysSelfDraw || discarderPaysLoss) ? (
                <ThemedText accessibilityLanguage={APP_LOCALE}>
                  本手包付，半銃分攤不適用
                </ThemedText>
              ) : null}
              {discarderPaysSelfDraw && discarderPaysLoss ? (
                <ThemedText accessibilityLanguage={APP_LOCALE}>
                  包自摸同包輸不能同時開
                </ThemedText>
              ) : null}
              {multi ? (
                <ThemedText accessibilityLanguage={APP_LOCALE}>
                  {winnerIds.length < 2
                    ? "多響請選至少兩位贏家，並分別填寫番數。"
                    : "一炮多響未支援包自摸或包輸"}
                </ThemedText>
              ) : null}
              {winNotice ? (
                <ThemedText accessibilityLanguage={APP_LOCALE}>
                  {winNotice}
                </ThemedText>
              ) : null}
              {limitHand && (falseWin || multi) ? (
                <ThemedText accessibilityLanguage={APP_LOCALE}>
                  例牌未支援詐糊或一炮多響
                </ThemedText>
              ) : null}
              <View style={styles.preview} accessibilityLiveRegion="polite">
                <ThemedText style={{ fontWeight: "700" }}>本手預覽</ThemedText>
                {winPreview ? (
                  formatWinPreview(winPreview).map((line) => (
                    <ThemedText accessibilityLanguage={APP_LOCALE} key={line}>
                      {line.replaceAll("Jackpot", "彩池")}
                    </ThemedText>
                  ))
                ) : (
                  <ThemedText themeColor="textSecondary">
                    請選玩家、番數，以及自摸或出銃者。
                  </ThemedText>
                )}
                {winPreview?.deltas.map((delta) => (
                  <View key={delta.playerId} style={styles.heading}>
                    <ThemedText>
                      {
                        session.players.find((p) => p.id === delta.playerId)
                          ?.name
                      }
                    </ThemedText>
                    <ThemedText style={{ fontWeight: "700" }}>
                      {formatBalance(delta.delta)}
                    </ThemedText>
                  </View>
                ))}
              </View>
              <ThemedView style={styles.row}>
                <Choice
                  label="取消"
                  onPress={() => setPanel(null)}
                  selected={false}
                />
              </ThemedView>
            </ThemedView>
          ) : null}

          {panel === "pool" ? (
            <ThemedView style={styles.panel}>
              <ThemedText accessibilityLanguage={APP_LOCALE}>請選擇</ThemedText>
              <Choice
                label="平分彩池"
                onPress={() => setPanel("split")}
                selected={false}
              />
              <Choice
                label="取消"
                onPress={() => setPanel(null)}
                selected={false}
              />
            </ThemedView>
          ) : null}

          {panel === "split" && session ? (
            <ThemedView style={styles.panel}>
              <ThemedText accessibilityLanguage={APP_LOCALE}>
                平分給哪些玩家？
              </ThemedText>
              {session.players
                .filter((player) =>
                  eligibleJackpotIds(session).includes(player.id),
                )
                .map((player) => (
                  <Choice
                    key={player.id}
                    label={player.name}
                    onPress={() =>
                      setSplitIds((current) =>
                        current.includes(player.id)
                          ? current.filter((id) => id !== player.id)
                          : [...current, player.id],
                      )
                    }
                    selected={splitIds.includes(player.id)}
                  />
                ))}
              <ThemedView style={styles.row}>
                <Choice
                  label="取消"
                  onPress={() => setPanel(null)}
                  selected={false}
                />
                <Choice label="確定" onPress={confirmSplit} selected={false} />
              </ThemedView>
            </ThemedView>
          ) : null}

          {panel === "rules" ? (
            <View style={{ gap: 20 }}>
              <DataTable
                headers={["設定", "內容"]}
                widths={[150, 180]}
                rows={[
                  ["玩法", session.rules.name],
                  ["人數", session.seats.length + "人麻雀"],
                  [
                    "派彩",
                    session.rules.paymentMode === "full-discard"
                      ? "全銃"
                      : "半銃",
                  ],
                  ["起糊", session.rules.minFan + "番"],
                  ["滿糊", session.rules.maxFan + "番"],
                  [
                    "自摸倍數",
                    "×" + formatMultiplier(session.rules.multiplier),
                  ],
                  ["彩池", session.rules.jackpotEnabled ? "開啟" : "關閉"],
                  ["流局供款", formatAmount(session.rules.jackpotContribution)],
                  [
                    "紀錄莊家及圈風",
                    session.rules.trackDealer ? "開啟" : "關閉",
                  ],
                  [
                    "流局時過莊",
                    session.rules.passDealerOnDraw ? "開啟" : "關閉",
                  ],
                ]}
              />
              <DataTable
                headers={["番數", "食糊分數", "自摸分數"]}
                widths={[70, 120, 120]}
                rows={session.rules.rows.map((row) => [
                  row.fan,
                  formatAmount(row.ordinary),
                  formatAmount(selfDrawAmount(session.rules, row.fan)),
                ])}
              />
              <Choice
                label="改下一手玩法"
                selected={false}
                onPress={() => router.push("/rules")}
              />
            </View>
          ) : null}
          {panel === "adjust" && session ? (
            <ThemedView style={styles.panel}>
              <ThemedText accessibilityLanguage={APP_LOCALE}>調分</ThemedText>
              <ThemedText accessibilityLanguage={APP_LOCALE}>
                只改這個人的分數，不改食糊、莊家或彩池。這是獨立更正，不是相沖結算。
              </ThemedText>
              {session.players.map((player) => (
                <Choice
                  key={player.id}
                  label={player.name}
                  onPress={() => setAdjustPlayerId(player.id)}
                  selected={adjustPlayerId === player.id}
                />
              ))}
              <TextInput
                accessibilityLabel="調分金額"
                accessibilityLanguage={APP_LOCALE}
                onChangeText={setAdjustText}
                placeholder="金額，例如 -4 或 3/2"
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.input,
                  { color: theme.text, borderColor: theme.textSecondary },
                ]}
                value={adjustText}
              />
              <TextInput
                accessibilityLabel="調分原因"
                accessibilityLanguage={APP_LOCALE}
                onChangeText={setAdjustNote}
                placeholder="原因"
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.input,
                  { color: theme.text, borderColor: theme.textSecondary },
                ]}
                value={adjustNote}
              />
              <ThemedView style={styles.row}>
                <Choice
                  label="取消"
                  onPress={() => setPanel(null)}
                  selected={false}
                />
                <Choice label="確定" onPress={confirmAdjust} selected={false} />
              </ThemedView>
            </ThemedView>
          ) : null}

          {panel === "settle" ? (
            <SettlementSummary
              session={session}
              onPool={() => {
                setSplitIds([]);
                setPanel("split");
              }}
            />
          ) : null}
          {panel === "stats" ? <StatisticsSummary session={session} /> : null}

          {panel === "dice" ? (
            <DiceRoller onClose={() => setPanel(null)} />
          ) : null}

          {panel === "swap" ? (
            <View style={{ gap: 16 }}>
              <View style={styles.panel}>
                <View style={styles.heading}>
                  <ThemedText
                    accessibilityRole="header"
                    style={styles.zoneTitle}
                  >
                    在座玩家
                  </ThemedText>
                  <ThemedText
                    style={styles.badge}
                  >{`${session.seats.length} 位`}</ThemedText>
                </View>
                <ThemedText type="small" themeColor="textSecondary">
                  揀要換出嘅玩家，再按一次可取消。
                </ThemedText>
                <View style={styles.row}>
                  {session.seats.map((seat) => {
                    const player = session.players.find(
                      (item) => item.id === seat.playerId,
                    );
                    return (
                      <Choice
                        key={seat.index}
                        label={`座位 ${seat.index + 1} · ${player?.name ?? ""}`}
                        onPress={() =>
                          setSeatIndex((current) =>
                            current === seat.index ? null : seat.index,
                          )
                        }
                        selected={seatIndex === seat.index}
                      />
                    );
                  })}
                </View>
              </View>
              <View style={styles.panel}>
                <View style={styles.heading}>
                  <ThemedText
                    accessibilityRole="header"
                    style={styles.zoneTitle}
                  >
                    未入座玩家
                  </ThemedText>
                  <ThemedText
                    style={styles.badge}
                  >{`${reserves.length} 位`}</ThemedText>
                </View>
                <ThemedText type="small" themeColor="textSecondary">
                  揀要換入嘅玩家，再按一次可取消。
                </ThemedText>
                {reserves.length > 0 ? (
                  <View style={styles.row}>
                    {reserves.map((player) => (
                      <Choice
                        key={player.id}
                        label={player.name}
                        onPress={() =>
                          setIncomingId((current) =>
                            current === player.id ? null : player.id,
                          )
                        }
                        selected={incomingId === player.id}
                      />
                    ))}
                  </View>
                ) : (
                  <ThemedText
                    type="small"
                    themeColor="textSecondary"
                    style={styles.emptyReserve}
                  >
                    未有未入座玩家，可喺下方加入。
                  </ThemedText>
                )}
                <View style={styles.addReserve}>
                  <ThemedText type="small" style={{ fontWeight: "600" }}>
                    加入未入座玩家
                  </ThemedText>
                  <TextInput
                    accessibilityLabel="新增未入座玩家名稱"
                    accessibilityLanguage={APP_LOCALE}
                    onChangeText={setReserveName}
                    placeholder="玩家名稱"
                    placeholderTextColor={theme.textSecondary}
                    style={[
                      styles.input,
                      { color: theme.text, borderColor: theme.textSecondary },
                    ]}
                    value={reserveName}
                  />
                  <Choice
                    label="加入玩家"
                    onPress={addNamedReserve}
                    selected={false}
                    disabled={reserveName.trim() === ""}
                  />
                </View>
              </View>
              <Choice
                label={`入原玩家帳 ${billToOriginal ? "開" : "關"}`}
                onPress={() => setBillToOriginal((value) => !value)}
                selected={billToOriginal}
              />
              <View style={styles.row}>
                <Choice
                  label="取消"
                  onPress={() => setPanel(null)}
                  selected={false}
                />
                <Action
                  label="確認換人"
                  primary
                  onPress={confirmSwap}
                  disabled={incomingId === null || seatIndex === null}
                />
              </View>
            </View>
          ) : null}

          {panel === "roster" && session ? (
            <ThemedView style={styles.panel}>
              <ThemedText accessibilityLanguage={APP_LOCALE}>玩家</ThemedText>
              {session.players.map((player) => (
                <Choice
                  key={player.id}
                  label={`${player.name}${canRemovePlayer(session, player.id) ? " · 可移除" : ""}`}
                  onPress={() => {
                    const deselect = rosterPlayerId === player.id;
                    setRosterPlayerId(deselect ? null : player.id);
                    setRosterName(deselect ? "" : player.name);
                  }}
                  selected={rosterPlayerId === player.id}
                />
              ))}
              <TextInput
                accessibilityLabel="玩家名稱"
                accessibilityLanguage={APP_LOCALE}
                onChangeText={setRosterName}
                placeholder="玩家名稱"
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.input,
                  { color: theme.text, borderColor: theme.textSecondary },
                ]}
                value={rosterName}
              />
              <ThemedView style={styles.row}>
                <Choice
                  label="改名"
                  disabled={rosterPlayerId === null || rosterName.trim() === ""}
                  onPress={() => {
                    if (!rosterPlayerId) return;
                    const next = renamePlayer(
                      session,
                      rosterPlayerId,
                      rosterName,
                    );
                    if (next !== session) persist(next);
                  }}
                  selected={false}
                />
                <Choice
                  label="移除"
                  disabled={
                    rosterPlayerId === null ||
                    !canRemovePlayer(session, rosterPlayerId)
                  }
                  onPress={() => {
                    if (!rosterPlayerId) return;
                    const next = removePlayer(session, rosterPlayerId);
                    if (next === session) return;
                    setRosterPlayerId(null);
                    persist(next);
                  }}
                  selected={false}
                />
              </ThemedView>
              <ThemedText accessibilityLanguage={APP_LOCALE}>換位</ThemedText>
              {session.seats.map((seat) => {
                const player = session.players.find(
                  (item) => item.id === seat.playerId,
                );
                return (
                  <Choice
                    key={seat.index}
                    label={`${seat.index + 1} ${player?.name ?? ""}`}
                    onPress={() => {
                      if (swapA === seat.index) {
                        setSwapA(swapB);
                        setSwapB(null);
                        return;
                      }
                      if (swapB === seat.index) {
                        setSwapB(null);
                        return;
                      }
                      if (
                        swapA === null ||
                        (swapA !== null && swapB !== null)
                      ) {
                        setSwapA(seat.index);
                        setSwapB(null);
                        return;
                      }
                      setSwapB(seat.index);
                    }}
                    selected={swapA === seat.index || swapB === seat.index}
                  />
                );
              })}
              {swapA !== null && swapB !== null ? (
                <ThemedText accessibilityLanguage={APP_LOCALE}>
                  {`過莊會到 ${session.players.find((player) => player.id === nextDealerId(swapSeats(session, swapA, swapB)))?.name ?? ""}`}
                </ThemedText>
              ) : null}
              <ThemedView style={styles.row}>
                <Choice
                  label="取消"
                  onPress={() => setPanel(null)}
                  selected={false}
                />
                <Choice
                  label="換位"
                  disabled={swapA === null || swapB === null}
                  onPress={() => {
                    if (swapA === null || swapB === null) return;
                    const next = swapSeats(session, swapA, swapB);
                    if (next === session) return;
                    setSwapA(null);
                    setSwapB(null);
                    persist(next);
                  }}
                  selected={false}
                />
              </ThemedView>
            </ThemedView>
          ) : null}

          {panel === "dealer" ? (
            <ThemedView style={styles.panel}>
              <ThemedText accessibilityLanguage={APP_LOCALE}>
                莊家設定
              </ThemedText>
              {session.seats.map((seat) => {
                const player = session.players.find(
                  (item) => item.id === seat.playerId,
                );
                if (!player) return null;
                return (
                  <Choice
                    key={player.id}
                    label={player.name}
                    onPress={() => setDealerId(player.id)}
                    selected={dealerId === player.id}
                  />
                );
              })}
              <Choice
                label={`重置連莊數 ${resetConsecutive ? "開" : "關"}`}
                onPress={() => setResetConsecutive((value) => !value)}
                selected={resetConsecutive}
              />
              <Choice
                label={`重新開始計算圈風 ${restartWind ? "開" : "關"}`}
                onPress={() => setRestartWind((value) => !value)}
                selected={restartWind}
              />
              <ThemedView style={styles.row}>
                <Choice
                  label="取消"
                  onPress={() => setPanel(null)}
                  selected={false}
                />
                <Choice label="確定" onPress={confirmDealer} selected={false} />
              </ThemedView>
            </ThemedView>
          ) : null}

          {panel === null && session.status === "paused" ? (
            <Choice
              label="繼續牌局"
              onPress={() => persist(resumeSession(session))}
              selected={false}
            />
          ) : null}

          {panel === "life" ? (
            <ThemedView style={styles.panel}>
              <ThemedText accessibilityLanguage={APP_LOCALE}>牌局</ThemedText>
              {lifeError ? (
                <ThemedText accessibilityLanguage={APP_LOCALE}>
                  {lifeError}
                </ThemedText>
              ) : null}
              <TextInput
                accessibilityLabel="牌局名稱"
                accessibilityLanguage={APP_LOCALE}
                onChangeText={setSessionTitleText}
                placeholder="牌局名稱"
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.input,
                  { color: theme.text, borderColor: theme.textSecondary },
                ]}
                value={sessionTitle}
              />
              <Choice
                label="儲存名稱"
                onPress={() => persist(setSessionTitle(session, sessionTitle))}
                selected={false}
              />
              <Choice
                label="暫停"
                onPress={() =>
                  persist(pauseSession(session)).then(() => setPanel(null))
                }
                selected={false}
              />
              <Choice
                label="完成"
                onPress={async () => {
                  const next = completeSession(session);
                  if (next === session) {
                    setLifeError("彩池尚未分配");
                    return;
                  }
                  await repo.saveOpen(next);
                  await repo.archiveOpen();
                  setSession(null);
                  router.replace("/history" as Href);
                }}
                selected={false}
              />
              <Choice
                label="作廢"
                onPress={async () => {
                  await repo.saveOpen(voidSession(session));
                  await repo.archiveOpen();
                  setSession(null);
                  router.replace("/history" as Href);
                }}
                selected={false}
              />
              <Choice
                label="取消"
                onPress={() => setPanel(null)}
                selected={false}
              />
            </ThemedView>
          ) : null}

          {panel === "revise" ? (
            <ThemedView style={styles.panel}>
              <ThemedText accessibilityLanguage={APP_LOCALE}>
                修改記錄
              </ThemedText>
              {lifeError ? (
                <ThemedText accessibilityLanguage={APP_LOCALE}>
                  {lifeError}
                </ThemedText>
              ) : null}
              {session.ledger.map((entry) => (
                <Choice
                  key={entry.id}
                  label={entry.label}
                  onPress={() => {
                    setReviseId(entry.id);
                    setReviseFan(
                      entry.action?.type === "win"
                        ? String(entry.action.input.fan)
                        : "",
                    );
                    setLifeError(null);
                  }}
                  selected={reviseId === entry.id}
                />
              ))}
              <TextInput
                accessibilityLabel="番數"
                accessibilityLanguage={APP_LOCALE}
                keyboardType="number-pad"
                onChangeText={setReviseFan}
                placeholder="番數"
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.input,
                  { color: theme.text, borderColor: theme.textSecondary },
                ]}
                value={reviseFan}
              />
              <ThemedView style={styles.row}>
                <Choice
                  label="取消"
                  onPress={() => setPanel(null)}
                  selected={false}
                />
                <Choice label="確定" onPress={confirmRevise} selected={false} />
              </ThemedView>
            </ThemedView>
          ) : null}

          {panel === "fresh" ? (
            <ThemedView style={styles.panel}>
              <ThemedText accessibilityLanguage={APP_LOCALE}>新牌局</ThemedText>
              {freshNotice ? (
                <ThemedText accessibilityLanguage={APP_LOCALE}>
                  {freshNotice}
                </ThemedText>
              ) : null}
              {freshNotice ? (
                <ThemedView style={styles.row}>
                  <Choice
                    label="分配"
                    onPress={() => {
                      setFreshNotice(null);
                      setSplitIds([]);
                      setPanel("split");
                    }}
                    selected={false}
                  />
                  <Choice
                    label="轉入新局"
                    onPress={() => confirmFresh(true)}
                    selected={false}
                  />
                  <Choice
                    label="繼續舊局"
                    onPress={() => {
                      setFreshNotice(null);
                      setPanel(null);
                    }}
                    selected={false}
                  />
                </ThemedView>
              ) : null}
              <Choice
                label={`沿用現有玩家 ${reusePlayers ? "開" : "關"}`}
                onPress={() => setReusePlayers((value) => !value)}
                selected={reusePlayers}
              />
              <Choice
                label={`沿用現時玩法 ${reuseRules ? "開" : "關"}`}
                onPress={() => setReuseRules((value) => !value)}
                selected={reuseRules}
              />
              <ThemedView style={styles.row}>
                <Choice
                  label="取消"
                  onPress={() => setPanel(null)}
                  selected={false}
                />
                <Choice
                  label="確定"
                  onPress={() => confirmFresh(false)}
                  selected={false}
                />
              </ThemedView>
            </ThemedView>
          ) : null}

          {panel === "ledger" ? (
            <>
              <ThemedView style={styles.row}>
                <Choice
                  label="事件"
                  onPress={() => setEmphasis("events")}
                  selected={emphasis === "events"}
                />
                <Choice
                  label="分數"
                  onPress={() => setEmphasis("scores")}
                  selected={emphasis === "scores"}
                />
                <Choice
                  label="綜合"
                  onPress={() => setEmphasis("combined")}
                  selected={emphasis === "combined"}
                />
              </ThemedView>
              <ThemedView style={styles.row}>
                <Choice
                  label="順序"
                  onPress={() => setDirection("forward")}
                  selected={direction === "forward"}
                />
                <Choice
                  label="倒序"
                  onPress={() => setDirection("reverse")}
                  selected={direction === "reverse"}
                />
              </ThemedView>
              <LedgerTable
                session={session}
                mode={emphasis}
                reverse={direction === "reverse"}
              />
            </>
          ) : null}
        </ScrollView>
      ) : null}
      <Modal
        visible={panel === "draw"}
        transparent
        animationType="fade"
        onRequestClose={() => setPanel(null)}
      >
        <View style={styles.overlay}>
          <View accessibilityViewIsModal style={styles.dialog}>
            <ThemedText type="subtitle">確認這手流局？</ThemedText>
            <ThemedText>
              {session?.rules.passDealerOnDraw
                ? "流局後會過莊。"
                : "流局後會留莊。"}
            </ThemedText>
            <View style={styles.row}>
              <Action label="取消" onPress={() => setPanel(null)} />
              <Action label="確認流局" primary onPress={confirmDraw} />
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={panel === "undo"}
        transparent
        animationType="fade"
        onRequestClose={() => setPanel(null)}
      >
        <View style={styles.overlay}>
          <View accessibilityViewIsModal style={styles.dialog}>
            <ThemedText type="subtitle">還原上一筆？</ThemedText>
            <ThemedText>分數、彩池及牌局進度會回到上一筆記錄之前。</ThemedText>
            <View style={styles.row}>
              <Action label="取消" onPress={() => setPanel(null)} />
              <Action
                label="確定還原"
                primary
                onPress={confirmUndo}
                disabled={!session?.ledger.length}
              />
            </View>
          </View>
        </View>
      </Modal>
      {session ? (
        <Modal
          visible={more}
          transparent
          animationType="fade"
          onRequestClose={() => setMore(false)}
        >
          <View style={styles.overlay}>
            <ScrollView
              style={{ width: "100%", maxHeight: "90%" }}
              contentContainerStyle={{
                padding: 8,
                flexGrow: 1,
                justifyContent: "center",
              }}
            >
              <View style={styles.dialog}>
                <ThemedText type="subtitle">牌桌工具</ThemedText>
                <ThemedView style={styles.row}>
                  <Choice
                    label="調分"
                    onPress={() => setPanel("adjust")}
                    selected={false}
                  />
                  <Choice
                    label="換人"
                    onPress={() => setPanel("swap")}
                    selected={false}
                  />
                  <Choice
                    label="玩家"
                    onPress={() => setPanel("roster")}
                    selected={false}
                  />
                  {session.rules.trackDealer ? (
                    <Choice
                      label="莊家設定"
                      onPress={openDealer}
                      selected={false}
                    />
                  ) : null}
                  <Choice
                    label="還原分數"
                    onPress={() => setPanel("undo")}
                    selected={false}
                  />
                  {session.redo.length > 0 ? (
                    <Choice
                      label="重做"
                      onPress={confirmRedo}
                      selected={false}
                    />
                  ) : null}
                  <Choice
                    label="修改記錄"
                    onPress={() => setPanel("revise")}
                    selected={false}
                  />
                  <Choice
                    label="牌局"
                    onPress={() => {
                      setLifeError(null);
                      setSessionTitleText(session.title ?? "");
                      setPanel("life");
                    }}
                    selected={false}
                  />
                  <Choice label="擲骰" onPress={openDice} selected={false} />
                  <Choice label="新牌局" onPress={openFresh} selected={false} />
                </ThemedView>
                <Action label="關閉" onPress={() => setMore(false)} />
              </View>
            </ScrollView>
          </View>
        </Modal>
      ) : null}
      {panel === "win" && session ? (
        <View style={styles.commitBar}>
          <View style={{ flex: 1 }}>
            <ThemedText type="small" themeColor="textSecondary">
              {falseWin ? "罰則總額" : "本手淨變動"}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 24,
                fontWeight: "700",
                fontVariant: ["tabular-nums"],
              }}
            >
              {winPreview ? formatBalance(winPreview.total) : "—"}
            </ThemedText>
          </View>
          <Action
            label="確認記分"
            primary
            disabled={!winPreview || (multi && winnerIds.length < 2)}
            onPress={confirmWin}
          />
        </View>
      ) : null}
      <View
        style={[styles.tabs, { paddingBottom: Math.max(12, insets.bottom) }]}
      >
        {(
          [
            { key: null, label: "牌桌", icon: Grid2X2 },
            { key: "ledger", label: "記錄", icon: History },
            { key: "settle", label: "找數", icon: Wallet },
            { key: "stats", label: "統計", icon: ChartNoAxesColumn },
          ] as const
        ).map((tab) => (
          <Pressable
            key={tab.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: panel === tab.key }}
            onPress={() => setPanel(tab.key)}
            style={({ pressed }) => [
              styles.tab,
              (panel === tab.key || pressed) && {
                backgroundColor: palette.selected,
              },
            ]}
          >
            <tab.icon
              size={22}
              color={panel === tab.key ? palette.primary : palette.muted}
              aria-hidden={true}
            />
            <ThemedText
              type="small"
              style={{
                color: panel === tab.key ? palette.primary : palette.muted,
              }}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </ThemedView>
  );
}

function readFan(text: string): number | null {
  const trimmed = text.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const fan = Number(trimmed);
  return Number.isSafeInteger(fan) ? fan : null;
}

function Choice({
  label,
  selected,
  disabled = false,
  onPress,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Action
      label={label}
      selected={selected}
      disabled={disabled}
      onPress={onPress}
      primary={label === "確定" || label === "確認記分" || label === "食糊!"}
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.5)",
    justifyContent: "center",
    padding: 24,
  },
  dialog: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    padding: 24,
    gap: 20,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  progressCard: {
    backgroundColor: palette.selected,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  screen: { flex: 1 },
  content: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    padding: 20,
    gap: 16,
    paddingBottom: 32,
  },
  player: {
    gap: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 16,
    backgroundColor: palette.surface,
  },
  row: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.two },
  panel: {
    gap: 16,
    padding: 20,
    borderRadius: 20,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
  },
  zoneTitle: { fontSize: 20, fontWeight: "700", color: palette.primary },
  emptyReserve: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: palette.background,
  },
  addReserve: {
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: palette.line,
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  scoreGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  reserveSection: { gap: 12, paddingTop: 8 },
  reserveCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 16,
    backgroundColor: palette.surface,
  },
  reserveBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: palette.background,
    color: palette.muted,
    fontSize: 13,
  },
  reserveBalance: {
    gap: 4,
    alignItems: "flex-end",
    maxWidth: "50%",
    flexShrink: 1,
  },
  scoreCard: {
    width: "47%",
    flexGrow: 1,
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    backgroundColor: palette.surface,
    borderColor: palette.line,
  },
  notice: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: palette.selected,
    color: palette.primary,
  },
  preview: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: palette.selected,
    gap: 8,
  },
  score: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  badge: {
    backgroundColor: palette.selected,
    color: palette.primary,
    fontSize: 13,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  commitBar: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.surface,
  },
  tabs: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.surface,
  },
  tab: {
    flex: 1,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: 12,
  },
  fanHelpMark: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    fontSize: 18,
  },
  choice: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: Spacing.two,
  },
});
