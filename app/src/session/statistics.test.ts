import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createCustomDraft } from '../rules/setup.ts';
import { addReserve, startSession } from './session.ts';
import { rosterStatistics } from './statistics.ts';

const startedAt = '2026-11-15T02:00:00.000Z';

describe('session counts', () => {
  it('includes every roster player’s 食糊, 自摸, and 出銃', () => {
    const session = sessionWithCounts([
      ['a', 4, 1, 0],
      ['b', 8, 0, 2],
      ['c', 2, 0, 6],
      ['d', 7, 3, 6],
    ]);
    const reserved = addReserve(session, 'e');
    const rows = rosterStatistics(reserved);
    assert.deepEqual(
      rows.map((row) => [row.name, row.wins, row.selfDraws, row.discards]),
      [
        ['a', 4, 1, 0],
        ['b', 8, 0, 2],
        ['c', 2, 0, 6],
        ['d', 7, 3, 6],
        ['e', 0, 0, 0],
      ],
    );
  });
});

export function sessionWithCounts(entries: [string, number, number, number][]) {
  const session = startSession({
    rules: createCustomDraft(),
    names: entries.map(([name]) => name),
    dealerIndex: 0,
    startedAt,
  });
  return {
    ...session,
    players: session.players.map((player, index) => {
      const entry = entries[index];
      return entry
        ? { ...player, wins: entry[1], selfDraws: entry[2], discards: entry[3] }
        : player;
    }),
  };
}
