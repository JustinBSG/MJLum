import { formatAmount, formatMultiplier } from '../rules/setup.ts';
import type { RuleSetup } from '../rules/types.ts';
import { Score } from '../score/score.ts';
import { applyPendingRules, commitBoard, passDealer, retainDealer, seatedPlayerIds } from './session.ts';
import type { DealerMark, Player, Session, Wind } from './types.ts';

export type WinInput = {
  winnerId: string;
  fan: number;
  /** Null selects 自摸. A player id selects that 出銃者. */
  discarderId: string | null;
  /** Further winners on the same discard. Present only for 一炮多響. */
  also?: { playerId: string; fan: number }[];
  /** 詐糊. winnerId is the player who declared the false win. */
  falseWin?: boolean;
  /** 詐糊賠位自摸. Each other seated player receives the ordinary amount × 自摸倍數. */
  falseWinAsSelfDraw?: boolean;
  /** 出銃者包自摸. The selected 出銃者 alone pays the self-draw total. */
  discarderPaysSelfDraw?: boolean;
  /** 出銃者包輸. The selected 出銃者 alone pays the ordinary amount. Not combined with 包自摸. */
  discarderPaysLoss?: boolean;
  /** 贏取Jackpot. The current pool is added to the single winner and then emptied. */
  takeJackpot?: boolean;
  /** 例牌. Score this hand at 滿糊. Do not combine it with 詐糊 or 一炮多響. */
  limitHand?: boolean;
};

export type WinPreview = {
  kind: 'discard' | 'self-draw' | 'multi' | 'false-win';
  limitHand?: boolean;
  fan: number;
  winnerId: string;
  winnerIds: string[];
  discarderId: string | null;
  ordinary: string;
  multiplier: string | null;
  total: string;
  /** Pool added to the winner. Present only when 贏取Jackpot applies. The pool is then emptied. */
  jackpot?: string;
  deltas: { playerId: string; delta: string }[];
  /** Present when the typed fan is above 滿糊 and the amount uses 滿糊. */
  scoringFan?: number;
};

/**
 * 全銃 discard, four-player 半銃 discard, four-player 自摸, the demonstrated
 * three-player 全銃 ×4/3 自摸, a four-player 詐糊, and the two 出銃者包 toggles.
 * An unrecorded fan amount is not calculated here.
 */
export function previewWin(session: Session, input: WinInput): WinPreview | null {
  const preview = previewHand(session, input);
  if (!preview) return null;
  const scored = scoringFan(session.rules, preview.fan);
  return awardJackpot(session, input, scored === preview.fan ? preview : { ...preview, scoringFan: scored });
}

/** A typed fan below 起糊 cannot become a scored hand. */
export function winRefusal(rules: RuleSetup, fans: number[]): string | null {
  if (fans.some((fan) => Number.isInteger(fan) && fan < rules.minFan)) return '番數不足';
  return null;
}

export function scoringFan(rules: RuleSetup, fan: number): number {
  if (!Number.isInteger(fan)) return fan;
  return fan > rules.maxFan ? rules.maxFan : fan;
}

function previewHand(session: Session, input: WinInput): WinPreview | null {
  if (input.discarderPaysSelfDraw && input.discarderPaysLoss) return null;
  if (input.limitHand && (input.falseWin || (input.also?.length ?? 0) > 0)) return null;
  const source = input.limitHand ? { ...input, fan: session.rules.maxFan } : input;
  const preview = scoreHand(session, source);
  if (!preview || !input.limitHand) return preview;
  return { ...preview, limitHand: true };
}

