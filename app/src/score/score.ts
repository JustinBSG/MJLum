import FractionJs from 'fraction.js';

/**
 * Exact table score. Suggested library: fraction.js (not a locked choice).
 *
 * Build a score from a decimal string or from an integer numerator and
 * denominator. A JavaScript number that is not a safe integer is rejected,
 * including a previously rounded quotient such as 32 / 3.
 *
 * Display rounding of non-terminating amounts is unspecified and is not
 * implemented here. toExact() is the reduced rational, not a screen format.
 */

const SCORE_STRING = /^[+-]?(?:\d+|\d+\.\d+|\d+\/[1-9]\d*)$/;

export class Score {
  readonly #value: FractionJs;

  private constructor(value: FractionJs) {
    this.#value = value;
  }

  static fromString(source: string): Score {
    if (typeof source !== 'string') {
      throw new TypeError(
        'A score must be built from a string or from an integer numerator and denominator.',
      );
    }
    const raw = source.trim();
    if (!SCORE_STRING.test(raw)) {
      throw new Error(`Cannot build a score from "${source}".`);
    }
    return new Score(new FractionJs(raw));
  }

  static fromRational(numerator: bigint | number, denominator: bigint | number): Score {
    const n = asInteger(numerator, 'numerator');
    const d = asInteger(denominator, 'denominator');
    if (d === 0n) {
      throw new Error('A score denominator must not be zero.');
    }
    return new Score(new FractionJs(n, d));
  }

  add(other: Score): Score {
    return new Score(this.#value.add(other.#value));
  }

  subtract(other: Score): Score {
    return new Score(this.#value.sub(other.#value));
  }

  multiply(other: Score): Score {
    return new Score(this.#value.mul(other.#value));
  }

  divide(other: Score): Score {
    if (other.#value.equals(0)) {
      throw new Error('Cannot divide a score by zero.');
    }
    return new Score(this.#value.div(other.#value));
  }

  equals(other: Score): boolean {
    return this.#value.equals(other.#value);
  }

  compare(other: Score): -1 | 0 | 1 {
    const order = this.#value.compare(other.#value);
    if (order < 0) return -1;
    if (order > 0) return 1;
    return 0;
  }

  get numerator(): bigint {
    return this.#value.s * this.#value.n;
  }

  get denominator(): bigint {
    return this.#value.d;
  }

  toExact(): string {
    return this.#value.toFraction(false);
  }
}

function asInteger(value: bigint | number, label: string): bigint {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number' && Number.isSafeInteger(value)) return BigInt(value);
  throw new TypeError(`${label} must be an integer. A rounded number cannot become a score.`);
}
