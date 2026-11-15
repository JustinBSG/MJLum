import { formatAmount, missingHighFans } from '../rules/setup.ts';
import type { RuleSetup } from '../rules/types.ts';
import { Score } from '../score/score.ts';
import type { BoardState, DealerMark, Player, ProgressDisplay, Session, Wind } from './types.ts';

const AVATARS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '子', '丑', '寅', '卯'] as const;

const WIND_LABEL: Record<Wind, string> = {
  east: '東',
  south: '南',
  west: '西',
  north: '北',
};

export function seatCount(rules: RuleSetup): number {
  return rules.playerFormat === 'three' ? 3 : 4;
}

export function canStart(rules: RuleSetup, names: string[], dealerIndex: number | null): boolean {
  const count = seatCount(rules);
  if (names.length !== count) return false;
  if (names.some((name) => name.trim() === '')) return false;
  if (missingHighFans(rules).length > 0) return false;
  if (!rules.trackDealer) return true;
  return dealerIndex !== null && dealerIndex >= 0 && dealerIndex < count;
}

export function startSession(input: {
  rules: RuleSetup;
  names: string[];
  dealerIndex: number | null;
  startedAt: string;
}): Session {
  if (!canStart(input.rules, input.names, input.dealerIndex)) {
    throw new Error('A session needs a name in every seat.');
  }
  const players = input.names.map((name, index) => createPlayer(name.trim(), index));
  const track = input.rules.trackDealer;
  const dealerIndex = track ? input.dealerIndex : null;
  return {
    id: createId('session'),
    rules: input.rules,
    startedAt: input.startedAt,
    progressDisplay: 'wind',
    players,
    seats: players.map((player, index) => ({ index, playerId: player.id })),
    dealerId: dealerIndex === null ? null : players[dealerIndex].id,
    dealerMark: { kind: 'plain' },
    roundWind: 'east',
    seatWind: 'east',
    handCount: 0,
    pool: '0',
    ledger: [],
  };
}

/** A new session that keeps the same people, seats, and rules, with scores and records cleared. */
export function reopenSession(session: Session, startedAt: string): Session {
  return sessionFromRoster({
    rules: session.rules,
    players: session.players.map(clearRecord),
    seatPlayerIds: session.seats.flatMap((seat) => (seat.playerId ? [seat.playerId] : [])),
    dealerIndex: dealerSeatIndex(session),
    startedAt,
  });
}

export type KeptPlayer = Player;

/** People carried into the next session. Records are already cleared. */
export function blankRoster(session: Session): { players: Player[]; seatedIds: string[] } {
  return {
    players: session.players.map(clearRecord),
    seatedIds: session.seats.flatMap((seat) => (seat.playerId ? [seat.playerId] : [])),
  };
}

export function namedPlayer(name: string, index: number): Player {
  return createPlayer(name, index);
}

export function sessionFromRoster(input: {
  rules: RuleSetup;
  players: Player[];
  seatPlayerIds: string[];
  dealerIndex: number | null;
  startedAt: string;
}): Session {
  const count = seatCount(input.rules);
  const seats = input.seatPlayerIds;
  if (seats.length !== count || new Set(seats).size !== count) {
    throw new Error('A session needs one player in every seat.');
  }
  if (seats.some((id) => !input.players.some((player) => player.id === id))) {
    throw new Error('A session needs one player in every seat.');
  }
  if (input.players.some((player) => player.name.trim() === '')) {
    throw new Error('A session needs a name in every seat.');
  }
  const track = input.rules.trackDealer;
  const dealerIndex = track ? input.dealerIndex : null;
  if (track && (dealerIndex === null || dealerIndex < 0 || dealerIndex >= count)) {
    throw new Error('A session needs a dealer.');
  }
  return {
    id: createId('session'),
    rules: input.rules,
    startedAt: input.startedAt,
    progressDisplay: 'wind',
    players: input.players.map((player) => ({ ...player })),
    seats: seats.map((playerId, index) => ({ index, playerId })),
    dealerId: dealerIndex === null ? null : (seats[dealerIndex] ?? null),
    dealerMark: { kind: 'plain' },
    roundWind: 'east',
    seatWind: 'east',
    handCount: 0,
    pool: '0',
    ledger: [],
  };
}

