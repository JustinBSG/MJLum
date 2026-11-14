import { router, Stack, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { APP_LOCALE } from '@/locale';
import { formatWinPreview, previewWin, recordDraw, recordWin } from '@/session/hand';
import { useSessionRepository } from '@/session/repository';
import {
  addReserve,
  formatBalance,
  formatDealerBadge,
  formatStartDate,
  formatWind,
  ledgerLabels,
  seatedPlayerIds,
  selectDealer,
  setProgressDisplay,
  substitute,
  undoLatest,
} from '@/session/session';
import type { Session } from '@/session/types';

type Panel = 'win' | 'draw' | 'swap' | 'dealer' | 'undo' | 'fresh' | null;
type Payer = 'self-draw' | string | null;

export default function SessionScreen() {
  const theme = useTheme();
  const repo = useSessionRepository();
  const [session, setSession] = useState<Session | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [reserveName, setReserveName] = useState('');
  const [incomingId, setIncomingId] = useState<string | null>(null);
  const [seatIndex, setSeatIndex] = useState<number | null>(null);
  const [dealerId, setDealerId] = useState<string | null>(null);
  const [resetConsecutive, setResetConsecutive] = useState(true);
  const [restartWind, setRestartWind] = useState(false);
  const [reusePlayers, setReusePlayers] = useState(false);
  const [reuseRules, setReuseRules] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'reverse'>('forward');
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [fanText, setFanText] = useState('');
  const [payer, setPayer] = useState<Payer>(null);
  const [multi, setMulti] = useState(false);
  const [winnerIds, setWinnerIds] = useState<string[]>([]);
  const [selectedWinnerId, setSelectedWinnerId] = useState<string | null>(null);
  const [fans, setFans] = useState<Record<string, string>>({});

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

  async function addNamedReserve() {
    if (!session) return;
    const next = addReserve(session, reserveName);
    if (next === session) return;
    setReserveName('');
    await persist(next);
  }

  async function confirmSwap() {
    if (!session || incomingId === null || seatIndex === null) return;
    const next = substitute(session, incomingId, seatIndex);
    if (next === session) return;
    setIncomingId(null);
    setSeatIndex(null);
    setPanel(null);
    await persist(next);
  }

  async function confirmDealer() {
    if (!session || !dealerId) return;
    await persist(selectDealer(session, dealerId, resetConsecutive));
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

  async function confirmFresh() {
    if (reusePlayers || reuseRules) return;
    await repo.clearOpen();
    setSession(null);
    setPanel(null);
    router.replace('/rules' as Href);
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

  function openWin() {
    setWinnerId(null);
    setFanText('');
    setPayer(null);
    setMulti(false);
    setWinnerIds([]);
    setSelectedWinnerId(null);
    setFans({});
    setPanel('win');
  }

  function toggleMulti() {
    if (multi) {
      setMulti(false);
      if (selectedWinnerId) {
        setWinnerId(selectedWinnerId);
        setFanText(fans[selectedWinnerId] ?? '');
      }
      return;
    }
    setMulti(true);
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
    if (payer === playerId) setPayer(null);
    if (!winnerIds.includes(playerId) && winnerIds.length >= 3) return;
    setSelectedWinnerId(playerId);
    if (!winnerIds.includes(playerId)) setWinnerIds([...winnerIds, playerId]);
  }

  async function confirmWin() {
    if (!session || payer === null) return;
    if (multi) {
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
    const fan = readFan(fanText);
    if (fan === null) return;
    const next = recordWin(session, {
      winnerId,
      fan,
      discarderId: payer === 'self-draw' ? null : payer,
    });
    if (next === session) return;
    setPanel(null);
    await persist(next);
  }

  const seated = session ? new Set(seatedPlayerIds(session)) : new Set<string>();
  const reserves = session?.players.filter((player) => !seated.has(player.id)) ?? [];
  const previewWinnerId = multi ? selectedWinnerId : winnerId;
  const previewFan = multi ? (selectedWinnerId ? readFan(fans[selectedWinnerId] ?? '') : null) : readFan(fanText);
  const also = multi
    ? winnerIds.flatMap((id) => {
        if (id === selectedWinnerId) return [];
        const value = readFan(fans[id] ?? '');
        return value === null ? [] : [{ playerId: id, fan: value }];
      })
    : [];
  const alsoComplete = !multi || also.length === winnerIds.filter((id) => id !== selectedWinnerId).length;
  const winPreview =
    session && previewWinnerId && previewFan !== null && payer !== null && alsoComplete
      ? previewWin(session, {
          winnerId: previewWinnerId,
          fan: previewFan,
          discarderId: payer === 'self-draw' ? null : payer,
          also,
        })
      : null;

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen options={{ title: '現時賽果' }} />
      {session ? (
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText accessibilityLanguage={APP_LOCALE}>{session.rules.name}</ThemedText>
          <ThemedText accessibilityLanguage={APP_LOCALE}>{`開始日期 ${formatStartDate(session.startedAt)}`}</ThemedText>
          <ThemedText accessibilityLanguage={APP_LOCALE}>{`總局數 ${session.handCount}`}</ThemedText>
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
            <ThemedText accessibilityLanguage={APP_LOCALE}>{`Jackpot ${formatBalance(session.pool)}`}</ThemedText>
          ) : null}

          {session.seats.map((seat) => {
            const player = session.players.find((item) => item.id === seat.playerId);
            if (!player) return null;
            const dealer = session.rules.trackDealer && player.id === session.dealerId;
            return (
              <ThemedView key={seat.index} style={styles.player}>
                <ThemedText accessibilityLanguage={APP_LOCALE}>
                  {`${player.avatar} ${player.name} ${formatBalance(player.balance)}`}
                </ThemedText>
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

          {panel === null ? (
            <ThemedView style={styles.row}>
              <Choice label="食糊!" onPress={openWin} selected={false} />
              <Choice label="流局" onPress={() => setPanel('draw')} selected={false} />
              <Choice label="換人" onPress={() => setPanel('swap')} selected={false} />
              {session.rules.trackDealer ? <Choice label="莊家設定" onPress={openDealer} selected={false} /> : null}
              <Choice label="還原分數" onPress={() => setPanel('undo')} selected={false} />
              <Choice label="新牌局" onPress={openFresh} selected={false} />
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
              <TextInput
                accessibilityLabel="番數"
                accessibilityLanguage={APP_LOCALE}
                keyboardType="number-pad"
                onChangeText={(text) => {
                  if (!multi) {
                    setFanText(text);
                    return;
                  }
                  if (!selectedWinnerId) return;
                  setFans((current) => ({ ...current, [selectedWinnerId]: text }));
                }}
                placeholder="番數"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                value={multi ? (selectedWinnerId ? (fans[selectedWinnerId] ?? '') : '') : fanText}
              />
              <Choice label={`一炮多響 ${multi ? '開' : '關'}`} onPress={toggleMulti} selected={multi} />
              {multi ? null : <Choice label="自摸" onPress={() => setPayer('self-draw')} selected={payer === 'self-draw'} />}
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
                <Choice label="確定" onPress={confirmFresh} selected={false} />
              </ThemedView>
            </ThemedView>
          ) : null}

          <ThemedView style={styles.row}>
            <Choice label="順序" onPress={() => setDirection('forward')} selected={direction === 'forward'} />
            <Choice label="倒序" onPress={() => setDirection('reverse')} selected={direction === 'reverse'} />
          </ThemedView>
          {ledgerLabels(session, direction).map((label, index) => (
            <ThemedText accessibilityLanguage={APP_LOCALE} key={`${label}-${index}`}>
              {label}
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

function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLanguage={APP_LOCALE}
      accessibilityRole="button"
      accessibilityState={{ selected }}
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
  input: { minHeight: 48, borderWidth: 1, paddingHorizontal: Spacing.two, fontSize: 18 },
  choice: { minHeight: 48, justifyContent: 'center', paddingHorizontal: Spacing.two },
});
