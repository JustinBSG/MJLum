import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseRuleSetup, serializeRuleSetup } from './document.ts';
import { createMemoryRuleRepository } from './memory-repository.ts';
import { createCustomDraft, setOrdinary } from './setup.ts';

describe('saved rule setups', () => {
  it('round-trips an edited custom setup through its stored document', () => {
    const setup = setOrdinary(createCustomDraft(), 3, '15');
    const restored = parseRuleSetup(serializeRuleSetup(setup));
    assert.equal(restored.rows.find((row) => row.fan === 3)?.ordinary, '15');
    assert.equal(restored.customDoubling, null);
    assert.equal(restored.rows.find((row) => row.fan === 7)?.ordinary, '64');
  });

  it('keeps a saved setup and a separate one-off active setup', async () => {
    const repository = createMemoryRuleRepository();
    const saved = createCustomDraft();
    const once = createCustomDraft();
    await repository.save(saved);
    await repository.setActive(once);

    const listed = await repository.listSaved();
    assert.equal(listed.length, 1);
    assert.equal(listed[0]?.id, saved.id);
    assert.equal((await repository.getActive())?.id, once.id);

    await repository.deleteSaved(saved.id);
    assert.deepEqual(await repository.listSaved(), []);
    assert.equal((await repository.getActive())?.id, once.id);
  });
});