function scoreHand(session: Session, input: WinInput): WinPreview | null {
  if (input.falseWin) {
    if (input.discarderPaysSelfDraw || input.discarderPaysLoss) return null;
    return falseWin(session, input);
  }
  if ((input.also?.length ?? 0) > 0) {
    if (input.discarderPaysSelfDraw || input.discarderPaysLoss) return null;
    return multiDiscard(session, input);
  }
  const ordinary = ordinaryAmount(session, input.fan);
  if (!ordinary) return null;
  if (!seatedPlayerIds(session).includes(input.winnerId)) return null;
  if (input.discarderId === null) return selfDraw(session, input, ordinary);
  if (input.discarderPaysSelfDraw) return discarderCoversSelfDraw(session, input, ordinary);
  if (input.discarderPaysLoss) return discarderCoversLoss(session, input, ordinary);
  if (session.rules.paymentMode === 'half-discard') return halfDiscard(session, input, ordinary);
  return fullDiscard(session, input, ordinary);
}

/**
 * 贏取Jackpot adds the current pool to one winner. The other players do not pay it.
 * A 詐糊 or 一炮多響 award was not recorded.
 */
function awardJackpot(session: Session, input: WinInput, preview: WinPreview | null): WinPreview | null {
  if (!preview || !input.takeJackpot || !session.rules.jackpotEnabled) return preview;
  if (preview.kind === 'false-win' || preview.kind === 'multi' || preview.winnerIds.length !== 1) return null;
  const winnerId = preview.winnerIds[0];
  if (!winnerId) return null;
  const pool = session.pool;
  return {
    ...preview,
    jackpot: pool,
    total: Score.fromString(preview.total).add(Score.fromString(pool)).toExact(),
    deltas: preview.deltas.map((item) =>
      item.playerId === winnerId
        ? { ...item, delta: Score.fromString(item.delta).add(Score.fromString(pool)).toExact() }
        : item,
    ),
  };
}

export function formatWinPreview(preview: WinPreview): string[] {
  const lines = formatWinBody(preview);
  if (preview.scoringFan !== undefined && preview.scoringFan !== preview.fan) {
    return [`按${preview.scoringFan}番計`, ...lines];
  }
  return lines;
}

function formatWinBody(preview: WinPreview): string[] {
  if (preview.kind === 'false-win') return formatFalseWin(preview);
  if (preview.kind === 'multi') {
    return [`${preview.fan}番分數 ${formatAmount(preview.ordinary)}`, `總分 ${formatAmount(preview.total)}`];
  }
  if (preview.kind === 'discard') {
    return [`食糊分數 ${formatAmount(preview.ordinary)}${jackpotLabel(preview)}`, `總分 ${formatAmount(preview.total)}`];
  }
  const multiplier = preview.multiplier ?? preview.ordinary;
  return [
    `${formatAmount(preview.ordinary)} × ${formatMultiplier(multiplier)}${jackpotLabel(preview)}`,
    `總分 ${formatAmount(preview.total)}`,
  ];
}

function jackpotLabel(preview: WinPreview): string {
  return preview.jackpot === undefined ? '' : ` + Jackpot ${formatAmount(preview.jackpot)}`;
}

function billTarget(players: Player[], playerId: string): string {
  const player = players.find((item) => item.id === playerId);
  if (player?.billToId && players.some((item) => item.id === player.billToId)) return player.billToId;
  return playerId;
}

function addMoney(players: Player[], playerId: string, delta: Score): Player[] {
  const target = billTarget(players, playerId);
  return players.map((player) =>
    player.id === target ? { ...player, balance: Score.fromString(player.balance).add(delta).toExact() } : player,
  );
}

