import { router, Stack, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { RadarChart } from '@/components/radar-chart';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { APP_LOCALE } from '@/locale';
import { useRuleRepository } from '@/rules/repository';
import { formatAmount, formatMultiplier, selfDrawAmount } from '@/rules/setup';
import { Score } from '@/score/score';
import { eligibleJackpotIds, formatWinPreview, previewWin, recordDraw, recordWin, splitJackpot, winRefusal } from '@/session/hand';
import { reviseEntry } from '@/session/history';
import { useSessionRepository } from '@/session/repository';
import {
  formatSettlementBalance,
  hasPositiveBalance,
  poolUnallocated,
  settlementRows,
} from '@/session/settlement';
import { clearRoster, stageRoster } from '@/session/pending-roster';
import { formatAverage, formatCountRate, rosterStatistics } from '@/session/statistics';
import { clampDiceCount, MIN_DICE, rollDice, type DiceRoll } from '@/session/dice';
import { FAN_HELP_BODY, FAN_HELP_TITLE } from '@/session/fan-help';
import {
  addReserve,
  adjustScore,
  canRemovePlayer,
  formatBalance,
  formatDealerBadge,
  formatStartDate,
  formatWind,
  ledgerLines,
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
} from '@/session/session';
import type { Session } from '@/session/types';

type Panel = 'win' | 'draw' | 'swap' | 'roster' | 'dealer' | 'undo' | 'fresh' | 'pool' | 'split' | 'settle' | 'stats' | 'dice' | 'rules' | 'life' | 'revise' | 'adjust' | null;
type Payer = 'self-draw' | string | null;

export default function SessionScreen() {
  const theme = useTheme();
  const repo = useSessionRepository();
  const rulesRepo = useRuleRepository();
  const [session, setSession] = useState<Session | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [reserveName, setReserveName] = useState('');
  const [incomingId, setIncomingId] = useState<string | null>(null);
  const [seatIndex, setSeatIndex] = useState<number | null>(null);
  const [billToOriginal, setBillToOriginal] = useState(false);
  const [rosterPlayerId, setRosterPlayerId] = useState<string | null>(null);
  const [rosterName, setRosterName] = useState('');
  const [swapA, setSwapA] = useState<number | null>(null);
  const [swapB, setSwapB] = useState<number | null>(null);
  const [dealerId, setDealerId] = useState<string | null>(null);
  const [resetConsecutive, setResetConsecutive] = useState(true);
  const [restartWind, setRestartWind] = useState(false);
  const [reusePlayers, setReusePlayers] = useState(false);
  const [reuseRules, setReuseRules] = useState(false);
  const [freshNotice, setFreshNotice] = useState<string | null>(null);
  const [direction, setDirection] = useState<'forward' | 'reverse'>('forward');
  const [emphasis, setEmphasis] = useState<LedgerEmphasis>('events');
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [fanText, setFanText] = useState('');
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
  const [diceCount, setDiceCount] = useState(MIN_DICE);
  const [diceRoll, setDiceRoll] = useState<DiceRoll | null>(null);
  const [fanHelp, setFanHelp] = useState(false);
  const [lifeError, setLifeError] = useState<string | null>(null);
  const [sessionTitle, setSessionTitleText] = useState('');
  const [reviseId, setReviseId] = useState<string | null>(null);
  const [reviseFan, setReviseFan] = useState('');
  const [limitHand, setLimitHand] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [adjustPlayerId, setAdjustPlayerId] = useState<string | null>(null);
  const [adjustText, setAdjustText] = useState('');
  const [adjustNote, setAdjustNote] = useState('');

  useFocusEffect(
    useCallback(() => {
      let live = true;
      repo.getOpen().then((open) => {
        if (!live) return;
        if (!open) {
          router.replace('/session/seat' as Href);
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
    setPanel('pool');
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
    setReserveName('');
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
    await persist(selectDealer(session, dealerId, resetConsecutive, restartWind));
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
    if (!entry?.action || entry.action.type !== 'win') {
      setLifeError(entry ? `未能重算「${entry.label}」` : '找不到這筆記錄');
      return;
    }
    const fan = readFan(reviseFan);
    if (fan === null) return;
    const revised = reviseEntry(session, reviseId, { type: 'win', input: { ...entry.action.input, fan } });
    if ('error' in revised) {
      setLifeError(revised.error);
      return;
    }
    setLifeError(null);
    setPanel(null);
    await persist(revised.session);
  }

  async function confirmFresh(carry = false) {
    if (!session) return;
    const poolLeft = !Score.fromString(session.pool).equals(Score.fromString('0'));
    if (poolLeft && !carry) {
      setFreshNotice('彩池尚未分配。請先分配、明確轉入新局，或取消以繼續舊局。');
      return;
    }
    setFreshNotice(null);
    const source = carry ? markPoolTransfer(session) : session;
    const carried = carry ? session.pool : '0';
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
    router.replace((reusePlayers ? '/rules' : reuseRules ? '/session/seat' : '/rules') as Href);
  }

  function openDealer() {
    setDealerId(session?.dealerId ?? session?.seats.find((seat) => seat.playerId)?.playerId ?? null);
    setResetConsecutive(true);
    setRestartWind(false);
    setPanel('dealer');
  }

  function openFresh() {
    setReusePlayers(false);
    setReuseRules(false);
    setPanel('fresh');
  }

  function openDice() {
    setDiceCount(MIN_DICE);
    setDiceRoll(null);
    setPanel('dice');
  }

  function openWin() {
    setFanHelp(false);
    setWinnerId(null);
    setFanText('');
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
    setPanel('win');
  }

  function toggleMulti() {
    if (multi) {
      setMulti(false);
      setWinNotice(null);
      if (selectedWinnerId) {
        setWinnerId(selectedWinnerId);
        setFanText(fans[selectedWinnerId] ?? '');
      }
      return;
    }
    if (discarderPaysSelfDraw || discarderPaysLoss) {
      setWinNotice('請先取消包付，先可以開一炮多響');
      return;
    }
    setWinNotice(null);
    setMulti(true);
    setLimitHand(false);
    setTakeJackpot(false);
    if (payer === 'self-draw') setPayer(null);
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
    if ((discarderPaysSelfDraw || discarderPaysLoss) && !winnerIds.includes(playerId)) {
      setWinNotice('請先取消包付，先可以加入另一個贏家');
      return;
    }
    if (payer === playerId) setPayer(null);
    if (!winnerIds.includes(playerId) && winnerIds.length >= 3) return;
    setSelectedWinnerId(playerId);
    if (!winnerIds.includes(playerId)) setWinnerIds([...winnerIds, playerId]);
  }

  function toggleFalseWin() {
    if (!falseWin) {
      if (multi && selectedWinnerId) {
        setWinnerId(selectedWinnerId);
        setFanText(fans[selectedWinnerId] ?? '');
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
        if (payer === 'self-draw') setPayer(null);
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
        if (payer === 'self-draw') setPayer(null);
      }
      return !current;
    });
  }

  async function confirmAdjust() {
    if (!session || !adjustPlayerId) return;
    const note = adjustNote.trim();
    if (note === '') return;
    let next;
    try {
      next = adjustScore(session, adjustPlayerId, adjustText, note);
    } catch {
      return;
    }
    if (next === session) return;
    setAdjustText('');
    setAdjustNote('');
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
      if (!selectedWinnerId || payer === 'self-draw') return;
      const fan = readFan(fans[selectedWinnerId] ?? '');
      if (fan === null) return;
      const also = winnerIds.flatMap((id) => {
        if (id === selectedWinnerId) return [];
        const value = readFan(fans[id] ?? '');
        return value === null ? [] : [{ playerId: id, fan: value }];
      });
      if (also.length !== winnerIds.filter((id) => id !== selectedWinnerId).length) return;
      const next = recordWin(session, { winnerId: selectedWinnerId, fan, discarderId: payer, also });
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
      discarderId: payer === 'self-draw' ? null : payer,
      discarderPaysSelfDraw,
      discarderPaysLoss,
      takeJackpot: session.rules.jackpotEnabled && takeJackpot,
      limitHand,
    });
    if (next === session) return;
    setPanel(null);
    await persist(next);
  }

  const seated = session ? new Set(seatedPlayerIds(session)) : new Set<string>();
  const reserves = session?.players.filter((player) => !seated.has(player.id)) ?? [];
  const previewWinnerId = multi ? selectedWinnerId : winnerId;
  const previewFan = limitHand
    ? session?.rules.maxFan ?? null
    : multi
      ? selectedWinnerId
        ? readFan(fans[selectedWinnerId] ?? '')
        : null
      : readFan(fanText);
  const also = multi
    ? winnerIds.flatMap((id) => {
        if (id === selectedWinnerId) return [];
        const value = readFan(fans[id] ?? '');
        return value === null ? [] : [{ playerId: id, fan: value }];
      })
    : [];
  const alsoComplete = !multi || also.length === winnerIds.filter((id) => id !== selectedWinnerId).length;
  const winPreview =
    session && previewWinnerId && previewFan !== null && alsoComplete && (falseWin || payer !== null)
      ? previewWin(session, {
          winnerId: previewWinnerId,
          fan: previewFan,
          discarderId: falseWin || payer === 'self-draw' || payer === null ? null : payer,
          also: falseWin ? [] : also,
          falseWin,
          falseWinAsSelfDraw,
          discarderPaysSelfDraw,
          discarderPaysLoss,
          takeJackpot: session.rules.jackpotEnabled && !falseWin && !multi && takeJackpot,
          limitHand,
        })
      : null;

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen options={{ title: '現時賽果' }} />
      {session ? (
        <ScrollView contentContainerStyle={styles.content}>
          {panel === null ? (
            <Choice label={session.rules.name} onPress={() => setPanel('rules')} selected={false} />
          ) : (
            <ThemedText accessibilityLanguage={APP_LOCALE}>{session.rules.name}</ThemedText>
          )}
          {session.pendingRules ? (
            <ThemedText accessibilityLanguage={APP_LOCALE}>{`下一手 ${session.pendingRules.name}`}</ThemedText>
          ) : null}
          <ThemedText accessibilityLanguage={APP_LOCALE}>{`開始日期 ${formatStartDate(session.startedAt)}`}</ThemedText>
          <ThemedText accessibilityLanguage={APP_LOCALE}>{`總局數 ${session.handCount}`}</ThemedText>
          <ThemedText accessibilityLanguage={APP_LOCALE}>{sessionStatusLabel(session.status)}</ThemedText>
          {session.title ? <ThemedText accessibilityLanguage={APP_LOCALE}>{session.title}</ThemedText> : null}
          {session.rules.trackDealer ? (
            <>
              <ThemedText accessibilityLanguage={APP_LOCALE}>
                {session.progressDisplay === 'wind'
                  ? `牌局進度 ${formatWind(session.roundWind, session.seatWind)}`
                  : `牌局進度 ${session.handCount}`}
              </ThemedText>
              <ThemedText accessibilityLanguage={APP_LOCALE}>進度顯示方式</ThemedText>
              <ThemedView style={styles.row}>
                <Choice
                  label="圈風"
                  onPress={() => persist(setProgressDisplay(session, 'wind'))}
                  selected={session.progressDisplay === 'wind'}
                />
                <Choice
                  label="局數"
                  onPress={() => persist(setProgressDisplay(session, 'hand-count'))}
                  selected={session.progressDisplay === 'hand-count'}
                />
              </ThemedView>
            </>
          ) : null}
          {session.rules.jackpotEnabled ? (
            panel === null && seated.size === 4 ? (
              <Choice label={`Jackpot ${formatBalance(session.pool)}`} onPress={openPool} selected={false} />
            ) : (
              <ThemedText accessibilityLanguage={APP_LOCALE}>{`Jackpot ${formatBalance(session.pool)}`}</ThemedText>
            )
          ) : null}

          {session.seats.map((seat) => {
            const player = session.players.find((item) => item.id === seat.playerId);
            if (!player) return null;
            const dealer = session.rules.trackDealer && player.id === session.dealerId;
            return (
              <ThemedView key={seat.index} style={styles.player}>
                <Pressable accessibilityRole="button" onPress={() => setDetailId(detailId === player.id ? null : player.id)}>
                  <ThemedText accessibilityLanguage={APP_LOCALE}>
                    {`${player.avatar} ${player.name} ${formatBalance(player.balance)}`}
                  </ThemedText>
                </Pressable>
                {detailId === player.id ? (
                  <ThemedText accessibilityLanguage={APP_LOCALE}>{`精確 ${formatAmount(player.balance)}`}</ThemedText>
                ) : null}
                {dealer ? (
                  <ThemedText accessibilityLanguage={APP_LOCALE}>{formatDealerBadge(session.dealerMark)}</ThemedText>
                ) : null}
              </ThemedView>
            );
          })}
          {reserves.map((player) => (
            <ThemedText accessibilityLanguage={APP_LOCALE} key={player.id}>
              {`${player.avatar} ${player.name} ${formatBalance(player.balance)}`}
            </ThemedText>
          ))}

          {panel === null && session.status === 'playing' ? (
            <ThemedView style={styles.row}>
              <Choice label="食糊!" onPress={openWin} selected={false} />
              <Choice label="流局" onPress={() => setPanel('draw')} selected={false} />
              <Choice label="調分" onPress={() => setPanel('adjust')} selected={false} />
              <Choice label="換人" onPress={() => setPanel('swap')} selected={false} />
              <Choice label="玩家" onPress={() => setPanel('roster')} selected={false} />
              {session.rules.trackDealer ? <Choice label="莊家設定" onPress={openDealer} selected={false} /> : null}
              <Choice label="還原分數" onPress={() => setPanel('undo')} selected={false} />
              {session.redo.length > 0 ? <Choice label="重做" onPress={confirmRedo} selected={false} /> : null}
              <Choice label="修改記錄" onPress={() => setPanel('revise')} selected={false} />
              <Choice label="牌局" onPress={() => { setLifeError(null); setSessionTitleText(session.title ?? ''); setPanel('life'); }} selected={false} />
              <Choice label="擲骰" onPress={openDice} selected={false} />
              <Choice label="新牌局" onPress={openFresh} selected={false} />
            </ThemedView>
          ) : null}
          {panel === null ? (
            <ThemedView style={styles.row}>
              <Choice label="找數" onPress={() => setPanel('settle')} selected={false} />
              <Choice label="統計數據" onPress={() => setPanel('stats')} selected={false} />
              <Choice label="牌局紀錄" onPress={() => router.push('/history' as Href)} selected={false} />
            </ThemedView>
          ) : null}

          {panel === 'win' ? (
            <ThemedView style={styles.panel}>
              <ThemedText accessibilityLanguage={APP_LOCALE}>食糊!</ThemedText>
              {session.seats.map((seat) => {
                const player = session.players.find((item) => item.id === seat.playerId);
                if (!player) return null;
                const chosen = multi ? winnerIds.includes(player.id) : winnerId === player.id;
                return (
                  <Choice
                    key={player.id}
                    label={multi && player.id === selectedWinnerId ? `${player.name} · 番數` : player.name}
                    onPress={() => chooseWinner(player.id)}
                    selected={chosen}
                  />
                );
              })}
              <ThemedView style={styles.row}>
                <ThemedText accessibilityLanguage={APP_LOCALE}>{falseWin ? '詐糊番數' : '番數'}</ThemedText>
                <Pressable
                  accessibilityLabel="番數?"
                  accessibilityLanguage={APP_LOCALE}
                  hitSlop={8}
                  onPress={() => setFanHelp((open) => !open)}
                  style={[styles.fanHelpMark, { borderColor: theme.text }]}>
                  <ThemedText accessibilityLanguage={APP_LOCALE}>?</ThemedText>
                </Pressable>
              </ThemedView>
              {fanHelp ? (
                <ThemedView style={styles.panel}>
                  <ThemedText accessibilityLanguage={APP_LOCALE}>{FAN_HELP_TITLE}</ThemedText>
                  <ThemedText accessibilityLanguage={APP_LOCALE}>{FAN_HELP_BODY}</ThemedText>
                </ThemedView>
              ) : null}
              {limitHand ? null : (
              <TextInput
                accessibilityLabel={falseWin ? '詐糊番數' : '番數'}
                keyboardType="number-pad"
                onChangeText={(text) => {
                  if (!multi || falseWin) {
                    setFanText(text);
                    return;
                  }
                  if (!selectedWinnerId) return;
                  setFans((current) => ({ ...current, [selectedWinnerId]: text }));
                }}
                placeholder={falseWin ? '詐糊番數' : '番數'}
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                accessibilityLanguage={APP_LOCALE}
                value={multi && !falseWin ? (selectedWinnerId ? (fans[selectedWinnerId] ?? '') : '') : fanText}
              />
              )}
              <Choice label={`詐糊 ${falseWin ? '開' : '關'}`} onPress={toggleFalseWin} selected={falseWin} />
              <Choice label={`例牌 ${limitHand ? '開' : '關'}`} onPress={toggleLimitHand} selected={limitHand} />
              {limitHand ? (
                <ThemedText accessibilityLanguage={APP_LOCALE}>{`按滿糊 ${session.rules.maxFan} 番`}</ThemedText>
              ) : null}
              {falseWin ? (
                <Choice
                  label={`詐糊賠位自摸 ${falseWinAsSelfDraw ? '開' : '關'}`}
                  onPress={() => setFalseWinAsSelfDraw((value) => !value)}
                  selected={falseWinAsSelfDraw}
                />
              ) : (
                <>
                  <Choice label={`一炮多響 ${multi ? '開' : '關'}`} onPress={toggleMulti} selected={multi} />
                  <Choice
                    disabled={multi}
                    label={`出銃者包自摸 ${discarderPaysSelfDraw ? '開' : '關'}`}
                    onPress={toggleCoverSelfDraw}
                    selected={discarderPaysSelfDraw}
                  />
                  <Choice
                    disabled={multi}
                    label={`出銃者包輸 ${discarderPaysLoss ? '開' : '關'}`}
                    onPress={toggleCoverLoss}
                    selected={discarderPaysLoss}
                  />
                  {multi || discarderPaysSelfDraw || discarderPaysLoss ? null : (
                    <Choice label="自摸" onPress={() => setPayer('self-draw')} selected={payer === 'self-draw'} />
                  )}
                  {session.rules.jackpotEnabled && !multi ? (
                    <Choice
                      label={`贏取Jackpot ${takeJackpot ? '開' : '關'}`}
                      onPress={() => setTakeJackpot((value) => !value)}
                      selected={takeJackpot}
                    />
                  ) : null}
                  {session.seats.map((seat) => {
                    const player = session.players.find((item) => item.id === seat.playerId);
                    const blocked = multi ? winnerIds.includes(player?.id ?? '') : player?.id === winnerId;
                    if (!player || blocked) return null;
                    return (
                      <Choice
                        key={`discard-${player.id}`}
                        label={`出銃者 ${player.name}`}
                        onPress={() => setPayer(player.id)}
                        selected={payer === player.id}
                      />
                    );
                  })}
                </>
              )}
              {session && winRefusal(session.rules, [previewFan ?? NaN, ...also.map((item) => item.fan)]) ? (
                <ThemedText accessibilityLanguage={APP_LOCALE}>番數不足</ThemedText>
              ) : null}
              {session.rules.paymentMode === 'half-discard' && (discarderPaysSelfDraw || discarderPaysLoss) ? (
                <ThemedText accessibilityLanguage={APP_LOCALE}>本手包付，半銃分攤不適用</ThemedText>
              ) : null}
              {discarderPaysSelfDraw && discarderPaysLoss ? (
                <ThemedText accessibilityLanguage={APP_LOCALE}>包自摸同包輸不能同時開</ThemedText>
              ) : null}
              {multi ? (
                <ThemedText accessibilityLanguage={APP_LOCALE}>一炮多響未支援包自摸或包輸</ThemedText>
              ) : null}
              {winNotice ? <ThemedText accessibilityLanguage={APP_LOCALE}>{winNotice}</ThemedText> : null}
              {limitHand && (falseWin || multi) ? (
                <ThemedText accessibilityLanguage={APP_LOCALE}>例牌未支援詐糊或一炮多響</ThemedText>
              ) : null}
              {winPreview ? formatWinPreview(winPreview).map((line) => (
                <ThemedText accessibilityLanguage={APP_LOCALE} key={line}>
                  {line}
                </ThemedText>
              )) : null}
              <ThemedView style={styles.row}>
                <Choice label="取消" onPress={() => setPanel(null)} selected={false} />
                <Choice label="確定" onPress={confirmWin} selected={false} />
              </ThemedView>
            </ThemedView>
          ) : null}

          {panel === 'pool' ? (
            <ThemedView style={styles.panel}>
              <ThemedText accessibilityLanguage={APP_LOCALE}>請選擇</ThemedText>
              <Choice label="平分Jackpot" onPress={() => setPanel('split')} selected={false} />
              <Choice label="取消" onPress={() => setPanel(null)} selected={false} />
            </ThemedView>
          ) : null}

          {panel === 'split' && session ? (
            <ThemedView style={styles.panel}>
              <ThemedText accessibilityLanguage={APP_LOCALE}>平分給哪些玩家？</ThemedText>
              {session.players
                .filter((player) => eligibleJackpotIds(session).includes(player.id))
                .map((player) => (
                  <Choice
                    key={player.id}
                    label={player.name}
                    onPress={() =>
                      setSplitIds((current) =>
                        current.includes(player.id) ? current.filter((id) => id !== player.id) : [...current, player.id],
                      )
                    }
                    selected={splitIds.includes(player.id)}
                  />
                ))}
              <ThemedView style={styles.row}>
                <Choice label="取消" onPress={() => setPanel(null)} selected={false} />
                <Choice label="確定" onPress={confirmSplit} selected={false} />
              </ThemedView>
            </ThemedView>
          ) : null}

          {panel === 'rules' ? (
            <ThemedView style={styles.panel}>
              <ThemedText accessibilityLanguage={APP_LOCALE}>{session.rules.name}</ThemedText>
              <ThemedText accessibilityLanguage={APP_LOCALE}>
                {session.rules.playerFormat === 'four' ? '四人麻雀' : '三人麻雀'}
              </ThemedText>
              <ThemedText accessibilityLanguage={APP_LOCALE}>
                {session.rules.paymentMode === 'full-discard' ? '全銃' : '半銃'}
              </ThemedText>
              <ThemedText accessibilityLanguage={APP_LOCALE}>{`起糊 ${session.rules.minFan}`}</ThemedText>
              <ThemedText accessibilityLanguage={APP_LOCALE}>{`滿糊 ${session.rules.maxFan}`}</ThemedText>
              <ThemedText accessibilityLanguage={APP_LOCALE}>{`自摸倍數 ×${formatMultiplier(session.rules.multiplier)}`}</ThemedText>
              <ThemedText accessibilityLanguage={APP_LOCALE}>
                {session.rules.jackpotEnabled ? 'Jackpot 啟用' : 'Jackpot 關閉'}
              </ThemedText>
              {session.rules.jackpotEnabled ? (
                <ThemedText accessibilityLanguage={APP_LOCALE}>
                  {`流局時每位玩家須付彩池 ${formatAmount(session.rules.jackpotContribution)}`}
                </ThemedText>
              ) : null}
              <ThemedText accessibilityLanguage={APP_LOCALE}>
                {`紀錄莊家及圈風 ${session.rules.trackDealer ? '開' : '關'}`}
              </ThemedText>
              {session.rules.trackDealer ? (
                <ThemedText accessibilityLanguage={APP_LOCALE}>
                  {`流局時過莊 ${session.rules.passDealerOnDraw ? '開' : '關'}`}
                </ThemedText>
              ) : null}
              <ThemedView style={styles.row}>
                <ThemedText accessibilityLanguage={APP_LOCALE}>番</ThemedText>
                <ThemedText accessibilityLanguage={APP_LOCALE}>食糊分數</ThemedText>
                <ThemedText accessibilityLanguage={APP_LOCALE}>自摸分數</ThemedText>
              </ThemedView>
              {session.rules.rows.map((row) => (
                <ThemedView key={row.fan} style={styles.row}>
                  <ThemedText accessibilityLanguage={APP_LOCALE}>{`${row.fan}`}</ThemedText>
                  <ThemedText accessibilityLanguage={APP_LOCALE}>{formatAmount(row.ordinary)}</ThemedText>
                  <ThemedText accessibilityLanguage={APP_LOCALE}>
                    {formatAmount(selfDrawAmount(session.rules, row.fan))}
                  </ThemedText>
                </ThemedView>
              ))}
              <Choice label="改下一手玩法" onPress={() => router.push('/rules' as Href)} selected={false} />
              <Choice label="取消" onPress={() => setPanel(null)} selected={false} />
            </ThemedView>
          ) : null}

          {panel === 'adjust' && session ? (
            <ThemedView style={styles.panel}>
              <ThemedText accessibilityLanguage={APP_LOCALE}>調分</ThemedText>
              <ThemedText accessibilityLanguage={APP_LOCALE}>只改這個人的分數，不改食糊、莊家或彩池。</ThemedText>
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
                style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                value={adjustText}
              />
              <TextInput
                accessibilityLabel="調分原因"
                accessibilityLanguage={APP_LOCALE}
                onChangeText={setAdjustNote}
                placeholder="原因"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                value={adjustNote}
              />
              <ThemedView style={styles.row}>
                <Choice label="取消" onPress={() => setPanel(null)} selected={false} />
                <Choice label="確定" onPress={confirmAdjust} selected={false} />
              </ThemedView>
            </ThemedView>
          ) : null}

          {panel === 'settle' ? (
            <ThemedView style={styles.panel}>
              <ThemedText accessibilityLanguage={APP_LOCALE}>找數</ThemedText>
              {hasPositiveBalance(session) ? null : (
                <ThemedText accessibilityLanguage={APP_LOCALE}>未有玩家分數為正數</ThemedText>
              )}
              {settlementRows(session).map((row) => (
                <ThemedView key={row.playerId}>
                  <ThemedText accessibilityLanguage={APP_LOCALE}>
                    {`${row.name} ${formatSettlementBalance(row.balance)}`}
                  </ThemedText>
                  {formatBalance(row.balance).startsWith('≈') ? (
                    <ThemedText accessibilityLanguage={APP_LOCALE}>{`精確 ${formatAmount(row.balance)}`}</ThemedText>
                  ) : null}
                </ThemedView>
              ))}
              <ThemedText accessibilityLanguage={APP_LOCALE}>{`彩池 ${formatBalance(session.pool)}`}</ThemedText>
              {formatBalance(session.pool).startsWith('≈') ? (
                <ThemedText accessibilityLanguage={APP_LOCALE}>{`精確 ${formatAmount(session.pool)}`}</ThemedText>
              ) : null}
              {poolUnallocated(session) ? (
                <ThemedText accessibilityLanguage={APP_LOCALE}>尚未分配</ThemedText>
              ) : null}
              <Choice label="取消" onPress={() => setPanel(null)} selected={false} />
            </ThemedView>
          ) : null}

          {panel === 'stats' ? (
            <ThemedView style={styles.panel}>
              <ThemedText accessibilityLanguage={APP_LOCALE}>統計數據</ThemedText>
              {rosterStatistics(session).map((row) => (
                <ThemedView key={row.playerId} style={styles.player}>
                  <ThemedText accessibilityLanguage={APP_LOCALE}>{row.name}</ThemedText>
                  <ThemedText accessibilityLanguage={APP_LOCALE}>
                    {`食糊 ${row.wins}  自摸 ${row.selfDraws}  出銃 ${row.discards}  手數 ${row.hands}`}
                  </ThemedText>
                  <ThemedText accessibilityLanguage={APP_LOCALE}>
                    {`自摸率 ${formatCountRate(row.selfDrawRate, row.selfDraws, row.wins)}`}
                  </ThemedText>
                  <ThemedText accessibilityLanguage={APP_LOCALE}>
                    {`食糊率 ${formatCountRate(row.winRate, row.wins, row.hands)}`}
                  </ThemedText>
                  <ThemedText accessibilityLanguage={APP_LOCALE}>
                    {`出銃率 ${formatCountRate(row.discardRate, row.discards, row.hands)}`}
                  </ThemedText>
                  <ThemedText accessibilityLanguage={APP_LOCALE}>{`平均番數 ${formatAverage(row.averageFan)}`}</ThemedText>
                  <ThemedText accessibilityLanguage={APP_LOCALE}>
                    {`平均出銃番數 ${formatAverage(row.averageDiscardFan)}  多響番數合計`}
                  </ThemedText>
                  {row.titles.length > 0 ? (
                    <ThemedText accessibilityLanguage={APP_LOCALE}>{row.titles.join('  ')}</ThemedText>
                  ) : null}
                  <RadarChart
                    attack={row.attack}
                    strength={row.strength}
                    defense={row.defense}
                    color={theme.text}
                    track={theme.backgroundElement}
                  />
                </ThemedView>
              ))}
              <Choice label="取消" onPress={() => setPanel(null)} selected={false} />
            </ThemedView>
          ) : null}

          {panel === 'dice' ? (
            <ThemedView style={styles.panel}>
              <ThemedText accessibilityLanguage={APP_LOCALE}>擲骰</ThemedText>
              <ThemedText accessibilityLanguage={APP_LOCALE}>{`${diceCount}`}</ThemedText>
              <ThemedView style={styles.row}>
                <Choice label="−" onPress={() => setDiceCount(clampDiceCount(diceCount - 1))} selected={false} />
                <Choice label="擲骰" onPress={() => setDiceRoll(rollDice(diceCount))} selected={false} />
                <Choice label="+" onPress={() => setDiceCount(clampDiceCount(diceCount + 1))} selected={false} />
              </ThemedView>
              {diceRoll ? (
                <ThemedText accessibilityLanguage={APP_LOCALE}>{`${diceRoll.total} ${diceRoll.seat}`}</ThemedText>
              ) : null}
              <Choice label="取消" onPress={() => setPanel(null)} selected={false} />
            </ThemedView>
          ) : null}

          {panel === 'draw' ? (
            <ThemedView style={styles.panel}>
              <ThemedText accessibilityLanguage={APP_LOCALE}>流局</ThemedText>
              <ThemedView style={styles.row}>
                <Choice label="取消" onPress={() => setPanel(null)} selected={false} />
                <Choice label="確定" onPress={confirmDraw} selected={false} />
              </ThemedView>
            </ThemedView>
          ) : null}

          {panel === 'swap' ? (
            <ThemedView style={styles.panel}>
              <TextInput
                accessibilityLabel="玩家名稱"
                accessibilityLanguage={APP_LOCALE}
                onChangeText={setReserveName}
                placeholder="玩家名稱"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                value={reserveName}
              />
              <Choice label="加入" onPress={addNamedReserve} selected={false} />
              <Choice
                label={`入原玩家帳 ${billToOriginal ? '開' : '關'}`}
                onPress={() => setBillToOriginal((value) => !value)}
                selected={billToOriginal}
              />
              {reserves.map((player) => (
                <Choice
                  key={player.id}
                  label={`${player.avatar} ${player.name}`}
                  onPress={() => setIncomingId(player.id)}
                  selected={incomingId === player.id}
                />
              ))}
              {session.seats.map((seat) => {
                const player = session.players.find((item) => item.id === seat.playerId);
                return (
                  <Choice
                    key={seat.index}
                    label={`${seat.index + 1} ${player?.name ?? ''}`}
                    onPress={() => setSeatIndex(seat.index)}
                    selected={seatIndex === seat.index}
                  />
                );
              })}
              <ThemedView style={styles.row}>
                <Choice label="取消" onPress={() => setPanel(null)} selected={false} />
                <Choice label="確定" onPress={confirmSwap} selected={false} />
              </ThemedView>
            </ThemedView>
          ) : null}

          {panel === 'roster' && session ? (
            <ThemedView style={styles.panel}>
              <ThemedText accessibilityLanguage={APP_LOCALE}>玩家</ThemedText>
              {session.players.map((player) => (
                <Choice
                  key={player.id}
                  label={`${player.name}${canRemovePlayer(session, player.id) ? ' · 可移除' : ''}`}
                  onPress={() => {
                    setRosterPlayerId(player.id);
                    setRosterName(player.name);
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
                style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                value={rosterName}
              />
              <ThemedView style={styles.row}>
                <Choice
                  label="改名"
                  onPress={() => {
                    if (!rosterPlayerId) return;
                    const next = renamePlayer(session, rosterPlayerId, rosterName);
                    if (next !== session) persist(next);
                  }}
                  selected={false}
                />
                <Choice
                  label="移除"
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
                const player = session.players.find((item) => item.id === seat.playerId);
                return (
                  <Choice
                    key={seat.index}
                    label={`${seat.index + 1} ${player?.name ?? ''}`}
                    onPress={() => {
                      if (swapA === null || (swapA !== null && swapB !== null)) {
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
                  {`過莊會到 ${session.players.find((player) => player.id === nextDealerId(swapSeats(session, swapA, swapB)))?.name ?? ''}`}
                </ThemedText>
              ) : null}
              <ThemedView style={styles.row}>
                <Choice label="取消" onPress={() => setPanel(null)} selected={false} />
                <Choice
                  label="換位"
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

          {panel === 'dealer' ? (
            <ThemedView style={styles.panel}>
              <ThemedText accessibilityLanguage={APP_LOCALE}>莊家設定</ThemedText>
              {session.seats.map((seat) => {
                const player = session.players.find((item) => item.id === seat.playerId);
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
                label={`重置連莊數 ${resetConsecutive ? '開' : '關'}`}
                onPress={() => setResetConsecutive((value) => !value)}
                selected={resetConsecutive}
              />
              <Choice
                label={`重新開始計算圈風 ${restartWind ? '開' : '關'}`}
                onPress={() => setRestartWind((value) => !value)}
                selected={restartWind}
              />
              <ThemedView style={styles.row}>
                <Choice label="取消" onPress={() => setPanel(null)} selected={false} />
                <Choice label="確定" onPress={confirmDealer} selected={false} />
              </ThemedView>
            </ThemedView>
          ) : null}

          {panel === null && session.status === 'paused' ? (
            <Choice label="繼續牌局" onPress={() => persist(resumeSession(session))} selected={false} />
          ) : null}

          {panel === 'life' ? (
            <ThemedView style={styles.panel}>
              <ThemedText accessibilityLanguage={APP_LOCALE}>牌局</ThemedText>
              {lifeError ? <ThemedText accessibilityLanguage={APP_LOCALE}>{lifeError}</ThemedText> : null}
              <TextInput
                accessibilityLabel="牌局名稱"
                accessibilityLanguage={APP_LOCALE}
                onChangeText={setSessionTitleText}
                placeholder="牌局名稱"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                value={sessionTitle}
              />
              <Choice
                label="儲存名稱"
                onPress={() => persist(setSessionTitle(session, sessionTitle))}
                selected={false}
              />
              <Choice label="暫停" onPress={() => persist(pauseSession(session)).then(() => setPanel(null))} selected={false} />
              <Choice
                label="完成"
                onPress={async () => {
                  const next = completeSession(session);
                  if (next === session) {
                    setLifeError('彩池尚未分配');
                    return;
                  }
                  await repo.saveOpen(next);
                  await repo.archiveOpen();
                  setSession(null);
                  router.replace('/history' as Href);
                }}
                selected={false}
              />
              <Choice
                label="作廢"
                onPress={async () => {
                  await repo.saveOpen(voidSession(session));
                  await repo.archiveOpen();
                  setSession(null);
                  router.replace('/history' as Href);
                }}
                selected={false}
              />
              <Choice label="取消" onPress={() => setPanel(null)} selected={false} />
            </ThemedView>
          ) : null}

          {panel === 'revise' ? (
            <ThemedView style={styles.panel}>
              <ThemedText accessibilityLanguage={APP_LOCALE}>修改記錄</ThemedText>
              {lifeError ? <ThemedText accessibilityLanguage={APP_LOCALE}>{lifeError}</ThemedText> : null}
              {session.ledger.map((entry) => (
                <Choice
                  key={entry.id}
                  label={entry.label}
                  onPress={() => {
                    setReviseId(entry.id);
                    setReviseFan(entry.action?.type === 'win' ? String(entry.action.input.fan) : '');
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
                style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                value={reviseFan}
              />
              <ThemedView style={styles.row}>
                <Choice label="取消" onPress={() => setPanel(null)} selected={false} />
                <Choice label="確定" onPress={confirmRevise} selected={false} />
              </ThemedView>
            </ThemedView>
          ) : null}

          {panel === 'undo' ? (
            <ThemedView style={styles.panel}>
              <ThemedText accessibilityLanguage={APP_LOCALE}>還原分數</ThemedText>
              <ThemedView style={styles.row}>
                <Choice label="取消" onPress={() => setPanel(null)} selected={false} />
                <Choice label="確定" onPress={confirmUndo} selected={false} />
              </ThemedView>
            </ThemedView>
          ) : null}

          {panel === 'fresh' ? (
            <ThemedView style={styles.panel}>
              <ThemedText accessibilityLanguage={APP_LOCALE}>新牌局</ThemedText>
              {freshNotice ? <ThemedText accessibilityLanguage={APP_LOCALE}>{freshNotice}</ThemedText> : null}
              {freshNotice ? (
                <ThemedView style={styles.row}>
                  <Choice
                    label="分配"
                    onPress={() => {
                      setFreshNotice(null);
                      setSplitIds([]);
                      setPanel('split');
                    }}
                    selected={false}
                  />
                  <Choice label="轉入新局" onPress={() => confirmFresh(true)} selected={false} />
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
                label={`沿用現有玩家 ${reusePlayers ? '開' : '關'}`}
                onPress={() => setReusePlayers((value) => !value)}
                selected={reusePlayers}
              />
              <Choice
                label={`沿用現時玩法 ${reuseRules ? '開' : '關'}`}
                onPress={() => setReuseRules((value) => !value)}
                selected={reuseRules}
              />
              <ThemedView style={styles.row}>
                <Choice label="取消" onPress={() => setPanel(null)} selected={false} />
                <Choice label="確定" onPress={() => confirmFresh(false)} selected={false} />
              </ThemedView>
            </ThemedView>
          ) : null}

          <ThemedView style={styles.row}>
            <Choice label="事件" onPress={() => setEmphasis('events')} selected={emphasis === 'events'} />
            <Choice label="分數" onPress={() => setEmphasis('scores')} selected={emphasis === 'scores'} />
            <Choice label="綜合" onPress={() => setEmphasis('combined')} selected={emphasis === 'combined'} />
          </ThemedView>
          <ThemedView style={styles.row}>
            <Choice label="順序" onPress={() => setDirection('forward')} selected={direction === 'forward'} />
            <Choice label="倒序" onPress={() => setDirection('reverse')} selected={direction === 'reverse'} />
          </ThemedView>
          {ledgerLines(session, emphasis, direction).map((line) => (
            <ThemedText accessibilityLanguage={APP_LOCALE} key={line.id}>
              {line.text}
            </ThemedText>
          ))}
        </ScrollView>
      ) : null}
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
    <Pressable
      accessibilityLanguage={APP_LOCALE}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={styles.choice}>
      <ThemedText>{selected ? `${label} · 已選` : label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: Spacing.three, gap: Spacing.two, paddingBottom: Spacing.six },
  player: { gap: Spacing.half },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  panel: { gap: Spacing.two },
  fanHelpMark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: { minHeight: 48, borderWidth: 1, paddingHorizontal: Spacing.two, fontSize: 18 },
  choice: { minHeight: 48, justifyContent: 'center', paddingHorizontal: Spacing.two },
});
