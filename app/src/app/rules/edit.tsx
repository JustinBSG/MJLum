import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { APP_LOCALE } from '@/locale';
import { useRuleRepository } from '@/rules/repository';
import { Score } from '@/score/score';
import {
  createCustomDraft,
  createPresetDraft,
  formatAmount,
  formatMultiplier,
  selfDrawAmount,
  setFanRange,
  setJackpotContribution,
  setJackpotEnabled,
  missingHighFans,
  setMultiplier,
  setName,
  setOrdinary,
  setPassDealerOnDraw,
  setPaymentMode,
  setPlayerFormat,
  setTrackDealer,
} from '@/rules/setup';
import type { RuleSetup } from '@/rules/types';

type Prompt = 'save' | 'abandon' | 'delete' | null;

export default function EditRuleSetupScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ kind?: string | string[]; id?: string | string[] }>();
  const kind = first(params.kind);
  const id = first(params.id);
  const repo = useRuleRepository();
  const draftKey = `${kind ?? ''}:${id ?? ''}`;
  const [storedKey, setStoredKey] = useState('');
  const [setup, setSetup] = useState<RuleSetup | null>(null);
  const [missing, setMissing] = useState(false);
  const [prompt, setPrompt] = useState<Prompt>(null);
  const [error, setError] = useState<string | null>(null);
  const drafts = useRef<Record<string, string>>({});

  if (storedKey !== draftKey) {
    setStoredKey(draftKey);
    setError(null);
    setPrompt(null);
    if (kind === 'preset' && id) {
      try {
        setSetup(createPresetDraft(id));
        setMissing(false);
      } catch {
        setSetup(null);
        setMissing(true);
      }
    } else if (kind === 'custom') {
      setSetup(createCustomDraft());
      setMissing(false);
    } else if (kind === 'saved') {
      setSetup(null);
      setMissing(false);
    } else {
      setSetup(null);
      setMissing(true);
    }
  }

  useEffect(() => {
    if (kind !== 'saved' || !id) return;
    let live = true;
    repo.listSaved().then((saved) => {
      if (!live) return;
      const found = saved.find((item) => item.id === id) ?? null;
      setSetup(found);
      setMissing(found === null);
    });
    return () => {
      live = false;
    };
  }, [draftKey, id, kind, repo]);

  function highFanError(setup: RuleSetup): boolean {
    const missing = missingHighFans(setup);
    if (missing.length === 0) return false;
    setError(`請先填 ${missing.join('、')} 番嘅食糊分數`);
    return true;
  }

  async function useOnce() {
    if (!setup || highFanError(setup)) return;
    await repo.setActive(setup);
    router.back();
  }

  async function save() {
    if (!setup || highFanError(setup)) return;
    await repo.save(setup);
    await repo.setActive(setup);
    router.back();
  }

  async function remove() {
    if (!setup || kind !== 'saved') return;
    await repo.deleteSaved(setup.id);
    router.back();
  }

  function commitExact(text: string, reportError: boolean, apply: (exact: string) => void, current: string) {
    const next = applyExact(text);
    if (next === null) {
      if (reportError) setError('不能用這個分數');
      return;
    }
    if (next === current) return;
    setError(null);
    apply(next);
  }

  function commitOrdinary(fan: number, current: string | null, text: string, reportError: boolean) {
    if (!setup) return;
    const trimmed = text.trim();
    if (trimmed === '') return;
    const next = applyExact(trimmed);
    if (next === null) {
      if (reportError) setError('不能用這個分數');
      return;
    }
    if (next === current) return;
    setError(null);
    setSetup(setOrdinary(setup, fan, next));
  }

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen
        options={{
          title: '玩法設定',
          headerLeft: () => (
            <Pressable accessibilityRole="button" onPress={() => setPrompt('save')} style={styles.headerButton}>
              <ThemedText>返回</ThemedText>
            </Pressable>
          ),
        }}
      />
      {missing || !setup ? (
        <ThemedText style={styles.missing}>未有自訂玩法</ThemedText>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="small">玩法名稱</ThemedText>
          <TextInput
            accessibilityLabel="玩法名稱"
            defaultValue={setup.name}
            key={setup.id}
            onChangeText={(text) => setSetup(setName(setup, text))}
            style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
          />

          <ThemedText type="small">人數</ThemedText>
          <ThemedView style={styles.choices}>
            <Choice
              label="四人麻雀"
              selected={setup.playerFormat === 'four'}
              onPress={() => setSetup(setPlayerFormat(setup, 'four'))}
            />
            <Choice
              label="三人麻雀"
              selected={setup.playerFormat === 'three'}
              onPress={() => setSetup(setPlayerFormat(setup, 'three'))}
            />
          </ThemedView>

          <ThemedView style={styles.choices}>
            <Choice
              label="全銃"
              selected={setup.paymentMode === 'full-discard'}
              onPress={() => setSetup(setPaymentMode(setup, 'full-discard'))}
            />
            <Choice
              label="半銃"
              selected={setup.paymentMode === 'half-discard'}
              onPress={() => setSetup(setPaymentMode(setup, 'half-discard'))}
            />
          </ThemedView>

          <Stepper
            label="起糊"
            value={setup.minFan}
            onDecrease={() => setSetup(setFanRange(setup, setup.minFan - 1, setup.maxFan))}
            onIncrease={() => setSetup(setFanRange(setup, setup.minFan + 1, setup.maxFan))}
          />
          <Stepper
            label="滿糊"
            value={setup.maxFan}
            onDecrease={() => setSetup(setFanRange(setup, setup.minFan, setup.maxFan - 1))}
            onIncrease={() => setSetup(setFanRange(setup, setup.minFan, setup.maxFan + 1))}
          />

          <ThemedText type="small">自摸倍數</ThemedText>
          <TextInput
            accessibilityLabel="自摸倍數"
            defaultValue={formatMultiplier(setup.multiplier)}
            key="multiplier"
            onBlur={() => {
              const text = drafts.current.multiplier;
              if (text === undefined) return;
              commitExact(text, true, (next) => setSetup(setMultiplier(setup, next)), setup.multiplier);
            }}
            onChangeText={(text) => {
              drafts.current.multiplier = text;
              commitExact(text, false, (next) => setSetup(setMultiplier(setup, next)), setup.multiplier);
            }}
            style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
          />
          <ThemedText type="small">{`×${formatMultiplier(setup.multiplier)}`}</ThemedText>

          <Choice
            label={setup.jackpotEnabled ? 'Jackpot 啟用' : 'Jackpot 關閉'}
            selected={setup.jackpotEnabled}
            onPress={() => setSetup(setJackpotEnabled(setup, !setup.jackpotEnabled))}
          />
          {setup.jackpotEnabled ? (
            <>
              <ThemedText type="small">流局時每位玩家須付彩池</ThemedText>
              <TextInput
                accessibilityLabel="流局時每位玩家須付彩池"
                defaultValue={setup.jackpotContribution}
                key="pool"
                onBlur={() => {
                  const text = drafts.current.pool;
                  if (text === undefined) return;
                  commitExact(text, true, (next) => setSetup(setJackpotContribution(setup, next)), setup.jackpotContribution);
                }}
                onChangeText={(text) => {
                  drafts.current.pool = text;
                  commitExact(text, false, (next) => setSetup(setJackpotContribution(setup, next)), setup.jackpotContribution);
                }}
                style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
              />
            </>
          ) : null}

          <Choice
            label={setup.trackDealer ? '紀錄莊家及圈風 開' : '紀錄莊家及圈風 關'}
            selected={setup.trackDealer}
            onPress={() => setSetup(setTrackDealer(setup, !setup.trackDealer))}
          />
          {setup.trackDealer ? (
            <Choice
              label={setup.passDealerOnDraw ? '流局時過莊 開' : '流局時過莊 關'}
              selected={setup.passDealerOnDraw}
              onPress={() => setSetup(setPassDealerOnDraw(setup, !setup.passDealerOnDraw))}
            />
          ) : null}

          <ThemedView style={styles.tableHead}>
            <ThemedText type="small">番</ThemedText>
            <ThemedText type="small">食糊分數</ThemedText>
            <ThemedText type="small">自摸分數</ThemedText>
          </ThemedView>
          {setup.rows.map((row) => (
            <ThemedView key={row.fan} style={styles.tableRow}>
              <ThemedText>{row.fan}</ThemedText>
              <TextInput
                accessibilityLabel={`${row.fan}番食糊分數`}
                defaultValue={row.ordinary === null ? '' : formatAmount(row.ordinary)}
                key={row.fan}
                onBlur={() => {
                  const text = drafts.current[row.fan];
                  if (text === undefined) return;
                  commitOrdinary(row.fan, row.ordinary, text, true);
                }}
                onChangeText={(text) => {
                  drafts.current[row.fan] = text;
                  commitOrdinary(row.fan, row.ordinary, text, false);
                }}
                placeholder="未有紀錄"
                placeholderTextColor={theme.textSecondary}
                style={[styles.cell, { color: theme.text, borderColor: theme.textSecondary }]}
              />
              <ThemedText>{formatAmount(selfDrawAmount(setup, row.fan))}</ThemedText>
            </ThemedView>
          ))}

          {error ? <ThemedText>{error}</ThemedText> : null}

          <Pressable accessibilityRole="button" onPress={() => setPrompt('abandon')} style={styles.rowButton}>
            <ThemedText>放棄設定</ThemedText>
          </Pressable>
          {kind === 'saved' ? (
            <Pressable accessibilityRole="button" onPress={() => setPrompt('delete')} style={styles.rowButton}>
              <ThemedText>刪除</ThemedText>
            </Pressable>
          ) : null}
        </ScrollView>
      )}

      {prompt === 'save' ? (
        <PromptBar
          title="儲存此玩法嗎？"
          actions={[
            { label: '取消', onPress: () => setPrompt(null) },
            { label: '直接使用', onPress: useOnce },
            { label: '儲存', onPress: save },
          ]}
        />
      ) : null}
      {prompt === 'abandon' ? (
        <PromptBar
          title="放棄設定嗎?"
          actions={[
            { label: '取消', onPress: () => setPrompt(null) },
            { label: '確定', onPress: () => router.back() },
          ]}
        />
      ) : null}
      {prompt === 'delete' ? (
        <PromptBar
          title="確定刪除嗎?"
          actions={[
            { label: '取消', onPress: () => setPrompt(null) },
            { label: '確定', onPress: remove },
          ]}
        />
      ) : null}
    </ThemedView>
  );
}

