import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { clampDiceCount, rollDice, seatLabelForTotal } from './dice.ts';

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

describe('dice roll', () => {
  it('rolls 1 to 9 dice, totals the faces, and keeps the seat label', () => {
    const faces = [6, 6, 6, 6, 6, 5];
    let index = 0;
    const rolled = rollDice(6, () => faces[index++] ?? 1);
    assert.deepEqual(rolled.faces, faces);
    assert.equal(rolled.count, 6);
    assert.equal(rolled.total, 35);
    assert.equal(rolled.seat, '對家');
  });

  it('clamps the count to 1–9', () => {
    assert.equal(clampDiceCount(0), 1);
    assert.equal(clampDiceCount(1), 1);
    assert.equal(clampDiceCount(9), 9);
    assert.equal(clampDiceCount(10), 9);
    const rolled = rollDice(12, () => 1);
    assert.equal(rolled.count, 9);
    assert.equal(rolled.total, 9);
    assert.equal(rolled.seat, '自家');
  });
});
