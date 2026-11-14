import { formatAmount, formatMultiplier } from '../rules/setup.ts';
import { Score } from '../score/score.ts';
import { commitBoard, seatedPlayerIds } from './session.ts';
import type { Session } from './types.ts';

export type WinInput = {
  winnerId: string;
  fan: number;
  /** Null selects 自摸. A player id selects that 出銃者. */
  discarderId: string | null;
};

export type WinPreview = {
  kind: 'discard' | 'self-draw';
  fan: number;
  winnerId: string;
  discarderId: string | null;
  ordinary: string;
  multiplier: string | null;
  total: string;
  deltas: { playerId: string; delta: string }[];
};

/**
 * 全銃 discard, four-player 自摸, and the demonstrated three-player 全銃 ×4/3 自摸.
 * 半銃 discard splits, dealer advance, and an unrecorded fan amount are not calculated here.
 */
export function previewWin(session: Session, input: WinInput): WinPreview | null {
  const ordinary = ordinaryAmount(session, input.fan);
  if (!ordinary) return null;
  if (!seatedPlayerIds(session).includes(input.winnerId)) return null;
  if (input.discarderId === null) return selfDraw(session, input, ordinary);
  return fullDiscard(session, input, ordinary);
}

export function formatWinPreview(preview: WinPreview): string[] {
  if (preview.kind === 'discard') {
    return [`食糊分數 ${formatAmount(preview.ordinary)}`, `總分 ${formatAmount(preview.total)}`];
  }
  const multiplier = preview.multiplier ?? preview.ordinary;
  return [`${formatAmount(preview.ordinary)} × ${formatMultiplier(multiplier)}`, `總分 ${formatAmount(preview.total)}`];
}

/** Confirms a preview. 莊, 圈風, and the Jackpot pool stay as they are. */
export function recordWin(session: Session, input: WinInput): Session {
  const preview = previewWin(session, input);
  if (!preview) return session;
  const deltaById = new Map(preview.deltas.map((item) => [item.playerId, item.delta]));
  const players = session.players.map((player) => {
    const delta = deltaById.get(player.id);
    const balance = delta
      ? Score.fromString(player.balance).add(Score.fromString(delta)).toExact()
      : player.balance;
    const winner = player.id === preview.winnerId;
    const discarder = preview.kind === 'discard' && player.id === preview.discarderId;
    return {
      ...player,
      balance,
      wins: player.wins + (winner ? 1 : 0),
      selfDraws: player.selfDraws + (winner && preview.kind === 'self-draw' ? 1 : 0),
      discards: player.discards + (discarder ? 1 : 0),
    };
  });
  const label = preview.kind === 'self-draw' ? `${preview.fan}番 自摸` : `${preview.fan}番 食糊`;
  return commitBoard(session, label, {
    players,
    seats: session.seats,
    dealerId: session.dealerId,
    dealerMark: session.dealerMark,
    roundWind: session.roundWind,
    seatWind: session.seatWind,
    handCount: session.handCount + 1,
    pool: session.pool,
  });
}

function fullDiscard(session: Session, input: WinInput, ordinary: string): WinPreview | null {
  if (session.rules.paymentMode !== 'full-discard') return null;
  const discarderId = input.discarderId;
  if (!discarderId || discarderId === input.winnerId) return null;
  if (!seatedPlayerIds(session).includes(discarderId)) return null;
  return {
    kind: 'discard',
    fan: input.fan,
    winnerId: input.winnerId,
    discarderId,
    ordinary,
    multiplier: null,
    total: ordinary,
    deltas: [
      { playerId: input.winnerId, delta: ordinary },
      { playerId: discarderId, delta: Score.fromString(ordinary).multiply(Score.fromString('-1')).toExact() },
    ],
  };
}

function selfDraw(session: Session, input: WinInput, ordinary: string): WinPreview | null {
  const opponents = seatedPlayerIds(session).filter((id) => id !== input.winnerId);
  const payers = selfDrawPayers(session, opponents.length);
  if (payers === null) return null;
  const multiplier = session.rules.multiplier;
  const total = Score.fromString(ordinary).multiply(Score.fromString(multiplier));
  const share = total.divide(Score.fromRational(payers, 1));
  const paid = share.multiply(Score.fromString('-1')).toExact();
  return {
    kind: 'self-draw',
    fan: input.fan,
    winnerId: input.winnerId,
    discarderId: null,
    ordinary,
    multiplier,
    total: total.toExact(),
    deltas: [
      { playerId: input.winnerId, delta: total.toExact() },
      ...opponents.map((playerId) => ({ playerId, delta: paid })),
    ],
  };
}

function selfDrawPayers(session: Session, opponents: number): number | null {
  if (session.rules.playerFormat === 'four' && opponents === 3) return 3;
  if (
    session.rules.playerFormat === 'three' &&
    session.rules.paymentMode === 'full-discard' &&
    session.rules.multiplier === '4/3' &&
    opponents === 2
  ) {
    return 2;
  }
  return null;
}

function ordinaryAmount(session: Session, fan: number): string | null {
  if (!Number.isInteger(fan)) return null;
  return session.rules.rows.find((row) => row.fan === fan)?.ordinary ?? null;
}
