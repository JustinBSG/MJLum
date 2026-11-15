import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { HONG_KONG_PRESETS } from './presets.ts';
import {
  createCustomDraft,
  createPresetDraft,
  formatAmount,
  formatMultiplier,
  missingHighFans,
  prepareRuleName,
  selfDrawAmount,
  setFanRange,
  setJackpotContribution,
  setJackpotEnabled,
  setMultiplier,
  setOrdinary,
  setPlayerFormat,
} from './setup.ts';

function row(setup: ReturnType<typeof createPresetDraft>, fan: number) {
  return setup.rows.find((item) => item.fan === fan);
}

describe('Hong Kong presets', () => {
  it('lists every recorded preset family', () => {
    assert.deepEqual(
      HONG_KONG_PRESETS.map((preset) => preset.name),
      [
        '3番4 半辣上',
        '3番4 辣辣上',
        '二五雞 半辣上',
        '二五雞 辣辣上',
        '五一 半辣上',
        '五一 辣辣上',
        '一二蚊 半辣上',
        '一二蚊 辣辣上',
        '3番4 半辣上（三人）',
      ],
    );
  });

  it('uses the opened 五一辣辣上 rows, including the extension to 13', () => {
    const setup = setFanRange(createPresetDraft('51-full'), 3, 13);
    assert.equal(row(setup, 3)?.ordinary, '16');
    assert.equal(selfDrawAmount(setup, 3), '24');
    assert.equal(row(setup, 8)?.ordinary, '512');
    assert.equal(selfDrawAmount(setup, 8), '768');
    assert.equal(row(setup, 13)?.ordinary, '16384');
    assert.equal(selfDrawAmount(setup, 13), '24576');
  });

  it('keeps 3番4辣辣上 doubling from fan 0 through fan 13', () => {
    const setup = setFanRange(createPresetDraft('3fan4-full'), 0, 13);
    assert.equal(formatAmount(row(setup, 0)?.ordinary ?? null), '0.5');
    assert.equal(formatAmount(selfDrawAmount(setup, 0)), '0.75');
    assert.equal(formatAmount(row(setup, 1)?.ordinary ?? null), '1');
    assert.equal(formatAmount(selfDrawAmount(setup, 1)), '1.5');
    assert.equal(row(setup, 8)?.ordinary, '128');
    assert.equal(selfDrawAmount(setup, 8), '192');
    assert.equal(row(setup, 13)?.ordinary, '4096');
    assert.equal(selfDrawAmount(setup, 13), '6144');
  });

  it('does not invent 二五雞辣辣上 rows above the opened 3–8 table', () => {
    const setup = setFanRange(createPresetDraft('25-full'), 3, 9);
    assert.equal(row(setup, 8)?.ordinary, '256');
    assert.equal(row(setup, 9)?.ordinary, null);
  });

  it('keeps 半辣上 rows that are not a double of the previous fan', () => {
    const setup = setFanRange(createPresetDraft('3fan4-half'), 3, 13);
    assert.equal(row(setup, 5)?.ordinary, '12');
    assert.equal(selfDrawAmount(setup, 5), '18');
    assert.equal(row(setup, 13)?.ordinary, '192');
  });

  it('uses the opened 一二蚊半辣上 table from fan 0', () => {
    const setup = setFanRange(createPresetDraft('12-half'), 0, 13);
    assert.equal(row(setup, 0)?.ordinary, '4');
    assert.equal(row(setup, 5)?.ordinary, '96');
    assert.equal(row(setup, 7)?.ordinary, '192');
    assert.equal(row(setup, 13)?.ordinary, '1536');
    assert.equal(selfDrawAmount(setup, 13), '2304');
  });

  it('uses the opened 3–8 rows for 一二蚊辣辣上 and 3番4半辣上（三人）', () => {
    const spicy = createPresetDraft('12-full');
    assert.deepEqual(
      [3, 4, 5, 6, 7, 8].map((fan) => row(spicy, fan)?.ordinary),
      ['32', '64', '128', '256', '512', '1024'],
    );
    assert.deepEqual(
      [3, 4, 5, 6, 7, 8].map((fan) => selfDrawAmount(spicy, fan)),
      ['48', '96', '192', '384', '768', '1536'],
    );
    const extended = setFanRange(spicy, 3, 9);
    assert.equal(row(extended, 9)?.ordinary, null);

    const three = createPresetDraft('3fan4-half-three');
    assert.equal(three.playerFormat, 'three');
    assert.deepEqual(
      [3, 4, 5, 6, 7, 8].map((fan) => row(three, fan)?.ordinary),
      ['3', '6', '9', '12', '18', '24'],
    );
    assert.equal(row(setFanRange(three, 3, 9), 9)?.ordinary, null);
    assert.equal(formatMultiplier(three.multiplier), '1.50');
    assert.equal(formatAmount(selfDrawAmount(three, 3)), '4.5');
    assert.equal(formatAmount(selfDrawAmount(three, 5)), '13.5');
    assert.equal(formatAmount(selfDrawAmount(three, 8)), '36');
    assert.equal(formatMultiplier(setPlayerFormat(createCustomDraft(), 'three').multiplier), '1.50');
  });

  it('uses the demonstrated three-player 3番4辣辣上 rows', () => {
    const setup = setPlayerFormat(createPresetDraft('3fan4-full'), 'three');
    assert.equal(formatMultiplier(setup.multiplier), '1.33');
    assert.equal(row(setup, 3)?.ordinary, '3');
    assert.equal(selfDrawAmount(setup, 3), '4');
    assert.equal(row(setup, 6)?.ordinary, '24');
    assert.equal(selfDrawAmount(setup, 6), '32');
    assert.equal(row(setup, 7)?.ordinary, null);
    assert.equal(row(setup, 8)?.ordinary, '96');
    assert.equal(selfDrawAmount(setup, 8), '128');
  });
});