function dealerSeatIndex(session: Session): number | null {
  if (!session.rules.trackDealer) return null;
  const index = session.seats.findIndex((seat) => seat.playerId === session.dealerId);
  return index >= 0 ? index : 0;
}

function clearRecord(player: Player): Player {
  return {
    ...player,
    balance: '0',
    wins: 0,
    selfDraws: 0,
    discards: 0,
    hands: 0,
    fanSum: 0,
    discardFanSum: 0,
    dealerStreak: 0,
    bestDealerStreak: 0,
  };
}

export function addReserve(session: Session, name: string): Session {
  const trimmed = name.trim();
  if (trimmed === '') return session;
  const player = createPlayer(trimmed, session.players.length);
  return commitBoard(session, `加入 ${player.name}`, {
    ...boardOf(session),
    players: [...session.players, player],
  });
}

/**
 * Puts an unseated player into a seat.
 * The person who leaves keeps their balance. The incoming player does not take that result.
 */
export function substitute(session: Session, playerId: string, seatIndex: number): Session {
  const incoming = session.players.find((player) => player.id === playerId);
  const seat = session.seats.find((item) => item.index === seatIndex);
  if (!incoming || !seat?.playerId) return session;
  if (session.seats.some((item) => item.playerId === playerId)) return session;
  const leaving = session.players.find((player) => player.id === seat.playerId);
  return commitBoard(session, `${incoming.name} 換入 ${leaving?.name ?? ''}`.trim(), {
    ...boardOf(session),
    seats: session.seats.map((item) => (item.index === seatIndex ? { ...item, playerId } : item)),
  });
}

/**
 * Manual 莊家設定.
 * 重置連莊數 clears 連N on the same dealer. 冧N is left as it is.
 * Choosing another seated player shows a plain 莊.
 * 重新開始計算圈風 on sets 東圈東風. Off leaves 圈風.
 * Neither choice adds a 留莊 record. Resetting 連莊數 sets that dealer's current streak to 0.
 */
export function selectDealer(
  session: Session,
  playerId: string,
  resetConsecutive: boolean,
  restartWind: boolean,
): Session {
  if (!session.rules.trackDealer) return session;
  if (!session.seats.some((seat) => seat.playerId === playerId)) return session;
  const same = session.dealerId === playerId;
  let dealerMark: DealerMark = { kind: 'plain' };
  if (same) {
    dealerMark =
      resetConsecutive && session.dealerMark.kind === 'consecutive' ? { kind: 'plain' } : session.dealerMark;
  }
  const roundWind = restartWind ? 'east' : session.roundWind;
  const seatWind = restartWind ? 'east' : session.seatWind;
  const players = session.players.map((player) => {
    if (player.id === playerId) {
      return !same || resetConsecutive ? { ...player, dealerStreak: 0 } : player;
    }
    if (!same && player.id === session.dealerId) return { ...player, dealerStreak: 0 };
    return player;
  });
  const unchanged =
    same &&
    sameMark(dealerMark, session.dealerMark) &&
    roundWind === session.roundWind &&
    seatWind === session.seatWind &&
    players.every((player, index) => player.dealerStreak === session.players[index]?.dealerStreak);
  if (unchanged) return session;
  const name = session.players.find((player) => player.id === playerId)?.name ?? '';
  return commitBoard(session, `莊家 ${name}`, {
    ...boardOf(session),
    players,
    dealerId: playerId,
    dealerMark,
    roundWind,
    seatWind,
  });
}

export function setProgressDisplay(session: Session, progressDisplay: ProgressDisplay): Session {
  return { ...session, progressDisplay };
}

