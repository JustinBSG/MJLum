import { Score } from '../score/score.ts';
import { formatBalance } from './session.ts';
import type { Session } from './types.ts';

export type SettlementRow = {
  playerId: string;
  name: string;
  balance: string;
};

/**
 * 找數 rows: every roster player with a non-zero net, including someone
 * who has left a seat. The Jackpot pool is not shown; that view is unspecified.
 */
export function settlementRows(session: Session): SettlementRow[] {
  const zero = Score.fromString('0');
  return session.players
    .filter((player) => !Score.fromString(player.balance).equals(zero))
    .map((player) => ({
      playerId: player.id,
      name: player.name,
      balance: player.balance,
    }));
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
