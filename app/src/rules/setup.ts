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
    multiplier: DEFAULT_SELF_DRAW_MULTIPLIER,
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

export function setPaymentMode(setup: RuleSetup, paymentMode: PaymentMode): RuleSetup {
  return { ...setup, paymentMode };
}

export function setPlayerFormat(setup: RuleSetup, playerFormat: PlayerFormat): RuleSetup {
  const next: RuleSetup = { ...setup, playerFormat };
  if (setup.presetId === '3fan4-full' && !setup.multiplierEdited) {
    next.multiplier = playerFormat === 'three' ? '4/3' : DEFAULT_SELF_DRAW_MULTIPLIER;
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

export function formatAmount(exact: string | null): string {
  if (exact === null) return '未有紀錄';
  const score = Score.fromString(exact);
  if (!isTerminating(score.denominator)) return score.toExact();
  return decimal(score.numerator, score.denominator);
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
  if (setup.presetId) {
    const preset = hongKongPreset(setup.presetId);
    if (setup.playerFormat === 'three' && preset.threePlayer) {
      const table = preset.threePlayer.rows;
      return Object.prototype.hasOwnProperty.call(table, fan) ? (table[fan] ?? null) : null;
    }
    return Object.prototype.hasOwnProperty.call(preset.rows, fan) ? preset.rows[fan] : null;
  }

  if (setup.customDoubling && fan >= setup.customDoubling.fan && fan <= 13) {
    return doubledAmount(setup.customDoubling.amount, fan - setup.customDoubling.fan);
  }

  return setup.rows.find((row) => row.fan === fan)?.ordinary ?? null;
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