/** Records a confirmed board. Later features pass the calculated result. This function does not score a hand. */
export function commitBoard(session: Session, label: string, next: BoardState): Session {
  return {
    ...session,
    ...cloneBoard(next),
    ledger: [...session.ledger, { id: createId('entry'), label, before: boardOf(session) }],
  };
}

export function undoLatest(session: Session): Session {
  const latest = session.ledger.at(-1);
  if (!latest) return session;
  return {
    ...session,
    ...cloneBoard(latest.before),
    ledger: session.ledger.slice(0, -1),
  };
}

export function seatedPlayerIds(session: Session): string[] {
  return session.seats.flatMap((seat) => (seat.playerId ? [seat.playerId] : []));
}

const WIND_ORDER: Wind[] = ['east', 'south', 'west', 'north'];

/** One step of 圈風: 東風, 南風, 西風, 北風, then the next round's 東風. */
export function stepWind(roundWind: Wind, seatWind: Wind): { roundWind: Wind; seatWind: Wind } {
  const seatIndex = WIND_ORDER.indexOf(seatWind);
  if (seatIndex >= 0 && seatIndex < WIND_ORDER.length - 1) {
    return { roundWind, seatWind: WIND_ORDER[seatIndex + 1] };
  }
  const roundIndex = WIND_ORDER.indexOf(roundWind);
  const nextRound = WIND_ORDER[(roundIndex + 1) % WIND_ORDER.length] ?? 'east';
  return { roundWind: nextRound, seatWind: 'east' };
}

/**
 * A non-dealer win passes 莊 to the next seated player and advances 圈風 one step.
 * The new dealer has a plain 莊.
 */
export function passDealer(session: Session): Pick<BoardState, 'dealerId' | 'dealerMark' | 'roundWind' | 'seatWind'> {
  const winds = stepWind(session.roundWind, session.seatWind);
  return {
    dealerId: nextSeatedDealer(session),
    dealerMark: { kind: 'plain' },
    roundWind: winds.roundWind,
    seatWind: winds.seatWind,
  };
}

function nextSeatedDealer(session: Session): string | null {
  const seated = session.seats.filter((seat) => seat.playerId);
  const index = seated.findIndex((seat) => seat.playerId === session.dealerId);
  if (index < 0) return session.dealerId;
  return seated[(index + 1) % seated.length]?.playerId ?? session.dealerId;
}

/**
 * A dealer win keeps the same 莊 and raises 連N.
 * 圈風 stays on 東, 南, and 西. A win as 北 莊 moves to the next round's 東風.
 */
export function retainDealer(session: Session): Pick<BoardState, 'dealerId' | 'dealerMark' | 'roundWind' | 'seatWind'> {
  const winds =
    session.seatWind === 'north'
      ? stepWind(session.roundWind, session.seatWind)
      : { roundWind: session.roundWind, seatWind: session.seatWind };
  const count = session.dealerMark.kind === 'consecutive' ? session.dealerMark.count + 1 : 1;
  return {
    dealerId: session.dealerId,
    dealerMark: { kind: 'consecutive', count },
    roundWind: winds.roundWind,
    seatWind: winds.seatWind,
  };
}

export function formatWind(roundWind: Wind, seatWind: Wind): string {
  return `${WIND_LABEL[roundWind]}圈${WIND_LABEL[seatWind]}風`;
}

export function formatDealerBadge(mark: DealerMark): string {
  if (mark.kind === 'consecutive' && mark.count >= 1) return `連${mark.count}`;
  if (mark.kind === 'draw' && mark.count >= 1) return `冧${mark.count}`;
  return '莊';
}

export function formatBalance(exact: string): string {
  return formatAmount(exact);
}

export function formatStartDate(startedAt: string): string {
  return new Intl.DateTimeFormat('zh-Hant-HK', { dateStyle: 'long' }).format(new Date(startedAt));
}

export type LedgerEmphasis = 'events' | 'scores' | 'combined';

export type LedgerLine = {
  id: string;
  text: string;
};

