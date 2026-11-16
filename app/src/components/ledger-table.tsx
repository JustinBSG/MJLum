import type { Session } from "@/session/types";
import type { LedgerEmphasis } from "@/session/session";
import { formatWind, formatBalance } from "@/session/session";
import { Score } from "@/score/score";
import { DataTable } from "./data-table";
export function LedgerTable({
  session,
  mode = "combined",
  reverse = false,
}: {
  session: Session;
  mode?: LedgerEmphasis;
  reverse?: boolean;
}) {
  const players = session.players;
  const hands = session.ledger.map((entry, i) => ({
    entry,
    i,
    after: session.ledger[i + 1]?.before ?? session,
  }));
  if (reverse) hands.reverse();
  const heads = [
    "手次",
    "進度",
    ...(mode !== "scores" ? ["事件", "食糊玩家"] : []),
    ...(mode !== "events" ? players.map((p) => p.name) : []),
  ];
  const rows = hands.map(({ entry, i, after }) => {
    const a = entry.action;
    const names =
      a?.type === "win"
        ? [a.input.winnerId, ...(a.input.also ?? []).map((w) => w.playerId)]
            .map((id) => players.find((p) => p.id === id)?.name ?? "—")
            .join("、")
        : "—";
    return [
      i + 1,
      formatWind(entry.before.roundWind, entry.before.seatWind),
      ...(mode !== "scores"
        ? [entry.label.replaceAll("Jackpot", "彩池"), names]
        : []),
      ...(mode !== "events"
        ? players.map((p) =>
            formatBalance(
              Score.fromString(
                after.players.find((x) => x.id === p.id)?.balance ?? "0",
              )
                .subtract(
                  Score.fromString(
                    entry.before.players.find((x) => x.id === p.id)?.balance ??
                      "0",
                  ),
                )
                .toExact(),
            ),
          )
        : []),
    ];
  });
  return (
    <DataTable
      headers={heads}
      rows={rows}
      widths={[
        56,
        100,
        ...(mode !== "scores" ? [124, 96] : []),
        ...(mode !== "events" ? players.map(() => 80) : []),
      ]}
    />
  );
}
