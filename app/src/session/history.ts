import { recordDraw, recordWin } from './hand.ts';
import type { BoardState, Session, SessionAction } from './types.ts';

/**
 * Replaces one recorded hand and recomputes every later hand.
 * A row without a stored action, or a session that changed rules, blocks the save.
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
  if (session.ledger.some((entry) => entry.action?.type === 'rules')) {
    return { error: '改過玩法之後未能重算舊記錄' };
  }
  const blocked = session.ledger.slice(index + 1).find((entry) => !entry.action);
  if (blocked) return { error: `未能重算「${blocked.label}」` };
  let cursor = replayBase(session, current.before);
  const steps = [action, ...session.ledger.slice(index + 1).map((entry) => entry.action as SessionAction)];
  for (const step of steps) {
    const next = step.type === 'win' ? recordWin(cursor, step.input) : step.type === 'draw' ? recordDraw(cursor) : cursor;
    if (next === cursor) return { error: `未能重算「${current.label}」` };
    cursor = next;
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

function replayBase(session: Session, board: BoardState): Session {
  const { pendingRules: _pending, title: _title, outboundPool: _outbound, ...rest } = session;
  return {
    ...rest,
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