/** Confirms a preview. A dealer win keeps 莊. Anyone else’s win passes 莊. 一炮多響 keeps 莊 only when the dealer is one of the winners. */
export function recordWin(session: Session, input: WinInput): Session {
  const ready = applyPendingRules(session);
  const preview = previewWin(ready, input);
  if (!preview) return session;
  const counting = preview.kind !== 'false-win';
  const seated = new Set(seatedPlayerIds(ready));
  const fanByWinner = new Map<string, number>();
  if (counting) {
    fanByWinner.set(input.winnerId, preview.limitHand ? preview.fan : scoringFan(ready.rules, input.fan));
    for (const extra of input.also ?? []) fanByWinner.set(extra.playerId, scoringFan(ready.rules, extra.fan));
  }
  let lossFan = 0;
  for (const fan of fanByWinner.values()) lossFan += fan;
  let players = ready.players.map((player) => {
    const winner = counting && preview.winnerIds.includes(player.id);
    const discarder = counting && preview.kind !== 'self-draw' && player.id === preview.discarderId;
    return {
      ...player,
      wins: player.wins + (winner ? 1 : 0),
      selfDraws: player.selfDraws + (winner && preview.kind === 'self-draw' ? 1 : 0),
      discards: player.discards + (discarder ? 1 : 0),
      hands: player.hands + (counting && seated.has(player.id) ? 1 : 0),
      fanSum: player.fanSum + (winner ? (fanByWinner.get(player.id) ?? 0) : 0),
      discardFanSum: player.discardFanSum + (discarder ? lossFan : 0),
    };
  });
  for (const item of preview.deltas) players = addMoney(players, item.playerId, Score.fromString(item.delta));
  const limit = preview.limitHand ? '例牌 ' : '';
  const label =
    preview.kind === 'false-win'
      ? `${preview.fan}番 詐糊`
      : preview.kind === 'multi'
        ? '一炮多響'
        : preview.kind === 'self-draw'
          ? `${preview.fan}番 ${limit}自摸`
          : `${preview.fan}番 ${limit}食糊`;
  const dealer = dealerAfter(ready, preview);
  return commitBoard(ready, label, {
    players: noteRetention(players, ready, dealer.dealerId, retainsDealer(ready, preview)),
    seats: ready.seats,
    dealerId: dealer.dealerId,
    dealerMark: dealer.dealerMark,
    roundWind: dealer.roundWind,
    seatWind: dealer.seatWind,
    handCount: ready.handCount + 1,
    pool: preview.jackpot === undefined ? ready.pool : '0',
  }, { type: 'win', input });
}

/**
 * Confirms a 流局. 流局時過莊 on advances 莊 and 圈風. Off, they stay and the dealer badge becomes 冧N.
 * When Jackpot is on, each seated player pays 流局時每位玩家須付彩池 into the pool.
 */
export function recordDraw(session: Session): Session {
  const ready = applyPendingRules(session);
  const tracked = ready.rules.trackDealer && ready.dealerId !== null;
  const dealer = tracked && ready.rules.passDealerOnDraw ? passDealer(ready) : holdDraw(ready);
  const contribution = drawContribution(ready);
  const seated = new Set(seatedPlayerIds(ready));
  const played = contribution.players.map((player) =>
    seated.has(player.id) ? { ...player, hands: player.hands + 1 } : player,
  );
  return commitBoard(ready, '流局', {
    players: noteRetention(played, ready, dealer.dealerId, tracked && !ready.rules.passDealerOnDraw),
    seats: ready.seats,
    dealerId: dealer.dealerId,
    dealerMark: dealer.dealerMark,
    roundWind: dealer.roundWind,
    seatWind: dealer.seatWind,
    handCount: ready.handCount + 1,
    pool: contribution.pool,
  }, { type: 'draw' });
}

/** Each seated player pays the configured contribution. A player who has left the table does not. */
function drawContribution(session: Session): { players: Session['players']; pool: string } {
  if (!session.rules.jackpotEnabled) return { players: session.players, pool: session.pool };
  const amount = Score.fromString(session.rules.jackpotContribution);
  if (amount.equals(Score.fromString('0'))) return { players: session.players, pool: session.pool };
  const seated = seatedPlayerIds(session);
  let pool = Score.fromString(session.pool);
  let players = session.players;
  for (const playerId of seated) {
    pool = pool.add(amount);
    players = addMoney(players, playerId, Score.fromString('0').subtract(amount));
  }
  return { players, pool: pool.toExact() };
}

/** Players sitting now. Someone who has left the table is not a recipient. */
export function eligibleJackpotIds(session: Session): string[] {
  return seatedPlayerIds(session);
}

/**
 * 平分Jackpot of the whole pool among one or more eligible players.
 * Each share is pool/k. 莊 and 圈風 stay put.
 */
