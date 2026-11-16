import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createCustomDraft } from '../rules/setup.ts';
import { addReserve, startSession } from './session.ts';
import { formatAverage, formatCountRate, formatRate, rosterStatistics, roundHalfUp } from './statistics.ts';

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

describe('rates', () => {
  it('uses raw counts, two-decimal half-up, and a dash when the denominator is 0', () => {
    const session = sessionWithCounts([
      ['c', 3, 1, 0, 10, 12],
      ['d', 1, 1, 4, 8, 4],
      ['a', 1, 0, 1, 4, 3],
      ['b', 0, 0, 0, 0, 0],
    ]);
    const rows = Object.fromEntries(rosterStatistics(session).map((row) => [row.name, row]));
    assert.equal(rows.c?.selfDrawRate, '100/3');
    assert.equal(formatCountRate(rows.c?.selfDrawRate ?? null, 1, 3), '33.33%（1/3）');
    assert.equal(formatRate(rows.d?.selfDrawRate ?? null), '100.00%');
    assert.equal(formatRate(rows.a?.selfDrawRate ?? null), '0.00%');
    assert.equal(formatRate(rows.b?.selfDrawRate ?? null), '—');
    assert.equal(rows.c?.winRate, '30');
    assert.equal(rows.a?.discardRate, '25');
    assert.equal(rows.c?.averageFan, '4');
    assert.equal(formatAverage(rows.c?.averageFan ?? null), '4.00');
    assert.equal(formatAverage(rows.b?.averageFan ?? null), '—');
    assert.equal(roundHalfUp('100/3'), '33.33');
  });
});

describe('titles', () => {
  it('shares 出銃王 and gives 陪跑員 to anyone without 食糊王, 自摸王, 出銃王, or 大牌王', () => {
    const session = sessionWithCounts([
      ['a', 4, 1, 0, 10, 16],
      ['b', 8, 0, 2, 10, 32],
      ['c', 2, 0, 6, 10, 8],
      ['d', 7, 3, 6, 10, 28],
    ]);
    const rows = Object.fromEntries(rosterStatistics(session).map((row) => [row.name, row.titles]));
    assert.deepEqual(rows.a, ['陪跑員']);
    assert.deepEqual(rows.b, ['食糊王']);
    assert.deepEqual(rows.c, ['出銃王']);
    assert.deepEqual(rows.d, ['自摸王', '出銃王']);
  });

  it('awards 大牌王 and 細牌王 only when two players each have at least 3 食糊 and their averages differ', () => {
    const session = sessionWithCounts([
      ['a', 4, 0, 0, 4, 20],
      ['b', 3, 0, 0, 3, 9],
      ['c', 2, 0, 0, 2, 16],
      ['d', 0, 0, 0, 0, 0],
    ]);
    const rows = Object.fromEntries(rosterStatistics(session).map((row) => [row.name, row.titles]));
    assert.deepEqual(rows.a, ['食糊王', '大牌王']);
    assert.deepEqual(rows.b, ['細牌王', '陪跑員']);
    assert.deepEqual(rows.c, ['陪跑員']);
  });

  it('awards neither 大牌王 nor 細牌王 when every eligible average is the same', () => {
    const session = sessionWithCounts([
      ['a', 4, 0, 0, 4, 16],
      ['b', 3, 0, 0, 3, 12],
      ['c', 1, 0, 0, 1, 8],
      ['d', 0, 0, 0, 0, 0],
    ]);
    const rows = rosterStatistics(session);
    assert.equal(rows.some((row) => row.titles.includes('大牌王') || row.titles.includes('細牌王')), false);
  });

  it('shares 冧莊王 when the longest automatic 留莊 is at least 3', () => {
    const session = sessionWithCounts([
      ['a', 0, 0, 0],
      ['b', 0, 0, 0],
      ['c', 0, 0, 0],
      ['d', 0, 0, 0],
    ]);
    session.players[0]!.bestDealerStreak = 3;
    session.players[1]!.bestDealerStreak = 3;
    session.players[2]!.bestDealerStreak = 2;
    const rows = Object.fromEntries(rosterStatistics(session).map((row) => [row.name, row.titles]));
    assert.deepEqual(rows.a, ['冧莊王', '陪跑員']);
    assert.deepEqual(rows.b, ['冧莊王', '陪跑員']);
    assert.deepEqual(rows.c, ['陪跑員']);
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
  it('maps 進攻 to 食糊率, 防守 to the complement of 出銃率, and 牌力 to the fan span', () => {
    const session = sessionWithCounts([
      ['c', 3, 1, 0, 6, 15],
      ['a', 1, 0, 1, 4, 3],
      ['b', 0, 0, 0, 0, 0],
      ['d', 1, 1, 4, 4, 8],
    ]);
    const rows = Object.fromEntries(
      rosterStatistics(session).map((row) => [row.name, [row.attack, row.strength, row.defense]]),
    );
    assert.deepEqual(rows.c, ['50', '40', '100']);
    assert.deepEqual(rows.a, ['25', '0', '75']);
    assert.deepEqual(rows.b, [null, null, null]);
    assert.deepEqual(rows.d, ['25', '100', '0']);
  });
});

function sessionWithCounts(entries: [string, number, number, number, number?, number?][]) {
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
        ? {
            ...player,
            wins: entry[1],
            selfDraws: entry[2],
            discards: entry[3],
            hands: entry[4] ?? 0,
            fanSum: entry[5] ?? 0,
          }
        : player;
    }),
  };
}
