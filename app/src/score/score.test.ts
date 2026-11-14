import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Score } from './score.ts';

describe('Score', () => {
  it('keeps 32/3 exact', () => {
    const third = Score.fromRational(32, 3);
    assert.equal(third.toExact(), '32/3');
    assert.equal(third.numerator, 32n);
    assert.equal(third.denominator, 3n);
    const total = third.add(third).add(third);
    assert.equal(total.toExact(), '32');
  });

  it('rejects a previously rounded quotient', () => {
    assert.throws(() => Score.fromRational(32 / 3, 1), TypeError);
    assert.throws(() => Score.fromString(32 / 3 as unknown as string), TypeError);
  });

  it('keeps the demonstrated 15 split exact', () => {
    const fan = Score.fromString('15');
    const discarder = fan.divide(Score.fromString('2'));
    const other = fan.divide(Score.fromString('4'));
    assert.equal(discarder.toExact(), '15/2');
    assert.equal(other.toExact(), '15/4');
    assert.equal(other.toExact(), Score.fromString('3.75').toExact());
    const paid = discarder.add(other).add(other);
    assert.equal(paid.equals(fan), true);
  });

  it('keeps a self-draw multiplier exact', () => {
    const total = Score.fromString('512').multiply(Score.fromString('1.50'));
    assert.equal(total.toExact(), '768');
    const each = Score.fromString('32').divide(Score.fromString('3'));
    assert.equal(each.toExact(), '32/3');
  });

  it('keeps a negative balance exact', () => {
    const loss = Score.fromString('-3.75');
    assert.equal(loss.toExact(), '-15/4');
    assert.equal(loss.equals(Score.fromRational(-15, 4)), true);
  });
});
