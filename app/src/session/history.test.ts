import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createCustomDraft } from '../rules/setup.ts';
import { recordWin } from './hand.ts';
import { reviseEntry } from './history.ts';
import { commitBoard, redoLatest, startSession, undoLatest } from './session.ts';

const startedAt = '2026-11-15T02:00:00.000Z';

describe('history', () => {
  it('redoes the undone hand until a new entry clears that branch', () => {
    const started = startSession({
      rules: createCustomDraft(),
      names: ['甲家', '乙家', '丙家', '丁家'],
      dealerIndex: 0,
      startedAt,
    });
    const recorded = recordWin(started, {
      winnerId: started.players[0]?.id ?? '',
      fan: 3,
      discarderId: started.players[1]?.id ?? '',
    });
    const undone = undoLatest(recorded);
    assert.equal(undone.players[0]?.balance, '0');
    assert.equal(undone.redo.length, 1);
    const redone = redoLatest(undone);
    assert.equal(redone.players[0]?.balance, '4');
    assert.equal(redone.redo.length, 0);
    const replaced = commitBoard(undone, '記分', { ...undone, pool: undone.pool });
    assert.equal(replaced.redo.length, 0);
  });

  it('recomputes a later hand after an earlier fan change and blocks a row with no action', () => {
    const started = startSession({
      rules: createCustomDraft(),
      names: ['甲家', '乙家', '丙家', '丁家'],
      dealerIndex: 0,
      startedAt,
    });
    const first = recordWin(started, {
      winnerId: started.players[0]?.id ?? '',
      fan: 3,
      discarderId: started.players[1]?.id ?? '',
    });
    const second = recordWin(first, {
      winnerId: first.players[2]?.id ?? '',
      fan: 3,
      discarderId: first.players[0]?.id ?? '',
    });
    const entry = second.ledger[0];
    assert.ok(entry?.action?.type === 'win');
    const revised = reviseEntry(second, entry.id, {
      type: 'win',
      input: { ...entry.action.input, fan: 4 },
    });
    assert.ok('session' in revised);
    assert.equal(revised.session.players[0]?.balance, '4');
    assert.equal(revised.session.players[1]?.balance, '-8');
    assert.equal(revised.session.players[2]?.balance, '4');
    const blocked = reviseEntry(commitBoard(second, '改名 甲甲', { ...second, players: second.players }), entry.id, {
      type: 'win',
      input: { ...entry.action.input, fan: 4 },
    });
    assert.deepEqual(blocked, { error: '未能重算「改名 甲甲」' });
  });
});