export function splitJackpot(session: Session, playerIds: string[]): Session {
  if (!session.rules.jackpotEnabled) return session;
  const pool = Score.fromString(session.pool);
  if (pool.equals(Score.fromString('0'))) return session;
  const eligible = new Set(eligibleJackpotIds(session));
  const recipients = [...new Set(playerIds)];
  if (recipients.length === 0 || recipients.some((id) => !eligible.has(id))) return session;
  const share = pool.divide(Score.fromRational(recipients.length, 1));
  let players = session.players;
  for (const playerId of recipients) players = addMoney(players, playerId, share);
  return commitBoard(session, '平分Jackpot', {
    players,
    seats: session.seats,
    dealerId: session.dealerId,
    dealerMark: session.dealerMark,
    roundWind: session.roundWind,
    seatWind: session.seatWind,
    handCount: session.handCount,
    pool: '0',
  }, { type: 'jackpot', playerIds: recipients });
}

/** A 詐糊 does not count. A non-dealer 詐糊 still continues the dealer's 留莊. */
function retainsDealer(session: Session, preview: WinPreview): boolean {
  if (!session.rules.trackDealer || session.dealerId === null) return false;
  if (preview.kind === 'false-win') return preview.winnerId !== session.dealerId;
  if (preview.kind === 'multi') return preview.winnerIds.includes(session.dealerId);
  return preview.winnerId === session.dealerId;
}

function noteRetention(
  players: Session['players'],
  session: Session,
  nextDealerId: string | null,
  retain: boolean,
): Session['players'] {
  const dealerId = session.dealerId;
  if (!session.rules.trackDealer || dealerId === null) return players;
  if (retain && nextDealerId === dealerId) {
    return players.map((player) => {
      if (player.id !== dealerId) return player;
      const dealerStreak = player.dealerStreak + 1;
      return {
        ...player,
        dealerStreak,
        bestDealerStreak: Math.max(player.bestDealerStreak, dealerStreak),
      };
    });
  }
  if (nextDealerId !== dealerId) {
    return players.map((player) =>
      player.id === dealerId || player.id === nextDealerId ? { ...player, dealerStreak: 0 } : player,
    );
  }
  return players;
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

/**
 * Four seated players. 詐糊賠位自摸 off: the false-win player pays the ordinary
 * amount to each other seated player. On: that payment is × 自摸倍數.
 * A dealer 詐糊 passes 莊. A non-dealer 詐糊 does not move 莊; that progression
 * was not recorded.
 */
function falseWin(session: Session, input: WinInput): WinPreview | null {
  if ((input.also?.length ?? 0) > 0) return null;
  const seatLimit = seatLimitOf(session);
  if (seatLimit === 0) return null;
  const ordinary = ordinaryAmount(session, input.fan);
  if (!ordinary) return null;
  const seated = seatedPlayerIds(session);
  if (seated.length !== seatLimit || !seated.includes(input.winnerId)) return null;
  const opponents = seated.filter((id) => id !== input.winnerId);
  if (opponents.length !== seatLimit - 1) return null;
  const multiplier = input.falseWinAsSelfDraw ? session.rules.multiplier : null;
  const perPlayer = multiplier ? Score.fromString(ordinary).multiply(Score.fromString(multiplier)) : Score.fromString(ordinary);
  const total = perPlayer.multiply(Score.fromRational(opponents.length, 1));
  return {
    kind: 'false-win',
    fan: input.fan,
    winnerId: input.winnerId,
    winnerIds: [],
    discarderId: null,
    ordinary,
    multiplier,
    total: total.toExact(),
    deltas: [
      { playerId: input.winnerId, delta: negate(total) },
      ...opponents.map((playerId) => ({ playerId, delta: perPlayer.toExact() })),
    ],
  };
}

function formatFalseWin(preview: WinPreview): string[] {
  const loss = formatAmount(negate(Score.fromString(preview.ordinary)));
  const total = formatAmount(negate(Score.fromString(preview.total)));
  const opponents = Math.max(preview.deltas.length - 1, 1);
  if (preview.multiplier) {
    return [`${loss} × ${formatMultiplier(preview.multiplier)} × ${opponents}`, `總分 ${total}`];
  }
  return [`${preview.fan}番分數 詐糊 ${loss} ×${opponents}`, `總分 ${total}`];
}

function dealerAfter(session: Session, preview: WinPreview) {
  const unchanged = {
    dealerId: session.dealerId,
    dealerMark: session.dealerMark,
    roundWind: session.roundWind,
    seatWind: session.seatWind,
  };
  if (!session.rules.trackDealer || session.dealerId === null) return unchanged;
  if (preview.kind === 'multi') {
    if (!preview.winnerIds.includes(session.dealerId)) return passDealer(session);
    const count = session.dealerMark.kind === 'consecutive' ? session.dealerMark.count + 1 : 1;
    return {
      dealerId: session.dealerId,
      dealerMark: { kind: 'consecutive', count },
      roundWind: session.roundWind,
      seatWind: session.seatWind,
    };
  }
  if (preview.kind === 'false-win') {
    return preview.winnerId === session.dealerId ? passDealer(session) : unchanged;
  }
  return preview.winnerId === session.dealerId ? retainDealer(session) : passDealer(session);
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

/** Four players: discarder pays F/2 and each other seated player pays F/4. Three players: discarder pays 2F/3 and the other pays F/3. */
function halfDiscard(session: Session, input: WinInput, ordinary: string): WinPreview | null {
  if (session.rules.paymentMode !== 'half-discard') return null;
  const discarderId = input.discarderId;
  if (!discarderId || discarderId === input.winnerId) return null;
  const seated = seatedPlayerIds(session);
  if (!seated.includes(discarderId)) return null;
  const others = seated.filter((id) => id !== input.winnerId && id !== discarderId);
  const amount = Score.fromString(ordinary);
  const four = session.rules.playerFormat === 'four' && seated.length === 4 && others.length === 2;
  const three = session.rules.playerFormat === 'three' && seated.length === 3 && others.length === 1;
  if (!four && !three) return null;
  const discarderShare = four
    ? amount.divide(Score.fromRational(2, 1))
    : amount.multiply(Score.fromRational(2, 1)).divide(Score.fromRational(3, 1));
  const otherShare = four ? amount.divide(Score.fromRational(4, 1)) : amount.divide(Score.fromRational(3, 1));
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
      { playerId: discarderId, delta: negate(discarderShare) },
      ...others.map((playerId) => ({ playerId, delta: negate(otherShare) })),
    ],
  };
}

