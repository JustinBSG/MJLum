import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createCustomDraft } from '../rules/setup.ts';
import { addReserve, startSession, substitute } from './session.ts';
import { formatSettlementBalance, hasPositiveBalance, settlementRows } from './settlement.ts';

const startedAt = '2026-11-15T02:00:00.000Z';

describe('找數 nets', () => {
  it('lists every roster player with a non-zero net, including an unseated player', () => {
    const session = sessionWithNets([
      ['a', '872'],
      ['b', '-668'],
      ['c', '-220'],
      ['d', '-8'],
      ['e', '24'],
    ]);
    const reserved = addReserve(session, 'f');
    const incoming = reserved.players.at(-1);
    assert.ok(incoming);
    const seatedC = reserved.players[2];
    assert.ok(seatedC);
    const afterSwap = substitute(reserved, incoming.id, 2);

    const rows = settlementRows(afterSwap);
    assert.deepEqual(
      rows.map((row) => [row.name, row.balance, formatSettlementBalance(row.balance)]),
      [
        ['a', '872', '+872'],
        ['b', '-668', '-668'],
        ['c', '-220', '-220'],
        ['d', '-8', '-8'],
        ['e', '24', '+24'],
      ],
    );
    assert.equal(rows.some((row) => row.playerId === seatedC.id), true);
    assert.equal(rows.some((row) => row.playerId === incoming.id), false);
    assert.equal(hasPositiveBalance(afterSwap), true);
  });

  it('has no rows while everyone is at 0, even if the pool is not empty', () => {
    const started = startSession({
      rules: createCustomDraft(),
      names: ['a', 'b', 'c', 'd'],
      dealerIndex: 0,
      startedAt,
    });
    const withPool = { ...started, pool: '40' };
    assert.deepEqual(settlementRows(withPool), []);
    assert.equal(hasPositiveBalance(withPool), false);
  });
});

function sessionWithNets(entries: [string, string][]) {
  const seated = entries.slice(0, 4);
  const extras = entries.slice(4);
  let session = startSession({
    rules: createCustomDraft(),
    names: seated.map(([name]) => name),
    dealerIndex: 0,
    startedAt,
  });
  session = {
    ...session,
    players: session.players.map((player, index) => ({
      ...player,
      balance: seated[index]?.[1] ?? '0',
    })),
  };
  for (const [name, balance] of extras) {
    session = addReserve(session, name);
    session = {
      ...session,
      players: session.players.map((player) =>
        player.name === name && player.balance === '0' ? { ...player, balance } : player,
      ),
    };
  }
  return session;
}