/**
 * 詳細紀錄. 事件 lists hand labels. 分數 lists each player's point change,
 * grouped by the wind after the hand: 東圈東風 is 東圈1. 綜合 lists both.
 */
export function ledgerLines(
  session: Session,
  emphasis: LedgerEmphasis,
  direction: 'forward' | 'reverse',
): LedgerLine[] {
  const hands = session.ledger.map((entry, index) => ({
    entry,
    after: session.ledger[index + 1]?.before ?? boardOf(session),
  }));
  const ordered = direction === 'reverse' ? hands.slice().reverse() : hands;
  const lines: LedgerLine[] = [];
  let header: string | null = null;
  for (const hand of ordered) {
    if (emphasis !== 'events' && session.rules.trackDealer) {
      const nextHeader = windSection(hand.after.roundWind, hand.after.seatWind);
      if (nextHeader !== header) {
        lines.push({ id: `${hand.entry.id}-wind`, text: nextHeader });
        header = nextHeader;
      }
    }
    if (emphasis !== 'scores') {
      lines.push({ id: hand.entry.id, text: hand.entry.label });
    }
    if (emphasis !== 'events') {
      for (const point of pointRows(hand.entry.before, hand.after)) {
        lines.push({
          id: `${hand.entry.id}-${point.playerId}`,
          text: `${point.name} ${point.delta}`,
        });
      }
    }
  }
  return lines;
}

export function ledgerLabels(session: Session, direction: 'forward' | 'reverse'): string[] {
  return ledgerLines(session, 'events', direction).map((line) => line.text);
}

/** 東圈東風 is 東圈1, 東圈南風 is 東圈2, 南圈東風 is 南圈1. */
function windSection(roundWind: Wind, seatWind: Wind): string {
  return `${WIND_LABEL[roundWind]}圈${WIND_ORDER.indexOf(seatWind) + 1}`;
}

function pointRows(before: BoardState, after: BoardState): { playerId: string; name: string; delta: string }[] {
  const previous = new Map(before.players.map((player) => [player.id, player.balance]));
  const seated = after.seats.flatMap((seat) => {
    const player = after.players.find((item) => item.id === seat.playerId);
    return player ? [player] : [];
  });
  const seatedIds = new Set(seated.map((player) => player.id));
  return [...seated, ...after.players.filter((player) => !seatedIds.has(player.id))].map((player) => ({
    playerId: player.id,
    name: player.name,
    delta: formatAmount(Score.fromString(player.balance).subtract(Score.fromString(previous.get(player.id) ?? '0')).toExact()),
  }));
}

function createPlayer(name: string, index: number): Player {
  return {
    id: createId('player'),
    name,
    avatar: AVATARS[index] ?? `${AVATARS[index % AVATARS.length]}${Math.floor(index / AVATARS.length)}`,
    balance: '0',
    wins: 0,
    selfDraws: 0,
    discards: 0,
    hands: 0,
    fanSum: 0,
    discardFanSum: 0,
    dealerStreak: 0,
    bestDealerStreak: 0,
  };
}

function boardOf(session: Session): BoardState {
  return cloneBoard({
    players: session.players,
    seats: session.seats,
    dealerId: session.dealerId,
    dealerMark: session.dealerMark,
    roundWind: session.roundWind,
    seatWind: session.seatWind,
    handCount: session.handCount,
    pool: session.pool,
  });
}

function cloneBoard(board: BoardState): BoardState {
  return {
    players: board.players.map((player) => ({ ...player })),
    seats: board.seats.map((seat) => ({ ...seat })),
    dealerId: board.dealerId,
    dealerMark: { ...board.dealerMark },
    roundWind: board.roundWind,
    seatWind: board.seatWind,
    handCount: board.handCount,
    pool: board.pool,
  };
}

function sameMark(left: DealerMark, right: DealerMark): boolean {
  if (left.kind !== right.kind) return false;
  if (left.kind === 'plain' || right.kind === 'plain') return true;
  return left.count === right.count;
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
