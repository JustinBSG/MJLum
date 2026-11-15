import { Score } from '../score/score.ts';

import { DEFAULT_SELF_DRAW_MULTIPLIER, hongKongPreset } from './presets.ts';
import type { FanRow, PaymentMode, PlayerFormat, RuleSetup } from './types.ts';

const FULL_DISCARD: PaymentMode = 'full-discard';

export function createPresetDraft(presetId: string): RuleSetup {
  const preset = hongKongPreset(presetId);
  const draft: RuleSetup = {
    id: createId('preset'),
    origin: 'preset',
    presetId: preset.id,
    name: preset.name,
    playerFormat: preset.playerFormat,
    paymentMode: FULL_DISCARD,
    minFan: preset.minFan,
    maxFan: preset.maxFan,
    multiplier: preset.multiplier ?? DEFAULT_SELF_DRAW_MULTIPLIER,
    multiplierEdited: false,
    jackpotEnabled: false,
    jackpotContribution: '0',
    trackDealer: true,
    passDealerOnDraw: true,
    rows: [],
    customDoubling: null,
  };
  return rebuildRows(draft);
}

export function createCustomDraft(): RuleSetup {
  const draft: RuleSetup = {
    id: createId('custom'),
    origin: 'custom',
    presetId: null,
    name: '新玩法',
    playerFormat: 'four',
    paymentMode: FULL_DISCARD,
    minFan: 3,
    maxFan: 8,
    multiplier: DEFAULT_SELF_DRAW_MULTIPLIER,
    multiplierEdited: false,
    jackpotEnabled: false,
    jackpotContribution: '0',
    trackDealer: true,
    passDealerOnDraw: true,
    rows: [],
    customDoubling: { fan: 3, amount: '4' },
  };
  return rebuildRows(draft);
}

export function setName(setup: RuleSetup, name: string): RuleSetup {
  return { ...setup, name };
}

const RULE_NAME_LIMIT = 40;

/** Trimmed, required, and at most 40 visible characters. */
export function prepareRuleName(name: string): { name: string } | { error: string } {
  const trimmed = name.trim();
  if (trimmed === '') return { error: '請填寫玩法名稱' };
  if ([...trimmed].length > RULE_NAME_LIMIT) return { error: '玩法名稱最多40個字' };
  return { name: trimmed };
}

/**
 * Empty cells past the generated range. 14番 and above are never generated.
 * A hole inside a recorded table, such as an unshown fan, does not block the session.
 */
export function missingHighFans(setup: RuleSetup): number[] {
  const ceiling = amountCeiling(setup);
  return setup.rows.filter((row) => row.fan > ceiling && !row.ordinary).map((row) => row.fan);
}

function amountCeiling(setup: RuleSetup): number {
  if (setup.presetId === '12-full' || setup.presetId === '3fan4-half-three' || setup.customDoubling) return 13;
  if (setup.presetId) return hongKongPreset(setup.presetId).maxFan;
  return 13;
}

export function setPaymentMode(setup: RuleSetup, paymentMode: PaymentMode): RuleSetup {
  return { ...setup, paymentMode };
}

export function setPlayerFormat(setup: RuleSetup, playerFormat: PlayerFormat): RuleSetup {
  const next: RuleSetup = { ...setup, playerFormat };
  // Only the demonstrated 3番4辣辣上 three-player form uses 4/3.
  // Another preset, including 3番4半辣上（三人） at 3/2, keeps its own multiplier.
  if (setup.presetId === '3fan4-full') {
    next.rows = [];
    if (!setup.multiplierEdited) {
      next.multiplier = playerFormat === 'three' ? '4/3' : DEFAULT_SELF_DRAW_MULTIPLIER;
    }
  }
  return rebuildRows(next);
}

export function setFanRange(setup: RuleSetup, minFan: number, maxFan: number): RuleSetup {
  if (!Number.isInteger(minFan) || !Number.isInteger(maxFan)) {
    throw new TypeError('起糊 and 滿糊 must be whole fan numbers.');
  }
  if (minFan < 0 || maxFan < minFan) return setup;
  return rebuildRows({ ...setup, minFan, maxFan });
}

export function setMultiplier(setup: RuleSetup, source: string): RuleSetup {
  return {
    ...setup,
    multiplier: Score.fromString(source).toExact(),
    multiplierEdited: true,
  };
}

export function setJackpotEnabled(setup: RuleSetup, enabled: boolean): RuleSetup {
  return { ...setup, jackpotEnabled: enabled };
}

export function setJackpotContribution(setup: RuleSetup, source: string): RuleSetup {
  return { ...setup, jackpotContribution: Score.fromString(source).toExact() };
}

export function setTrackDealer(setup: RuleSetup, enabled: boolean): RuleSetup {
  return { ...setup, trackDealer: enabled };
}

export function setPassDealerOnDraw(setup: RuleSetup, enabled: boolean): RuleSetup {
  return { ...setup, passDealerOnDraw: enabled };
}

/**
 * Edits one 食糊分數. Later fans stay as they are.
 * Above fan 13, the ordinary amount stays empty until it is entered here.
 */
export function setOrdinary(setup: RuleSetup, fan: number, source: string): RuleSetup {
  const ordinary = Score.fromString(source).toExact();
  if (!setup.rows.some((row) => row.fan === fan)) return setup;
  return {
    ...setup,
    customDoubling: null,
    rows: setup.rows.map((row) => (row.fan === fan ? { fan, ordinary } : row)),
  };
}

export function selfDrawAmount(setup: RuleSetup, fan: number): string | null {
  const row = setup.rows.find((item) => item.fan === fan);
  if (!row?.ordinary) return null;
  return Score.fromString(row.ordinary).multiply(Score.fromString(setup.multiplier)).toExact();
}

