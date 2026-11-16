import { FanRange } from "@/components/fan-range";

import { NumberField as TextInput } from "@/components/number-field";
import { Action, palette } from "@/components/table-ui";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useRuleRepository } from "@/rules/repository";
import { useSessionRepository } from "@/session/repository";
import { seatCount, stageRules } from "@/session/session";
import { Score } from "@/score/score";
import {
  createCustomDraft,
  createPresetDraft,
  formatAmount,
  formatMultiplier,
  selfDrawAmount,
  selfDrawShare,
  setFanRange,
  setJackpotContribution,
  setJackpotEnabled,
  missingHighFans,
  prepareRuleName,
  setMultiplier,
  setName,
  setOrdinary,
  setPassDealerOnDraw,
  setPaymentMode,
  setPlayerFormat,
  setTrackDealer,
} from "@/rules/setup";
import type { RuleSetup } from "@/rules/types";

type Prompt = "save" | "abandon" | "delete" | "duplicate" | null;

export default function EditRuleSetupScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{
    kind?: string | string[];
    id?: string | string[];
  }>();
  const kind = first(params.kind);
  const id = first(params.id);
  const repo = useRuleRepository();
  const sessions = useSessionRepository();
  const draftKey = `${kind ?? ""}:${id ?? ""}`;
  const [storedKey, setStoredKey] = useState("");
  const [setup, setSetup] = useState<RuleSetup | null>(null);
  const [missing, setMissing] = useState(false);
  const [prompt, setPrompt] = useState<Prompt>(null);
  const [duplicateId, setDuplicateId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const drafts = useRef<Record<string, string>>({});

  if (storedKey !== draftKey) {
    setStoredKey(draftKey);
    setError(null);
    setPrompt(null);
    if (kind === "preset" && id) {
      try {
        setSetup(createPresetDraft(id));
        setMissing(false);
      } catch {
        setSetup(null);
        setMissing(true);
      }
    } else if (kind === "custom") {
      setSetup(createCustomDraft());
      setMissing(false);
    } else if (kind === "saved") {
      setSetup(null);
      setMissing(false);
    } else {
      setSetup(null);
      setMissing(true);
    }
  }

  useEffect(() => {
    if (kind !== "saved" || !id) return;
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
    setError(`請先填 ${missing.join("、")} 番嘅食糊分數`);
    return true;
  }

  function namedSetup(setup: RuleSetup): RuleSetup | null {
    const prepared = prepareRuleName(setup.name);
    if ("error" in prepared) {
      setError(prepared.error);
      return null;
    }
    setError(null);
    return { ...setup, name: prepared.name };
  }

  async function stageOpen(named: RuleSetup): Promise<boolean> {
    const open = await sessions.getOpen();
    if (!open) return true;
    if (seatCount(named) !== seatCount(open.rules)) {
      setError("進行中的牌局不能改人數");
      return false;
    }
    await sessions.saveOpen(stageRules(open, named));
    return true;
  }

  async function useOnce() {
    if (!setup || highFanError(setup)) return;
    const named = namedSetup(setup);
    if (!named) return;
    if (!(await stageOpen(named))) return;
    await repo.setActive(named);
    router.replace("/session/seat");
  }

  async function save(overwriteId?: string) {
    if (!setup || highFanError(setup)) return;
    const named = namedSetup(setup);
    if (!named) return;
    const saved = await repo.listSaved();
    const clash = saved.find(
      (item) =>
        item.name === named.name &&
        item.id !== named.id &&
        item.id !== overwriteId,
    );
    if (!overwriteId && clash) {
      setDuplicateId(clash.id);
      setPrompt("duplicate");
      return;
    }
    const stored = overwriteId ? { ...named, id: overwriteId } : named;
    if (!(await stageOpen(stored))) return;
    await repo.save(stored);
    await repo.setActive(stored);
    router.replace("/session/seat");
  }

  async function remove() {
    if (!setup || kind !== "saved") return;
    await repo.deleteSaved(setup.id);
    router.back();
  }

  function commitExact(
    text: string,
    reportError: boolean,
    apply: (exact: string) => void,
    current: string,
  ) {
    const next = applyExact(text);
    if (next === null) {
      if (reportError) setError("不能用這個分數");
      return;
    }
    if (next === current) return;
    setError(null);
    apply(next);
  }

  function commitOrdinary(
    fan: number,
    current: string | null,
    text: string,
    reportError: boolean,
  ) {
    if (!setup) return;
    const trimmed = text.trim();
    if (trimmed === "") return;
    const next = applyExact(trimmed);
    if (next === null) {
      if (reportError) setError("不能用這個分數");
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
          title: "玩法設定",
          headerLeft: () => (
            <Pressable
              accessibilityRole="button"
              onPress={() => setPrompt("abandon")}
              style={styles.headerButton}
            >
              <ThemedText>返回</ThemedText>
            </Pressable>
          ),
        }}
      />
      <ThemedView
        style={{
          padding: 20,
          flexDirection: "row",
          gap: 16,
          alignItems: "center",
        }}
      >
        <Action label="返回" onPress={() => setPrompt("abandon")} />
        <ThemedText type="subtitle">玩法設定</ThemedText>
      </ThemedView>
      {missing || !setup ? (
        <ThemedText style={styles.missing}>未有自訂玩法</ThemedText>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">揀好玩法，準備開枱</ThemedText>
          <ThemedText themeColor="textSecondary">
            按分數格可直接輸入；確認後再安排玩家入座。
          </ThemedText>
          <ThemedText type="small">玩法名稱</ThemedText>
          <TextInput
            accessibilityLabel="玩法名稱"
            defaultValue={setup.name}
            key={setup.id}
            onChangeText={(text) => setSetup(setName(setup, text))}
            style={[
              styles.input,
              { color: theme.text, borderColor: theme.textSecondary },
            ]}
          />

          <ThemedText type="small">人數</ThemedText>
          <ThemedView style={styles.choices}>
            <Choice
              label="四人麻雀"
              selected={setup.playerFormat === "four"}
              onPress={() => setSetup(setPlayerFormat(setup, "four"))}
            />
            <Choice
              label="三人麻雀"
              selected={setup.playerFormat === "three"}
              onPress={() => setSetup(setPlayerFormat(setup, "three"))}
            />
          </ThemedView>

          <ThemedView style={styles.choices}>
            <Choice
              label="全銃"
              selected={setup.paymentMode === "full-discard"}
              onPress={() => setSetup(setPaymentMode(setup, "full-discard"))}
            />
            <Choice
              label="半銃"
              selected={setup.paymentMode === "half-discard"}
              onPress={() => setSetup(setPaymentMode(setup, "half-discard"))}
            />
          </ThemedView>

          <FanRange
            min={setup.minFan}
            max={setup.maxFan}
            onChange={(min, max) => setSetup(setFanRange(setup, min, max))}
          />
          <ThemedText type="small">自摸倍數</ThemedText>
          <TextInput
            accessibilityLabel="自摸倍數"
            value={setup.multiplier}
            key="multiplier"
            onBlur={() => {
              const text = drafts.current.multiplier;
              if (text === undefined) return;
              commitExact(
                text,
                true,
                (next) => setSetup(setMultiplier(setup, next)),
                setup.multiplier,
              );
            }}
            onChangeText={(text) => {
              drafts.current.multiplier = text;
              commitExact(
                text,
                true,
                (next) => setSetup(setMultiplier(setup, next)),
                setup.multiplier,
              );
            }}
            style={[
              styles.input,
              { color: theme.text, borderColor: theme.textSecondary },
            ]}
          />
          <ThemedText type="small">{`×${formatMultiplier(setup.multiplier)}`}</ThemedText>

          <Choice
            label={setup.jackpotEnabled ? "彩池 啟用" : "彩池 關閉"}
            selected={setup.jackpotEnabled}
            onPress={() =>
              setSetup(setJackpotEnabled(setup, !setup.jackpotEnabled))
            }
          />
          {setup.jackpotEnabled ? (
            <>
              <ThemedText type="small">流局時每位玩家須付彩池</ThemedText>
              <TextInput
                accessibilityLabel="流局時每位玩家須付彩池"
                value={setup.jackpotContribution}
                key="pool"
                onBlur={() => {
                  const text = drafts.current.pool;
                  if (text === undefined) return;
                  commitExact(
                    text,
                    true,
                    (next) => setSetup(setJackpotContribution(setup, next)),
                    setup.jackpotContribution,
                  );
                }}
                onChangeText={(text) => {
                  drafts.current.pool = text;
                  commitExact(
                    text,
                    true,
                    (next) => setSetup(setJackpotContribution(setup, next)),
                    setup.jackpotContribution,
                  );
                }}
                style={[
                  styles.input,
                  { color: theme.text, borderColor: theme.textSecondary },
                ]}
              />
            </>
          ) : null}

          <Choice
            label={
              setup.trackDealer ? "紀錄莊家及圈風 開" : "紀錄莊家及圈風 關"
            }
            selected={setup.trackDealer}
            onPress={() => setSetup(setTrackDealer(setup, !setup.trackDealer))}
          />
          {setup.trackDealer ? (
            <Choice
              label={setup.passDealerOnDraw ? "流局時過莊 開" : "流局時過莊 關"}
              selected={setup.passDealerOnDraw}
              onPress={() =>
                setSetup(setPassDealerOnDraw(setup, !setup.passDealerOnDraw))
              }
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
                value={row.ordinary ?? ""}
                key={row.fan}
                onBlur={() => {
                  const text = drafts.current[row.fan];
                  if (text === undefined) return;
                  commitOrdinary(row.fan, row.ordinary, text, true);
                }}
                onChangeText={(text) => {
                  drafts.current[row.fan] = text;
                  commitOrdinary(row.fan, row.ordinary, text, true);
                }}
                placeholder="未有紀錄"
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.cell,
                  { color: theme.text, borderColor: theme.textSecondary },
                ]}
              />
              <ThemedView>
                <ThemedText>
                  {formatAmount(selfDrawAmount(setup, row.fan))}
                </ThemedText>
                {setup.playerFormat === "three" &&
                selfDrawShare(setup, row.fan) ? (
                  <ThemedText type="small">{`每人 ${formatAmount(selfDrawShare(setup, row.fan))}`}</ThemedText>
                ) : null}
              </ThemedView>
            </ThemedView>
          ))}

          {error ? <ThemedText>{error}</ThemedText> : null}

          <Pressable
            accessibilityRole="button"
            onPress={() => setPrompt("abandon")}
            style={styles.rowButton}
          >
            <ThemedText>放棄設定</ThemedText>
          </Pressable>
          {kind === "saved" ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setPrompt("delete")}
              style={styles.rowButton}
            >
              <ThemedText>刪除</ThemedText>
            </Pressable>
          ) : null}
        </ScrollView>
      )}

      {setup && !prompt ? (
        <ThemedView style={styles.prompt}>
          <Action label="確認玩法" primary onPress={() => setPrompt("save")} />
        </ThemedView>
      ) : null}
      {prompt === "save" ? (
        <PromptBar
          onCancel={() => setPrompt(null)}
          title="儲存此玩法嗎？"
          actions={[
            { label: "取消", onPress: () => setPrompt(null) },
            { label: "直接使用", onPress: useOnce },
            { label: "儲存", onPress: () => save() },
          ]}
        />
      ) : null}
      {prompt === "abandon" ? (
        <PromptBar
          onCancel={() => setPrompt(null)}
          title="放棄設定並返回？"
          actions={[
            { label: "取消", onPress: () => setPrompt(null) },
            {
              label: "確定",
              onPress: () =>
                router.canGoBack()
                  ? router.back()
                  : router.replace("/rules/hong-kong"),
            },
          ]}
        />
      ) : null}
      {prompt === "duplicate" ? (
        <PromptBar
          onCancel={() => setPrompt(null)}
          title="已有同名玩法。覆寫原玩法，定係另存？"
          actions={[
            { label: "取消", onPress: () => setPrompt(null) },
            {
              label: "另存",
              onPress: () => {
                setPrompt(null);
                setError("請改一個未用過嘅名稱");
              },
            },
            { label: "覆寫", onPress: () => save(duplicateId ?? undefined) },
          ]}
        />
      ) : null}
      {prompt === "delete" ? (
        <PromptBar
          onCancel={() => setPrompt(null)}
          title="確定刪除嗎?"
          actions={[
            { label: "取消", onPress: () => setPrompt(null) },
            { label: "確定", onPress: remove },
          ]}
        />
      ) : null}
    </ThemedView>
  );
}

