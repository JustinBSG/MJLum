import type { RuleSetup } from '../rules/types.ts';
import { Score } from '../score/score.ts';
import { recordDraw, recordWin, splitJackpot } from './hand.ts';
import {
  adjustScore,
  commitBoard,
  selectDealer,
  substitute,
  swapSeats,
} from './session.ts';
import type { BoardState, Session, SessionAction } from './types.ts';

/**
 * Replaces one recorded hand and recomputes every later row with that row's own rules.
 * A later row without a replayable action stays blocked, and the message names that row.
 */
export function reviseEntry(
  session: Session,
  entryId: string,
  action: SessionAction,
): { session: Session } | { error: string } {
  const index = session.ledger.findIndex((entry) => entry.id === entryId);
  const current = session.ledger[index];
  if (!current) return { error: '找不到這筆記錄' };
  if (!current.action || (current.action.type !== 'win' && current.action.type !== 'draw')) {
    return { error: `未能重算「${current.label}」` };
  }
  if (action.type !== 'win' && action.type !== 'draw') return { error: `未能重算「${current.label}」` };
  const rules = rulesForEntry(session, index);
  if ('error' in rules) return rules;
  let cursor = replayBase(session, current.before, rules);
  const steps = [action, ...session.ledger.slice(index + 1).map((entry) => entry.action)];
  for (const [stepIndex, step] of steps.entries()) {
    const label = stepIndex === 0 ? current.label : session.ledger[index + stepIndex]?.label ?? current.label;
    if (!step) return { error: `「${label}」沒有可重算的動作，所以不能修改更早的食糊` };
    const next = replayAction(cursor, step);
    if ('error' in next) return { error: next.error.replace('這筆', `「${label}」`) };
    if (next.session === cursor) return { error: `未能重算「${label}」` };
    if (Score.fromString(next.session.pool).compare(Score.fromString('0')) < 0) {
      return { error: `「${label}」會令彩池變成負數` };
    }
    cursor = next.session;
  }
  return {
    session: {
      ...cursor,
      id: session.id,
      startedAt: session.startedAt,
      status: session.status,
      ...(session.title ? { title: session.title } : {}),
      ...(session.outboundPool ? { outboundPool: session.outboundPool } : {}),
      ledger: [...session.ledger.slice(0, index), ...cursor.ledger],
      redo: [],
    },
  };
}

function rulesForEntry(session: Session, index: number): RuleSetup | { error: string } {
  const entry = session.ledger[index];
  if (entry?.rules) return entry.rules;
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    const action = session.ledger[cursor]?.action;
    if (action?.type !== 'rules') continue;
    if (action.setup) return action.setup;
    return { error: `「${session.ledger[cursor]?.label ?? ''}」沒有完整玩法資料，所以不能修改更早的食糊` };
  }
  if (session.ledger.some((item) => item.action?.type === 'rules' && !item.action.setup)) {
    return { error: '改過玩法之後，這筆記錄沒有當時的玩法資料，所以不能修改' };
  }
  return session.rules;
}

function replayAction(session: Session, action: SessionAction): { session: Session } | { error: string } {
  if (action.type === 'win') return { session: recordWin(session, action.input) };
  if (action.type === 'draw') return { session: recordDraw(session) };
  if (action.type === 'adjust') return { session: adjustScore(session, action.playerId, action.delta, action.note) };
  if (action.type === 'substitute') {
    return { session: substitute(session, action.playerId, action.seatIndex, action.billToOriginal) };
  }
  if (action.type === 'swap') return { session: swapSeats(session, action.indexA, action.indexB) };
  if (action.type === 'dealer') {
    return { session: selectDealer(session, action.playerId, action.resetConsecutive, action.restartWind) };
  }
  if (action.type === 'jackpot') return { session: splitJackpot(session, action.playerIds) };
  if (action.type === 'rules') {
    if (!action.setup) return { error: '這筆沒有完整玩法資料，所以不能修改更早的食糊' };
    const { pendingRules: _pending, ...rest } = session;
    return {
      session: commitBoard({ ...rest, rules: action.setup }, `玩法 ${action.setup.name}`, boardOf(session), {
        type: 'rules',
        name: action.setup.name,
        setup: action.setup,
      }),
    };
  }
  return { error: '這筆沒有可重算的動作，所以不能修改更早的食糊' };
}

function boardOf(session: Session): BoardState {
  return {
    players: session.players,
    seats: session.seats,
    dealerId: session.dealerId,
    dealerMark: session.dealerMark,
    roundWind: session.roundWind,
    seatWind: session.seatWind,
    handCount: session.handCount,
    pool: session.pool,
  };
}

function replayBase(session: Session, board: BoardState, rules: RuleSetup): Session {
  const { pendingRules: _pending, title: _title, outboundPool: _outbound, ...rest } = session;
  return {
    ...rest,
    rules,
    players: board.players.map((player) => ({ ...player })),
    seats: board.seats.map((seat) => ({ ...seat })),
    dealerId: board.dealerId,
    dealerMark: board.dealerMark,
    roundWind: board.roundWind,
    seatWind: board.seatWind,
    handCount: board.handCount,
    pool: board.pool,
    ledger: [],
    redo: [],
  };
}
