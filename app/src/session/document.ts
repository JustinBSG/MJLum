import { parseRuleSetup } from '../rules/document.ts';
import { Score } from '../score/score.ts';
import type { BoardState, DealerMark, LedgerEntry, Player, ProgressDisplay, Seat, Session, Wind } from './types.ts';

export function serializeSession(session: Session): string {
  return JSON.stringify(session);
}

export function parseSession(source: string): Session {
  const raw: unknown = JSON.parse(source);
  if (!isRecord(raw)) fail('session');
  const board = parseBoard(raw);
  return {
    ...board,
    id: text(raw.id, 'id'),
    rules: parseRuleSetup(JSON.stringify(raw.rules)),
    ...(isRecord(raw.pendingRules) ? { pendingRules: parseRuleSetup(JSON.stringify(raw.pendingRules)) } : {}),
    startedAt: text(raw.startedAt, 'startedAt'),
    progressDisplay: progress(raw.progressDisplay),
    ledger: arrayOf(raw.ledger, 'ledger').map(parseEntry),
    ...(typeof raw.outboundPool === 'string' ? { outboundPool: exact(raw.outboundPool, 'outboundPool') } : {}),
  };
}

function parseBoard(raw: Record<string, unknown>): BoardState {
  return {
    players: arrayOf(raw.players, 'players').map(parsePlayer),
    seats: arrayOf(raw.seats, 'seats').map(parseSeat),
    dealerId: raw.dealerId === null ? null : text(raw.dealerId, 'dealerId'),
    dealerMark: parseMark(raw.dealerMark),
    roundWind: wind(raw.roundWind, 'roundWind'),
    seatWind: wind(raw.seatWind, 'seatWind'),
    handCount: whole(raw.handCount, 'handCount'),
    pool: exact(raw.pool, 'pool'),
  };
}

function parseEntry(value: unknown): LedgerEntry {
  if (!isRecord(value)) fail('ledger entry');
  return {
    id: text(value.id, 'entry.id'),
    label: text(value.label, 'entry.label'),
    before: parseBoard(record(value.before, 'entry.before')),
  };
}

function parsePlayer(value: unknown): Player {
  if (!isRecord(value)) fail('player');
  return {
    id: text(value.id, 'player.id'),
    name: text(value.name, 'player.name'),
    avatar: text(value.avatar, 'player.avatar'),
    balance: exact(value.balance, 'player.balance'),
    wins: whole(value.wins, 'player.wins'),
    selfDraws: whole(value.selfDraws, 'player.selfDraws'),
    discards: whole(value.discards, 'player.discards'),
    hands: countOrZero(value.hands, 'player.hands'),
    fanSum: countOrZero(value.fanSum, 'player.fanSum'),
    discardFanSum: countOrZero(value.discardFanSum, 'player.discardFanSum'),
    dealerStreak: countOrZero(value.dealerStreak, 'player.dealerStreak'),
    bestDealerStreak: countOrZero(value.bestDealerStreak, 'player.bestDealerStreak'),
    ...(typeof value.billToId === 'string' ? { billToId: text(value.billToId, 'player.billToId') } : {}),
  };
}

function parseSeat(value: unknown): Seat {
  if (!isRecord(value)) fail('seat');
  return {
    index: whole(value.index, 'seat.index'),
    playerId: value.playerId === null ? null : text(value.playerId, 'seat.playerId'),
  };
}

function parseMark(value: unknown): DealerMark {
  if (!isRecord(value)) fail('dealerMark');
  if (value.kind === 'plain') return { kind: 'plain' };
  if (value.kind === 'consecutive') return { kind: 'consecutive', count: whole(value.count, 'dealerMark.count') };
  if (value.kind === 'draw') return { kind: 'draw', count: whole(value.count, 'dealerMark.count') };
  return fail('dealerMark');
}

function progress(value: unknown): ProgressDisplay {
  if (value === 'wind' || value === 'hand-count') return value;
  return fail('progressDisplay');
}

function wind(value: unknown, label: string): Wind {
  if (value === 'east' || value === 'south' || value === 'west' || value === 'north') return value;
  return fail(label);
}

function exact(value: unknown, label: string): string {
  return Score.fromString(text(value, label)).toExact();
}

function text(value: unknown, label: string): string {
  if (typeof value !== 'string') fail(label);
  return value;
}

function whole(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) fail(label);
  return value;
}

function countOrZero(value: unknown, label: string): number {
  if (value === undefined) return 0;
  return whole(value, label);
}

function arrayOf(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) fail(label);
  return value;
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) fail(label);
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function fail(label: string): never {
  throw new Error(`A saved session is missing ${label}.`);
}