function Choice({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return <Action label={label} selected={selected} onPress={onPress} />;
}

function PromptBar({
  title,
  actions,
  onCancel,
}: {
  onCancel: () => void;
  title: string;
  actions: { label: string; onPress: () => void }[];
}) {
  return (
    <Modal transparent animationType="fade" visible onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View accessibilityViewIsModal style={styles.dialog}>
          <ThemedText type="subtitle">{title}</ThemedText>
          <View style={styles.choices}>
            {actions.map((action, index) => (
              <Action
                key={action.label}
                label={action.label}
                onPress={action.onPress}
                primary={index === actions.length - 1}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
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
  overlay: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  dialog: {
    padding: 24,
    gap: 24,
    borderRadius: 20,
    backgroundColor: palette.surface,
  },
  content: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    padding: 20,
    gap: 16,
    paddingBottom: 64,
  },
  missing: { padding: Spacing.three },
  input: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    fontSize: 18,
  },
  cell: {
    borderRadius: 8,
    minHeight: 48,
    minWidth: 96,
    borderWidth: 1,
    paddingHorizontal: Spacing.two,
    fontSize: 18,
  },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.two },
  rowButton: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: Spacing.two,
  },
  stepper: { flexDirection: "row", alignItems: "center", gap: Spacing.two },
  step: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  tableHead: { flexDirection: "row", justifyContent: "space-between" },
  tableRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: palette.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  headerButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: Spacing.two,
  },
  prompt: {
    padding: 24,
    paddingBottom: 32,
    gap: 16,
    backgroundColor: palette.surface,
    borderTopWidth: 1,
    borderColor: palette.line,
  },
});
