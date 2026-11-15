import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createCustomDraft } from '../rules/setup.ts';
import { parseSession, serializeSession } from './document.ts';
import { recordWin } from './hand.ts';
import { createMemorySessionRepository } from './memory-repository.ts';
import { addReserve, startSession, substitute, undoLatest } from './session.ts';

describe('open session store', () => {
  it('round-trips a substitution and still undoes it', () => {
    const session = startSession({
      rules: createCustomDraft(),
      names: ['甲家', '乙家', '丙家', '丁家'],
      dealerIndex: 0,
      startedAt: '2026-11-15T02:00:00.000Z',
    });
    const withReserve = addReserve(session, '戊家');
    const incoming = withReserve.players.at(-1);
    assert.ok(incoming);
    const swapped = substitute(withReserve, incoming.id, 0);
    const restored = undoLatest(parseSession(serializeSession(swapped)));
    assert.equal(restored.seats[0]?.playerId, session.players[0]?.id);
    assert.equal(restored.players.at(-1)?.name, '戊家');
    assert.equal(restored.players.at(-1)?.balance, '0');
  });

  it('keeps one open session and can clear it', async () => {
    const repository = createMemorySessionRepository();
    const session = startSession({
      rules: createCustomDraft(),
      names: ['甲家', '乙家', '丙家', '丁家'],
      dealerIndex: 1,
      startedAt: '2026-11-15T02:00:00.000Z',
    });
    await repository.saveOpen(session);
    assert.equal((await repository.getOpen())?.id, session.id);
    await repository.clearOpen();
    assert.equal(await repository.getOpen(), null);
    assert.deepEqual(await repository.listArchived(), []);
  });
});

describe('archived session store', () => {
  it('copies the open session into history and then clears it', async () => {
    const repository = createMemorySessionRepository();
    const started = startSession({
      rules: createCustomDraft(),
      names: ['甲家', '乙家', '丙家', '丁家'],
      dealerIndex: 0,
      startedAt: '2026-11-15T02:00:00.000Z',
    });
    const winner = started.players[0];
    const discarder = started.players[1];
    assert.ok(winner && discarder);
    const session = recordWin(started, { winnerId: winner.id, fan: 5, discarderId: discarder.id });
    await repository.saveOpen(session);
    await repository.archiveOpen();
    assert.equal(await repository.getOpen(), null);
    const archived = await repository.listArchived();
    assert.equal(archived.length, 1);
    const stored = archived[0];
    assert.ok(stored);
    assert.equal(stored.id, session.id);
    assert.equal(stored.startedAt, session.startedAt);
    assert.equal(stored.players[0]?.balance, session.players[0]?.balance);
    assert.equal(stored.players[1]?.balance, session.players[1]?.balance);
    assert.equal(stored.players[0]?.wins, session.players[0]?.wins);
    assert.equal(stored.ledger.length, session.ledger.length);
    assert.equal(stored.pool, session.pool);
  });

  it('does not invent a history row when nothing is open', async () => {
    const repository = createMemorySessionRepository();
    await repository.archiveOpen();
    assert.equal(await repository.getOpen(), null);
    assert.deepEqual(await repository.listArchived(), []);
  });

  it('keeps earlier archives when a later session is archived', async () => {
    const repository = createMemorySessionRepository();
    const first = startSession({
      rules: createCustomDraft(),
      names: ['甲家', '乙家', '丙家', '丁家'],
      dealerIndex: 0,
      startedAt: '2026-11-15T02:00:00.000Z',
    });
    const second = startSession({
      rules: createCustomDraft(),
      names: ['戊家', '己家', '庚家', '辛家'],
      dealerIndex: 1,
      startedAt: '2026-11-15T03:00:00.000Z',
    });
    await repository.saveOpen(first);
    await repository.archiveOpen();
    await repository.saveOpen(second);
    await repository.archiveOpen();
    const archived = await repository.listArchived();
    assert.deepEqual(
      archived.map((session) => session.id),
      [first.id, second.id],
    );
    assert.equal(await repository.getOpen(), null);
  });
});
