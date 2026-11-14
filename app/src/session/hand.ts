import { formatAmount, formatMultiplier } from '../rules/setup.ts';
import { Score } from '../score/score.ts';
import { commitBoard, passDealer, retainDealer, seatedPlayerIds } from './session.ts';
import type { DealerMark, Session, Wind } from './types.ts';

export type WinInput = {
  winnerId: string;
  fan: number;
  /** Null selects 自摸. A player id selects that 出銃者. */
  discarderId: string | null;
  /** Further winners on the same discard. Present only for 一炮多響. */
  also?: { playerId: string; fan: number }[];
};

export type WinPreview = {
  kind: 'discard' | 'self-draw' | 'multi';
  fan: number;
  winnerId: string;
  winnerIds: string[];
  discarderId: string | null;
  ordinary: string;
  multiplier: string | null;
  total: string;
  deltas: { playerId: string; delta: string }[];
};

/**
 * 全銃 discard, four-player 半銃 discard, four-player 自摸, and the demonstrated
 * three-player 全銃 ×4/3 自摸. Dealer advance and an unrecorded fan amount are not calculated here.
 */
export function previewWin(session: Session, input: WinInput): WinPreview | null {
  if ((input.also?.length ?? 0) > 0) return multiDiscard(session, input);
  const ordinary = ordinaryAmount(session, input.fan);
  if (!ordinary) return null;
  if (!seatedPlayerIds(session).includes(input.winnerId)) return null;
  if (input.discarderId === null) return selfDraw(session, input, ordinary);
  if (session.rules.paymentMode === 'half-discard') return halfDiscard(session, input, ordinary);
  return fullDiscard(session, input, ordinary);
}

export function formatWinPreview(preview: WinPreview): string[] {
  if (preview.kind === 'multi') {
    return [`${preview.fan}番分數 ${formatAmount(preview.ordinary)}`, `總分 ${formatAmount(preview.total)}`];
  }
  if (preview.kind === 'discard') {
    return [`食糊分數 ${formatAmount(preview.ordinary)}`, `總分 ${formatAmount(preview.total)}`];
  }
  const multiplier = preview.multiplier ?? preview.ordinary;
  return [`${formatAmount(preview.ordinary)} × ${formatMultiplier(multiplier)}`, `總分 ${formatAmount(preview.total)}`];
}

/** Confirms a preview. A dealer win keeps 莊. Anyone else’s win passes 莊. 一炮多響 does not move 莊. */
export function recordWin(session: Session, input: WinInput): Session {
  const preview = previewWin(session, input);
  if (!preview) return session;
  const deltaById = new Map(preview.deltas.map((item) => [item.playerId, item.delta]));
  const players = session.players.map((player) => {
    const delta = deltaById.get(player.id);
    const balance = delta
      ? Score.fromString(player.balance).add(Score.fromString(delta)).toExact()
      : player.balance;
    const winner = preview.winnerIds.includes(player.id);
    const discarder = preview.kind !== 'self-draw' && player.id === preview.discarderId;
    return {
      ...player,
      balance,
      wins: player.wins + (winner ? 1 : 0),
      selfDraws: player.selfDraws + (winner && preview.kind === 'self-draw' ? 1 : 0),
      discards: player.discards + (discarder ? 1 : 0),
    };
  });
  const label = preview.kind === 'multi' ? '一炮多響' : preview.kind === 'self-draw' ? `${preview.fan}番 自摸` : `${preview.fan}番 食糊`;
  const movesDealer = preview.kind !== 'multi' && session.rules.trackDealer && session.dealerId !== null;
  const dealer = !movesDealer
    ? {
        dealerId: session.dealerId,
        dealerMark: session.dealerMark,
        roundWind: session.roundWind,
        seatWind: session.seatWind,
      }
    : preview.winnerId === session.dealerId
      ? retainDealer(session)
      : passDealer(session);
  return commitBoard(session, label, {
    players,
    seats: session.seats,
    dealerId: dealer.dealerId,
    dealerMark: dealer.dealerMark,
    roundWind: dealer.roundWind,
    seatWind: dealer.seatWind,
    handCount: session.handCount + 1,
    pool: session.pool,
  });
}

/**
 * Confirms a 流局. Balances and the Jackpot pool stay as they are; a pool contribution is feature 8.
 * 流局時過莊 on advances 莊 and 圈風. Off, they stay and the dealer badge becomes 冧N.
 */
export function recordDraw(session: Session): Session {
  const tracked = session.rules.trackDealer && session.dealerId !== null;
  const dealer = tracked && session.rules.passDealerOnDraw ? passDealer(session) : holdDraw(session);
  return commitBoard(session, '流局', {
    players: session.players,
    seats: session.seats,
    dealerId: dealer.dealerId,
    dealerMark: dealer.dealerMark,
    roundWind: dealer.roundWind,
    seatWind: dealer.seatWind,
    handCount: session.handCount + 1,
    pool: session.pool,
  });
}

function holdDraw(session: Session): { dealerId: string | null; dealerMark: DealerMark; roundWind: Wind; seatWind: Wind } {
  if (!session.rules.trackDealer || session.dealerId === null) {
    return {
      dealerId: session.dealerId,
      dealerMark: session.dealerMark,
      roundWind: session.roundWind,
      seatWind: session.seatWind,
    };
  }
  const count = session.dealerMark.kind === 'draw' ? session.dealerMark.count + 1 : 1;
  return {
    dealerId: session.dealerId,
    dealerMark: { kind: 'draw', count },
    roundWind: session.roundWind,
    seatWind: session.seatWind,
  };
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
    winnerIds: [input.winnerId],
    deltas: [
      { playerId: input.winnerId, delta: ordinary },
      { playerId: discarderId, delta: negate(Score.fromString(ordinary)) },
    ],
  };
}

