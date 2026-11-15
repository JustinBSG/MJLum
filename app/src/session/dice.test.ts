import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { seatLabelForTotal } from './dice.ts';

describe('dice seat label', () => {
  it('matches the demonstrated totals, including 下家 for remainder 2', () => {
    assert.equal(seatLabelForTotal(35), '對家');
    assert.equal(seatLabelForTotal(29), '自家');
    assert.equal(seatLabelForTotal(20), '上家');
    assert.equal(seatLabelForTotal(13), '自家');
    assert.equal(seatLabelForTotal(9), '自家');
    assert.equal(seatLabelForTotal(3), '對家');
    assert.equal(seatLabelForTotal(2), '下家');
    assert.equal(seatLabelForTotal(6), '下家');
  });
});