describe('custom 新玩法', () => {
  it('starts at 3番 4 and doubles through the default 8番 cap', () => {
    const setup = createCustomDraft();
    assert.equal(setup.name, '新玩法');
    assert.equal(setup.paymentMode, 'full-discard');
    assert.equal(row(setup, 3)?.ordinary, '4');
    assert.equal(selfDrawAmount(setup, 3), '6');
    assert.equal(row(setup, 6)?.ordinary, '32');
    assert.equal(selfDrawAmount(setup, 6), '48');
    assert.equal(row(setup, 8)?.ordinary, '128');
    assert.equal(selfDrawAmount(setup, 8), '192');
  });

  it('keeps doubling through fan 13 and leaves fan 14 unrecorded', () => {
    const through13 = setFanRange(createCustomDraft(), 3, 13);
    assert.equal(row(through13, 13)?.ordinary, '4096');
    assert.equal(selfDrawAmount(through13, 13), '6144');

    const through14 = setFanRange(createCustomDraft(), 3, 14);
    assert.equal(row(through14, 13)?.ordinary, '4096');
    assert.equal(row(through14, 14)?.ordinary, null);
    assert.equal(selfDrawAmount(through14, 14), null);
    assert.deepEqual(missingHighFans(through14), [14]);
    assert.deepEqual(missingHighFans(through13), []);
    assert.deepEqual(prepareRuleName('  新玩法  '), { name: '新玩法' });
    assert.deepEqual(prepareRuleName('   '), { error: '請填寫玩法名稱' });
    assert.equal('error' in prepareRuleName('番'.repeat(41)), true);
  });

  it('keeps an edited preset cell when 滿糊 rises', () => {
    const edited = setOrdinary(createPresetDraft('3fan4-half'), 5, '20');
    const extended = setFanRange(edited, 3, 9);
    assert.equal(row(extended, 5)?.ordinary, '20');
    assert.equal(row(extended, 6)?.ordinary, '16');
    assert.equal(row(extended, 9)?.ordinary, '48');
  });

  it('does not recalculate later fans after one cell is edited', () => {
    const edited = setOrdinary(setFanRange(createCustomDraft(), 3, 8), 6, '64');
    assert.equal(row(edited, 6)?.ordinary, '64');
    assert.equal(row(edited, 7)?.ordinary, '64');
    assert.equal(selfDrawAmount(edited, 7), '96');

    const extended = setFanRange(edited, 3, 9);
    assert.equal(row(extended, 7)?.ordinary, '64');
    assert.equal(row(extended, 9)?.ordinary, null);
  });

  it('updates only the self-draw column when 自摸倍數 changes', () => {
    const setup = setFanRange(setMultiplier(createPresetDraft('3fan4-full'), '2'), 1, 4);
    assert.equal(formatMultiplier(setup.multiplier), '2.00');
    assert.equal(row(setup, 1)?.ordinary, '1');
    assert.equal(selfDrawAmount(setup, 1), '2');
    assert.equal(selfDrawAmount(setup, 2), '4');
    assert.equal(selfDrawAmount(setup, 3), '8');
    assert.equal(selfDrawAmount(setup, 4), '16');
  });

  it('reads a typed Jackpot contribution of 010 as 10', () => {
    const setup = setJackpotContribution(setJackpotEnabled(createCustomDraft(), true), '010');
    assert.equal(setup.jackpotEnabled, true);
    assert.equal(setup.jackpotContribution, '10');
  });
});
