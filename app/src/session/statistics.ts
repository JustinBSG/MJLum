import type { Session } from './types.ts';

export type PlayerStatistics = {
  playerId: string;
  name: string;
  wins: number;
  selfDraws: number;
  discards: number;
};

export function rosterStatistics(session: Session): PlayerStatistics[] {
  return session.players.map((player) => ({
    playerId: player.id,
    name: player.name,
    wins: player.wins,
    selfDraws: player.selfDraws,
    discards: player.discards,
  }));
}
