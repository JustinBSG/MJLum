import { Score } from '../score/score.ts';
import type { Player, Session } from './types.ts';

export type StatTitle = '食糊王' | '自摸王' | '出銃王' | '大牌王' | '細牌王' | '冧莊王' | '陪跑員';

const BIG_HAND_WINS = 3;
const DEALER_STREAK = 3;

export type PlayerStatistics = {
  playerId: string;
  name: string;
  wins: number;
  selfDraws: number;
  discards: number;
  hands: number;
  /** Exact 100×Z/W. Null when W is 0. */
  selfDrawRate: string | null;
  /** Exact 100×W/H. Null when H is 0. */
  winRate: string | null;
  /** Exact 100×D/H. Null when H is 0. */
  discardRate: string | null;
  /** Exact F/W. Null when W is 0. */
  averageFan: string | null;
  /** Exact L/D, summed across every winner of one 出銃. Null when D is 0. */
  averageDiscardFan: string | null;
  titles: StatTitle[];
  /** 進攻 = 100×W/H. Null when H is 0. */
  attack: string | null;
  /** 牌力 from average scoring fan between 起糊 and 滿糊. Null when it cannot be placed. */
  strength: string | null;
  /** 防守 = 100×(1−D/H). Null when H is 0. */
  defense: string | null;
};

export function rosterStatistics(session: Session): PlayerStatistics[] {
  const players = session.players;
  const winCrown = maxCount(players, (player) => player.wins);
  const selfDrawCrown = maxCount(players, (player) => player.selfDraws);
  const discardCrown = maxCount(players, (player) => player.discards);
  const streakCrown = maxAtLeast(players, (player) => player.bestDealerStreak, DEALER_STREAK);
  const fanTitles = fanCrowns(players);

  return players.map((player) => {
    const titles: StatTitle[] = [];
    if (winCrown !== null && player.wins === winCrown) titles.push('食糊王');
    if (selfDrawCrown !== null && player.selfDraws === selfDrawCrown) titles.push('自摸王');
    if (discardCrown !== null && player.discards === discardCrown) titles.push('出銃王');
    if (fanTitles.big !== null && fanTitles.average(player)?.equals(fanTitles.big)) titles.push('大牌王');
    if (fanTitles.small !== null && fanTitles.average(player)?.equals(fanTitles.small)) titles.push('細牌王');
    if (streakCrown !== null && player.bestDealerStreak === streakCrown) titles.push('冧莊王');
    const held = new Set(titles);
    if (!held.has('食糊王') && !held.has('自摸王') && !held.has('出銃王') && !held.has('大牌王')) {
      titles.push('陪跑員');
    }
    const winRate = rate(player.wins, player.hands);
    const defense = rate(player.hands - player.discards, player.hands);
    return {
      playerId: player.id,
      name: player.name,
      wins: player.wins,
      selfDraws: player.selfDraws,
      discards: player.discards,
      hands: player.hands,
      selfDrawRate: rate(player.selfDraws, player.wins),
      winRate,
      discardRate: rate(player.discards, player.hands),
      averageFan: quotient(player.fanSum, player.wins),
      averageDiscardFan: quotient(player.discardFanSum, player.discards),
      titles,
      attack: winRate,
      strength: strengthOf(player, session.rules.minFan, session.rules.maxFan),
      defense,
    };
  });
}

/** Two-decimal half-up percent. A zero denominator is 「—」. */
export function formatRate(exact: string | null): string {
  if (exact === null) return '—';
  return `${roundHalfUp(exact)}%`;
}

/** Two-decimal half-up percent plus the raw count fraction, for example 33.33%（1/3）. */
export function formatCountRate(exact: string | null, numerator: number, denominator: number): string {
  if (exact === null || denominator === 0) return '—';
  return `${roundHalfUp(exact)}%（${numerator}/${denominator}）`;
}

/** Two-decimal half-up average. A zero denominator is 「—」. */
export function formatAverage(exact: string | null): string {
  if (exact === null) return '—';
  return roundHalfUp(exact);
}

/** floor(100x+0.5)/100 for a non-negative exact value. */
export function roundHalfUp(exact: string): string {
  const scaled = Score.fromString(exact).multiply(Score.fromRational(100, 1)).add(Score.fromRational(1, 2));
  const cents = scaled.numerator / scaled.denominator;
  const negative = cents < 0n;
  const abs = negative ? -cents : cents;
  const whole = abs / 100n;
  const frac = (abs % 100n).toString().padStart(2, '0');
  return `${negative ? '-' : ''}${whole}.${frac}`;
}

function rate(numerator: number, denominator: number): string | null {
  if (denominator <= 0) return null;
  return Score.fromRational(numerator * 100, denominator).toExact();
}

function quotient(numerator: number, denominator: number): string | null {
  if (denominator <= 0) return null;
  return Score.fromRational(numerator, denominator).toExact();
}

function strengthOf(player: Player, minFan: number, maxFan: number): string | null {
  if (player.wins <= 0 || minFan === maxFan) return null;
  const average = Score.fromRational(player.fanSum, player.wins);
  const scaled = average
    .subtract(Score.fromRational(minFan, 1))
    .divide(Score.fromRational(maxFan - minFan, 1))
    .multiply(Score.fromRational(100, 1));
  const zero = Score.fromString('0');
  const hundred = Score.fromString('100');
  if (scaled.compare(zero) <= 0) return '0';
  if (scaled.compare(hundred) >= 0) return '100';
  return scaled.toExact();
}

function fanCrowns(players: Player[]): {
  big: Score | null;
  small: Score | null;
  average: (player: Player) => Score | null;
} {
  const average = (player: Player) =>
    player.wins >= BIG_HAND_WINS ? Score.fromRational(player.fanSum, player.wins) : null;
  const eligible = players.flatMap((player) => {
    const value = average(player);
    return value ? [value] : [];
  });
  if (eligible.length < 2) return { big: null, small: null, average };
  let big = eligible[0]!;
  let small = eligible[0]!;
  for (const value of eligible) {
    if (value.compare(big) > 0) big = value;
    if (value.compare(small) < 0) small = value;
  }
  if (big.equals(small)) return { big: null, small: null, average };
  return { big, small, average };
}

function maxCount(players: Player[], value: (player: Player) => number): number | null {
  return maxAtLeast(players, value, 1);
}

function maxAtLeast(players: Player[], value: (player: Player) => number, floor: number): number | null {
  let highest = 0;
  for (const player of players) {
    const count = value(player);
    if (count > highest) highest = count;
  }
  return highest >= floor ? highest : null;
}
