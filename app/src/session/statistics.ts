import { Score } from '../score/score.ts';
import { formatAmount } from '../rules/setup.ts';
import type { Player, Session } from './types.ts';

export type PlayerStatistics = {
  playerId: string;
  name: string;
  wins: number;
  selfDraws: number;
  discards: number;
  /** Exact 0–100 自摸率. */
  selfDrawRate: string;
};

export function rosterStatistics(session: Session): PlayerStatistics[] {
  return session.players.map((player) => ({
    playerId: player.id,
    name: player.name,
    wins: player.wins,
    selfDraws: player.selfDraws,
    discards: player.discards,
    selfDrawRate: selfDrawRateOf(player),
  }));
}

export function formatRate(exact: string): string {
  const shown = formatAmount(exact);
  return shown.endsWith('%') ? shown : `${shown}%`;
}

export function selfDrawRateOf(player: Player): string {
  if (player.wins <= 0) return '0';
  return Score.fromRational(player.selfDraws * 100, player.wins).toExact();
}