/** One opponent's share of the self-draw total. Three-player tables have two payers. */
export function selfDrawShare(setup: RuleSetup, fan: number): string | null {
  const total = selfDrawAmount(setup, fan);
  if (!total) return null;
  const payers = setup.playerFormat === 'three' ? 2 : 3;
  return Score.fromString(total).divide(Score.fromRational(payers, 1)).toExact();
}

/** Exact text for an amount being edited or inspected. A non-terminating value stays a fraction. */
export function formatAmount(exact: string | null): string {
  if (exact === null) return '未有紀錄';
  const score = Score.fromString(exact);
  if (!isTerminating(score.denominator)) return score.toExact();
  return decimal(score.numerator, score.denominator);
}

/**
 * Main-screen money. Terminating values drop trailing zeros.
 * Any other value is rounded half away from zero to two decimal places and marked ≈.
 * The rounded text is never written back into the ledger.
 */
export function formatDisplay(exact: string | null): string {
  if (exact === null) return '未有紀錄';
  const score = Score.fromString(exact);
  if (isTerminating(score.denominator)) {
    const text = decimal(score.numerator, score.denominator);
    const places = text.split('.')[1]?.length ?? 0;
    if (places <= 2) return text;
  }
  const rounded = roundPlaces(score, 2);
  const text = decimal(rounded.numerator, rounded.denominator);
  return isTerminating(score.denominator) ? text : `≈${text}`;
}

function roundPlaces(score: Score, places: number): Score {
  const scale = 10n ** BigInt(places);
  const negative = score.compare(Score.fromString('0')) < 0;
  const absNum = score.numerator < 0n ? -score.numerator : score.numerator;
  const scaledNum = absNum * scale;
  const whole = scaledNum / score.denominator;
  const remainder = scaledNum % score.denominator;
  const digits = whole + (remainder * 2n >= score.denominator ? 1n : 0n);
  const signed = negative && digits !== 0n ? -digits : digits;
  return Score.fromRational(signed, scale);
}

/**
 * Multiplier chip. ×1.50 and ×2.00 match the opened chips.
 * ×1.33 is the recorded label for the demonstrated 4/3 three-player multiplier,
 * not a general rounding rule for table scores.
 */
export function formatMultiplier(exact: string): string {
  if (exact === '3/2') return '1.50';
  if (exact === '2' || exact === '2/1') return '2.00';
  if (exact === '4/3') return '1.33';
  return formatAmount(exact);
}

function rebuildRows(setup: RuleSetup): RuleSetup {
  const rows: FanRow[] = [];
  for (let fan = setup.minFan; fan <= setup.maxFan; fan += 1) {
    rows.push({ fan, ordinary: ordinaryFor(setup, fan) });
  }
  return { ...setup, rows };
}

function ordinaryFor(setup: RuleSetup, fan: number): string | null {
  const existing = setup.rows.find((row) => row.fan === fan);
  if (existing) return existing.ordinary;

  if (setup.presetId) {
    const preset = hongKongPreset(setup.presetId);
    if (setup.playerFormat === 'three' && preset.threePlayer) {
      const table = preset.threePlayer.rows;
      if (Object.prototype.hasOwnProperty.call(table, fan)) return table[fan] ?? null;
    } else if (Object.prototype.hasOwnProperty.call(preset.rows, fan)) {
      return preset.rows[fan];
    }
    return extendedPresetAmount(preset.id, fan);
  }

  if (setup.customDoubling && fan >= setup.customDoubling.fan && fan <= 13) {
    return doubledAmount(setup.customDoubling.amount, fan - setup.customDoubling.fan);
  }

  return setup.rows.find((row) => row.fan === fan)?.ordinary ?? null;
}

/** 9–13番 only, from the opened 3–8 amounts. A typed cell is never replaced by this. */
function extendedPresetAmount(presetId: string, fan: number): string | null {
  if (fan < 9 || fan > 13) return null;
  if (presetId === '12-full') return doubledAmount('32', fan - 3);
  if (presetId === '3fan4-half-three') {
    if (fan % 2 === 0) return doubledAmount('6', (fan - 4) / 2);
    return doubledAmount('9', (fan - 5) / 2);
  }
  return null;
}

function doubledAmount(start: string, steps: number): string {
  let amount = Score.fromString(start);
  const two = Score.fromString('2');
  for (let index = 0; index < steps; index += 1) {
    amount = amount.multiply(two);
  }
  return amount.toExact();
}

function isTerminating(denominator: bigint): boolean {
  let rest = denominator < 0n ? -denominator : denominator;
  while (rest % 2n === 0n) rest /= 2n;
  while (rest % 5n === 0n) rest /= 5n;
  return rest === 1n;
}

function decimal(numerator: bigint, denominator: bigint): string {
  const negative = numerator < 0n;
  const den = denominator < 0n ? -denominator : denominator;
  const abs = numerator < 0n ? -numerator : numerator;
  let scale = 0n;
  let factor = den;
  while (factor % 2n === 0n) {
    factor /= 2n;
    scale += 1n;
  }
  while (factor % 5n === 0n) {
    factor /= 5n;
    scale += 1n;
  }
  const unit = 10n ** scale;
  const scaled = (abs * unit) / den;
  const whole = scaled / unit;
  const fraction = (scaled % unit).toString().padStart(Number(scale), '0').replace(/0+$/, '');
  const text = fraction.length === 0 ? whole.toString() : `${whole}.${fraction}`;
  return negative ? `-${text}` : text;
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