function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={styles.rowButton}>
      <ThemedText>{selected ? `${label} · 已選` : label}</ThemedText>
    </Pressable>
  );
}

function Stepper({
  label,
  value,
  onDecrease,
  onIncrease,
}: {
  label: string;
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <ThemedView style={styles.stepper}>
      <ThemedText accessibilityLanguage={APP_LOCALE}>{`${label} ${value}`}</ThemedText>
      <Pressable accessibilityLabel={`${label}減少`} accessibilityRole="button" onPress={onDecrease} style={styles.step}>
        <ThemedText>－</ThemedText>
      </Pressable>
      <Pressable accessibilityLabel={`${label}增加`} accessibilityRole="button" onPress={onIncrease} style={styles.step}>
        <ThemedText>＋</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

function PromptBar({
  title,
  actions,
}: {
  title: string;
  actions: { label: string; onPress: () => void }[];
}) {
  return (
    <ThemedView style={styles.prompt}>
      <ThemedText accessibilityLanguage={APP_LOCALE}>{title}</ThemedText>
      <ThemedView style={styles.choices}>
        {actions.map((action) => (
          <Pressable accessibilityRole="button" key={action.label} onPress={action.onPress} style={styles.rowButton}>
            <ThemedText>{action.label}</ThemedText>
          </Pressable>
        ))}
      </ThemedView>
    </ThemedView>
  );
}

function applyExact(source: string): string | null {
  try {
    return Score.fromString(source.trim()).toExact();
  } catch {
    return null;
  }
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: Spacing.three, gap: Spacing.two, paddingBottom: Spacing.six },
  missing: { padding: Spacing.three },
  input: { minHeight: 48, borderWidth: 1, paddingHorizontal: Spacing.two, fontSize: 18 },
  cell: { minHeight: 44, minWidth: 96, borderWidth: 1, paddingHorizontal: Spacing.two, fontSize: 18 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  rowButton: { minHeight: 48, justifyContent: 'center', paddingHorizontal: Spacing.two },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  step: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  tableHead: { flexDirection: 'row', justifyContent: 'space-between' },
  tableRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  headerButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: Spacing.two },
  prompt: { padding: Spacing.three, gap: Spacing.two },
});
