import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createCustomDraft } from '../rules/setup.ts';
import { parseSession, serializeSession } from './document.ts';
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
  });
});
