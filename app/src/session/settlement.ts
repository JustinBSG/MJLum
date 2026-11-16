import { Score } from '../score/score.ts';
import { formatBalance } from './session.ts';
import type { Session } from './types.ts';

export type SettlementRow = {
  playerId: string;
  name: string;
  balance: string;
};

/**
 * 找數 rows: each non-zero net, including someone who has left a seat.
 * A zero is omitted. No transfer list. A non-zero pool stays unallocated.
 */
export function settlementRows(session: Session): SettlementRow[] {
  const zero = Score.fromString('0');
  return session.players.flatMap((player) =>
    Score.fromString(player.balance).equals(zero)
      ? []
      : [{ playerId: player.id, name: player.name, balance: player.balance }],
  );
}

export function poolUnallocated(session: Session): boolean {
  return !Score.fromString(session.pool).equals(Score.fromString('0'));
}

/** True when at least one roster player has a positive net. */
export function hasPositiveBalance(session: Session): boolean {
  const zero = Score.fromString('0');
  return session.players.some((player) => Score.fromString(player.balance).compare(zero) > 0);
}

export function formatSettlementBalance(exact: string): string {
  const shown = formatBalance(exact);
  if (Score.fromString(exact).compare(Score.fromString('0')) > 0 && !shown.startsWith('+')) {
    return `+${shown}`;
  }
  return shown;
}