/**
 * 出銃者包自摸. The named payer alone pays mS, and the other players pay 0.
 * 半銃 does not split this hand. It counts as 自摸. 一炮多響 is not combined with it.
 */
function discarderCoversSelfDraw(session: Session, input: WinInput, ordinary: string): WinPreview | null {
  const seatLimit = seatLimitOf(session);
  const discarderId = input.discarderId;
  if (!discarderId || discarderId === input.winnerId || seatLimit === 0) return null;
  const seated = seatedPlayerIds(session);
  if (seated.length !== seatLimit || !seated.includes(discarderId) || !seated.includes(input.winnerId)) return null;
  const multiplier = session.rules.multiplier;
  const total = Score.fromString(ordinary).multiply(Score.fromString(multiplier));
  return {
    kind: 'self-draw',
    fan: input.fan,
    winnerId: input.winnerId,
    winnerIds: [input.winnerId],
    discarderId,
    ordinary,
    multiplier,
    total: total.toExact(),
    deltas: [
      { playerId: input.winnerId, delta: total.toExact() },
      { playerId: discarderId, delta: negate(total) },
    ],
  };
}

/**
 * 出銃者包輸, with 包自摸 off. The named payer alone pays S, and the other
 * players pay 0. 半銃 does not split this hand. It counts as that player's
 * 出銃. 一炮多響 is not combined with it.
 */
