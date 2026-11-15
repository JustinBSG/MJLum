import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createCustomDraft } from '../rules/setup.ts';
import { addReserve, startSession } from './session.ts';
import { formatRate, rosterStatistics } from './statistics.ts';

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

describe('自摸率', () => {
  it('matches 自摸/食糊 when 食糊 is at least 1, and is 0 when 食糊 is 0', () => {
    const session = sessionWithCounts([
      ['c', 3, 1, 0],
      ['d', 1, 1, 4],
      ['a', 1, 0, 1],
      ['b', 0, 0, 0],
    ]);
    const rows = Object.fromEntries(
      rosterStatistics(session).map((row) => [row.name, [row.selfDrawRate, formatRate(row.selfDrawRate)]]),
    );
    assert.equal(rows.c?.[0], '100/3');
    assert.equal(rows.d?.[0], '100');
    assert.equal(rows.a?.[0], '0');
    assert.equal(rows.b?.[0], '0');
    assert.equal(rows.d?.[1], '100%');
    assert.equal(rows.a?.[1], '0%');
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
