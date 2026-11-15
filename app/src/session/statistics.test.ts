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

describe('titles', () => {
  it('shares 出銃王 and gives 陪跑員 to anyone without 食糊王, 自摸王, 出銃王, or 大牌王', () => {
    const session = sessionWithCounts([
      ['a', 4, 1, 0],
      ['b', 8, 0, 2],
      ['c', 2, 0, 6],
      ['d', 7, 3, 6],
    ]);
    const rows = Object.fromEntries(rosterStatistics(session).map((row) => [row.name, row.titles]));
    assert.deepEqual(rows.a, ['陪跑員']);
    assert.deepEqual(rows.b, ['食糊王']);
    assert.deepEqual(rows.c, ['出銃王']);
    assert.deepEqual(rows.d, ['自摸王', '出銃王']);
  });

  it('gives no count title when every count is 0, so every player is 陪跑員', () => {
    const session = startSession({
      rules: createCustomDraft(),
      names: ['a', 'b', 'c', 'd'],
      dealerIndex: 0,
      startedAt,
    });
    const rows = rosterStatistics(session);
    assert.equal(rows.every((row) => row.wins === 0 && row.titles.length === 1 && row.titles[0] === '陪跑員'), true);
  });
});


describe('radar', () => {
  it('sets 牌力 from 自摸率 and leaves 進攻 and 防守 at 0 while those rates are unspecified', () => {
    const session = sessionWithCounts([
      ['c', 3, 1, 0],
      ['a', 1, 0, 1],
      ['b', 2, 0, 0],
      ['d', 1, 1, 4],
    ]);
    const rows = Object.fromEntries(
      rosterStatistics(session).map((row) => [row.name, [row.attack, row.strength, row.defense]]),
    );
    assert.deepEqual(rows.c, ['0', '100/3', '0']);
    assert.deepEqual(rows.d, ['0', '100', '0']);
    assert.deepEqual(rows.a, ['0', '0', '0']);
  });
});

function sessionWithCounts(entries: [string, number, number, number][]) {
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
