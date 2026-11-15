import { Score } from '../score/score.ts';
import { formatAmount } from '../rules/setup.ts';
import type { Player, Session } from './types.ts';

export type StatTitle = '食糊王' | '自摸王' | '出銃王' | '陪跑員';

export type PlayerStatistics = {
  playerId: string;
  name: string;
  wins: number;
  selfDraws: number;
  discards: number;
  /** Exact 0–100 自摸率. */
  selfDrawRate: string;
  titles: StatTitle[];
};

export function rosterStatistics(session: Session): PlayerStatistics[] {
  const players = session.players;
  const winCrown = maxCount(players, (player) => player.wins);
  const selfDrawCrown = maxCount(players, (player) => player.selfDraws);
  const discardCrown = maxCount(players, (player) => player.discards);

  return players.map((player) => {
    const titles: StatTitle[] = [];
    if (winCrown !== null && player.wins === winCrown) titles.push('食糊王');
    if (selfDrawCrown !== null && player.selfDraws === selfDrawCrown) titles.push('自摸王');
    if (discardCrown !== null && player.discards === discardCrown) titles.push('出銃王');
    const held = new Set(titles);
    // 大牌王 is not awarded while 平均番數 is unspecified, so it does not block 陪跑員.
    if (!held.has('食糊王') && !held.has('自摸王') && !held.has('出銃王')) {
      titles.push('陪跑員');
    }
    return {
      playerId: player.id,
      name: player.name,
      wins: player.wins,
      selfDraws: player.selfDraws,
      discards: player.discards,
      selfDrawRate: selfDrawRateOf(player),
      titles,
    };
  });
}

export function formatRate(exact: string): string {
  const shown = formatAmount(exact);
  return shown.endsWith('%') ? shown : `${shown}%`;
}

function selfDrawRateOf(player: Player): string {
  if (player.wins <= 0) return '0';
  return Score.fromRational(player.selfDraws * 100, player.wins).toExact();
}

function maxCount(players: Player[], value: (player: Player) => number): number | null {
  let highest = 0;
  for (const player of players) {
    const count = value(player);
    if (count > highest) highest = count;
  }
  return highest >= 1 ? highest : null;
}
