import { parseRuleSetup } from '../rules/document.ts';
import { Score } from '../score/score.ts';
import type {
  BoardState,
  DealerMark,
  LedgerEntry,
  Player,
  ProgressDisplay,
  RedoEntry,
  Seat,
  Session,
  SessionAction,
  SessionStatus,
  Wind,
} from './types.ts';

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
    ...(typeof raw.title === 'string' ? { title: raw.title } : {}),
    status: status(raw.status),
    progressDisplay: progress(raw.progressDisplay),
    ledger: arrayOf(raw.ledger, 'ledger').map(parseEntry),
    redo: Array.isArray(raw.redo) ? raw.redo.map(parseRedo) : [],
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
  const action = parseAction(value.action);
  return {
    id: text(value.id, 'entry.id'),
    label: text(value.label, 'entry.label'),
    before: parseBoard(record(value.before, 'entry.before')),
    ...(action ? { action } : {}),
    ...(isRecord(value.rules) ? { rules: parseRuleSetup(JSON.stringify(value.rules)) } : {}),
  };
}

function parseRedo(value: unknown): RedoEntry {
  const entry = parseEntry(value);
  if (!isRecord(value)) fail('redo');
  return { ...entry, after: parseBoard(record(value.after, 'redo.after')) };
}

function status(value: unknown): SessionStatus {
  if (value === 'playing' || value === 'paused' || value === 'completed' || value === 'void') return value;
  if (value === undefined) return 'playing';
  return fail('status');
}

function parseAction(value: unknown): SessionAction | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) return undefined;
  if (value.type === 'draw') return { type: 'draw' };
  if (value.type === 'rules' && typeof value.name === 'string') {
    return {
      type: 'rules',
      name: value.name,
      ...(isRecord(value.setup) ? { setup: parseRuleSetup(JSON.stringify(value.setup)) } : {}),
    };
  }
  if (value.type === 'adjust' && typeof value.note === 'string') {
    return {
      type: 'adjust',
      playerId: text(value.playerId, 'action.playerId'),
      delta: exact(value.delta, 'action.delta'),
      note: value.note,
    };
  }
  if (value.type === 'substitute') {
    return {
      type: 'substitute',
      playerId: text(value.playerId, 'action.playerId'),
      seatIndex: whole(value.seatIndex, 'action.seatIndex'),
      billToOriginal: value.billToOriginal === true,
    };
  }
  if (value.type === 'swap') {
    return {
      type: 'swap',
      indexA: whole(value.indexA, 'action.indexA'),
      indexB: whole(value.indexB, 'action.indexB'),
    };
  }
  if (value.type === 'dealer') {
    return {
      type: 'dealer',
      playerId: text(value.playerId, 'action.playerId'),
      resetConsecutive: value.resetConsecutive === true,
      restartWind: value.restartWind === true,
    };
  }
  if (value.type === 'jackpot' && Array.isArray(value.playerIds)) {
    return { type: 'jackpot', playerIds: value.playerIds.map((id) => text(id, 'action.playerId')) };
  }
  if (value.type !== 'win' || !isRecord(value.input)) return undefined;
  const input = value.input;
  return {
    type: 'win',
    input: {
      winnerId: text(input.winnerId, 'action.winnerId'),
      fan: whole(input.fan, 'action.fan'),
      discarderId: input.discarderId === null ? null : text(input.discarderId, 'action.discarderId'),
      ...(Array.isArray(input.also)
        ? {
            also: input.also.map((item) => {
              if (!isRecord(item)) fail('action.also');
              return { playerId: text(item.playerId, 'action.also.playerId'), fan: whole(item.fan, 'action.also.fan') };
            }),
          }
        : {}),
      ...(input.falseWin === true ? { falseWin: true } : {}),
      ...(input.falseWinAsSelfDraw === true ? { falseWinAsSelfDraw: true } : {}),
      ...(input.discarderPaysSelfDraw === true ? { discarderPaysSelfDraw: true } : {}),
      ...(input.discarderPaysLoss === true ? { discarderPaysLoss: true } : {}),
      ...(input.takeJackpot === true ? { takeJackpot: true } : {}),
      ...(input.limitHand === true ? { limitHand: true } : {}),
    },
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
