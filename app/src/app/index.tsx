import { router, useFocusEffect, type Href } from "expo-router";
import { useCallback, useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { ScrollView, StyleSheet, View, Modal } from "react-native";
import {
  CirclePlus,
  History,
  Settings2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react-native";

import { Action, MenuRow, palette } from "@/components/table-ui";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { ui } from "@/locale";
import { useRuleRepository } from "@/rules/repository";
import { useSessionRepository } from "@/session/repository";

export default function HomeScreen() {
  const rules = useRuleRepository();
  const sessions = useSessionRepository();
  const [clearPrompt, setClearPrompt] = useState(false);
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [hasRules, setHasRules] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let live = true;
      Promise.all([sessions.getOpen(), rules.getActive()]).then(
        ([open, active]) => {
          if (!live) return;
          setHasSession(open !== null);
          setHasRules(active !== null);
          setReady(true);
        },
      );
      return () => {
        live = false;
      };
    }, [rules, sessions]),
  );

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.brand}>
          <BrandMark size={44} />
          <ThemedText style={{ fontWeight: "700", fontSize: 20 }}>
            {ui.appName}
          </ThemedText>
        </View>
        <View style={styles.hero}>
          <ThemedText themeColor="textSecondary">香港麻雀・牌桌計分</ThemedText>
          <ThemedText type="title">好好打牌，{"\n"}記分交畀麻雀諗。</ThemedText>
          <ThemedText themeColor="textSecondary">
            開局、記分、找數。每一手都清清楚楚。
          </ThemedText>
        </View>
        <ThemedView style={styles.card}>
          <View style={styles.brand}>
            <CirclePlus aria-hidden size={24} color={palette.primary} />
            <ThemedText type="subtitle">
              {hasSession ? "牌局進行中" : "準備開枱"}
            </ThemedText>
          </View>
          <ThemedText themeColor="textSecondary">
            {hasSession
              ? "返回牌桌，繼續記錄下一手。"
              : "先揀玩法，再邀請三位或四位玩家入座。"}
          </ThemedText>
          {hasSession ? (
            <Action
              label="清除現局並開新局"
              onPress={() => setClearPrompt(true)}
            />
          ) : null}
          <Action
            primary
            icon={ArrowRight}
            disabled={!ready}
            label={!ready ? "讀取牌局中" : hasSession ? "繼續牌局" : "開始牌局"}
            onPress={() =>
              router.push(
                (hasSession
                  ? "/session"
                  : hasRules
                    ? "/session/seat"
                    : "/rules/hong-kong") as Href,
              )
            }
          />
        </ThemedView>
        <MenuRow
          title="玩法設定"
          description="番數、派彩方式及彩池"
          icon={Settings2}
          onPress={() => router.push("/rules/hong-kong" as Href)}
        />
        <MenuRow
          title="牌局紀錄"
          description="查看儲存在這部裝置嘅牌局"
          icon={History}
          onPress={() => router.push("/history" as Href)}
        />
        <View style={styles.footer}>
          <ShieldCheck aria-hidden size={18} color={palette.muted} />
          <ThemedText type="small" themeColor="textSecondary">
            毋須登入・紀錄只留在此裝置
          </ThemedText>
        </View>
      </ScrollView>
      <Modal
        visible={clearPrompt}
        transparent
        animationType="fade"
        onRequestClose={() => setClearPrompt(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(15,23,42,0.5)",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <View
            style={{
              padding: 24,
              gap: 20,
              borderRadius: 20,
              backgroundColor: palette.surface,
            }}
          >
            <ThemedText type="subtitle">清除現時牌局？</ThemedText>
            <ThemedText>
              目前牌局及彩池將會移除，不能還原。過往紀錄不受影響。
            </ThemedText>
            <Action label="取消" onPress={() => setClearPrompt(false)} />
            <Action
              label="清除並開新局"
              primary
              onPress={async () => {
                await sessions.clearOpen();
                setClearPrompt(false);
                setHasSession(false);
                router.push("/rules/hong-kong");
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  container: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    padding: 24,
    gap: 16,
    paddingBottom: 48,
  },
  brand: { flexDirection: "row", gap: 12, alignItems: "center" },
  hero: { paddingVertical: 32, gap: 16 },
  card: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 20,
    padding: 24,
    gap: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingTop: 16,
  },
});