function discarderCoversLoss(session: Session, input: WinInput, ordinary: string): WinPreview | null {
  const seatLimit = seatLimitOf(session);
  const discarderId = input.discarderId;
  if (!discarderId || discarderId === input.winnerId || seatLimit === 0) return null;
  const seated = seatedPlayerIds(session);
  if (seated.length !== seatLimit || !seated.includes(discarderId) || !seated.includes(input.winnerId)) return null;
  return {
    kind: 'discard',
    fan: input.fan,
    winnerId: input.winnerId,
    winnerIds: [input.winnerId],
    discarderId,
    ordinary,
    multiplier: null,
    total: ordinary,
    deltas: [
      { playerId: input.winnerId, delta: ordinary },
      { playerId: discarderId, delta: negate(Score.fromString(ordinary)) },
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

function seatLimitOf(session: Session): number {
  if (session.rules.playerFormat === 'three') return 3;
  if (session.rules.playerFormat === 'four') return 4;
  return 0;
}

function selfDrawPayers(session: Session, opponents: number): number | null {
  if (session.rules.playerFormat === 'four' && opponents === 3) return 3;
  if (session.rules.playerFormat === 'three' && opponents === 2) return 2;
  return null;
}

function multiDiscard(session: Session, input: WinInput): WinPreview | null {
  const seatLimit = session.rules.playerFormat === 'three' ? 3 : session.rules.playerFormat === 'four' ? 4 : 0;
  if (seatLimit === 0 || input.discarderId === null) return null;
  const winners = [{ playerId: input.winnerId, fan: input.fan }, ...(input.also ?? [])];
  const maxWinners = seatLimit - 1;
  if (winners.length < 2 || winners.length > maxWinners) return null;
  const winnerIds = winners.map((winner) => winner.playerId);
  if (new Set(winnerIds).size !== winnerIds.length) return null;
  const seated = seatedPlayerIds(session);
  const discarderId = input.discarderId;
  if (seated.length !== seatLimit || !seated.includes(discarderId) || winnerIds.includes(discarderId)) return null;
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
  const seated = seatedPlayerIds(session);
  const seatCount = seated.length;
  if ((seatCount !== 3 && seatCount !== 4) || scored.length < 2 || scored.length >= seatCount) return null;
  const seats = Score.fromRational(seatCount, 1);
  const sum = scored.reduce((total, winner) => total.add(Score.fromString(winner.ordinary)), Score.fromString('0'));
  const winnerIds = new Set(scored.map((winner) => winner.playerId));
  const bystanders = seated.filter((id) => id !== discarderId && !winnerIds.has(id));
  const selected = scored.find((winner) => winner.playerId === input.winnerId) ?? scored[0];
  if (!selected) return null;
  const nets = scored.map((winner) => {
    const others = scored
      .filter((item) => item.playerId !== winner.playerId)
      .reduce((total, item) => total.add(Score.fromString(item.ordinary)), Score.fromString('0'));
    return {
      playerId: winner.playerId,
      delta: Score.fromString(winner.ordinary).subtract(others.divide(seats)).toExact(),
    };
  });
  const selectedNet = nets.find((item) => item.playerId === selected.playerId)?.delta ?? selected.ordinary;
  return {
    kind: 'multi',
    fan: selected.fan,
    winnerId: selected.playerId,
    winnerIds: scored.map((winner) => winner.playerId),
    discarderId,
    ordinary: selected.ordinary,
    multiplier: null,
    total: selectedNet,
    deltas: [
      ...nets,
      { playerId: discarderId, delta: negate(sum.multiply(Score.fromRational(2, 1)).divide(seats)) },
      ...bystanders.map((playerId) => ({ playerId, delta: negate(sum.divide(seats)) })),
    ],
  };
}

function negate(score: Score): string {
  return score.multiply(Score.fromString('-1')).toExact();
}

function ordinaryAmount(session: Session, fan: number): string | null {
  if (!Number.isInteger(fan) || fan < session.rules.minFan) return null;
  const scored = scoringFan(session.rules, fan);
  return session.rules.rows.find((row) => row.fan === scored)?.ordinary ?? null;
}