/** Four seated players. The winner receives F, the discarder pays F/2, and each other seated player pays F/4. */
function halfDiscard(session: Session, input: WinInput, ordinary: string): WinPreview | null {
  if (session.rules.playerFormat !== 'four' || session.rules.paymentMode !== 'half-discard') return null;
  const discarderId = input.discarderId;
  if (!discarderId || discarderId === input.winnerId) return null;
  const seated = seatedPlayerIds(session);
  if (seated.length !== 4 || !seated.includes(discarderId)) return null;
  const others = seated.filter((id) => id !== input.winnerId && id !== discarderId);
  if (others.length !== 2) return null;
  const amount = Score.fromString(ordinary);
  const half = amount.divide(Score.fromRational(2, 1));
  const quarter = amount.divide(Score.fromRational(4, 1));
  return {
    kind: 'discard',
    fan: input.fan,
    winnerId: input.winnerId,
    discarderId,
    ordinary,
    multiplier: null,
    total: amount.toExact(),
    winnerIds: [input.winnerId],
    deltas: [
      { playerId: input.winnerId, delta: amount.toExact() },
      { playerId: discarderId, delta: negate(half) },
      ...others.map((playerId) => ({ playerId, delta: negate(quarter) })),
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
  const paid = negate(share);
  return {
    kind: 'self-draw',
    fan: input.fan,
    winnerId: input.winnerId,
    discarderId: null,
    ordinary,
    multiplier,
    total: total.toExact(),
    winnerIds: [input.winnerId],
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

function multiDiscard(session: Session, input: WinInput): WinPreview | null {
  if (session.rules.playerFormat !== 'four' || input.discarderId === null) return null;
  const winners = [{ playerId: input.winnerId, fan: input.fan }, ...(input.also ?? [])];
  if (winners.length < 2 || winners.length > 3) return null;
  const winnerIds = winners.map((winner) => winner.playerId);
  if (new Set(winnerIds).size !== winnerIds.length) return null;
  const seated = seatedPlayerIds(session);
  const discarderId = input.discarderId;
  if (!seated.includes(discarderId) || winnerIds.includes(discarderId)) return null;
  if (!winnerIds.every((id) => seated.includes(id))) return null;
  const scored = winners.flatMap((winner) => {
    const ordinary = ordinaryAmount(session, winner.fan);
    return ordinary ? [{ ...winner, ordinary }] : [];
  });
  if (scored.length !== winners.length) return null;
  if (session.rules.paymentMode === 'full-discard') return multiFull(input, discarderId, scored);
  if (session.rules.paymentMode === 'half-discard') return multiHalf(session, input, discarderId, scored);
  return null;
}

function multiFull(
  input: WinInput,
  discarderId: string,
  scored: { playerId: string; fan: number; ordinary: string }[],
): WinPreview {
  const selected = scored.find((winner) => winner.playerId === input.winnerId) ?? scored[0];
  const sum = scored.reduce((total, winner) => total.add(Score.fromString(winner.ordinary)), Score.fromString('0'));
  return {
    kind: 'multi',
    fan: selected.fan,
    winnerId: selected.playerId,
    winnerIds: scored.map((winner) => winner.playerId),
    discarderId,
    ordinary: selected.ordinary,
    multiplier: null,
    total: selected.ordinary,
    deltas: [
      ...scored.map((winner) => ({ playerId: winner.playerId, delta: winner.ordinary })),
      { playerId: discarderId, delta: negate(sum) },
    ],
  };
}

function multiHalf(
  session: Session,
  input: WinInput,
  discarderId: string,
  scored: { playerId: string; fan: number; ordinary: string }[],
): WinPreview | null {
  if (scored.length !== 2) return null;
  const seated = seatedPlayerIds(session);
  if (seated.length !== 4) return null;
  const other = seated.find((id) => id !== scored[0]?.playerId && id !== scored[1]?.playerId && id !== discarderId);
  const first = scored[0];
  const second = scored[1];
  if (!other || !first || !second) return null;
  const firstAmount = Score.fromString(first.ordinary);
  const secondAmount = Score.fromString(second.ordinary);
  const sum = firstAmount.add(secondAmount);
  const nets = [firstAmount.subtract(quarter(secondAmount)), secondAmount.subtract(quarter(firstAmount))];
  const selectedIndex = second.playerId === input.winnerId ? 1 : 0;
  const selected = selectedIndex === 1 ? second : first;
  return {
    kind: 'multi',
    fan: selected.fan,
    winnerId: selected.playerId,
    winnerIds: [first.playerId, second.playerId],
    discarderId,
    ordinary: selected.ordinary,
    multiplier: null,
    total: nets[selectedIndex].toExact(),
    deltas: [
      { playerId: first.playerId, delta: nets[0].toExact() },
      { playerId: second.playerId, delta: nets[1].toExact() },
      { playerId: discarderId, delta: negate(sum.divide(Score.fromRational(2, 1))) },
      { playerId: other, delta: negate(quarter(sum)) },
    ],
  };
}

function quarter(score: Score): Score {
  return score.divide(Score.fromRational(4, 1));
}

function negate(score: Score): string {
  return score.multiply(Score.fromString('-1')).toExact();
}

function ordinaryAmount(session: Session, fan: number): string | null {
  if (!Number.isInteger(fan)) return null;
  return session.rules.rows.find((row) => row.fan === fan)?.ordinary ?? null;
}
