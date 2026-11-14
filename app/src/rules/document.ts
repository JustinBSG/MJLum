import { Score } from '../score/score.ts';

import type { FanRow, PaymentMode, PlayerFormat, RuleSetup } from './types.ts';

export function serializeRuleSetup(setup: RuleSetup): string {
  return JSON.stringify(setup);
}

export function parseRuleSetup(source: string): RuleSetup {
  const raw: unknown = JSON.parse(source);
  if (!isRecord(raw)) throw new Error('A saved rules setup is unreadable.');

  const rows = arrayOf(raw.rows, 'rows').map(parseRow);
  const doubling = raw.customDoubling === null ? null : parseDoubling(raw.customDoubling);

  return {
    id: text(raw.id, 'id'),
    origin: raw.origin === 'preset' || raw.origin === 'custom' ? raw.origin : fail('origin'),
    presetId: raw.presetId === null ? null : text(raw.presetId, 'presetId'),
    name: text(raw.name, 'name'),
    playerFormat: playerFormat(raw.playerFormat),
    paymentMode: paymentMode(raw.paymentMode),
    minFan: whole(raw.minFan, 'minFan'),
    maxFan: whole(raw.maxFan, 'maxFan'),
    multiplier: exact(raw.multiplier, 'multiplier'),
    multiplierEdited: flag(raw.multiplierEdited, 'multiplierEdited'),
    jackpotEnabled: flag(raw.jackpotEnabled, 'jackpotEnabled'),
    jackpotContribution: exact(raw.jackpotContribution, 'jackpotContribution'),
    trackDealer: flag(raw.trackDealer, 'trackDealer'),
    passDealerOnDraw: flag(raw.passDealerOnDraw, 'passDealerOnDraw'),
    rows,
    customDoubling: doubling,
  };
}

function parseRow(value: unknown): FanRow {
  if (!isRecord(value)) fail('row');
  return {
    fan: whole(value.fan, 'fan'),
    ordinary: value.ordinary === null ? null : exact(value.ordinary, 'ordinary'),
  };
}

function parseDoubling(value: unknown): { fan: number; amount: string } {
  if (!isRecord(value)) fail('customDoubling');
  return { fan: whole(value.fan, 'customDoubling.fan'), amount: exact(value.amount, 'customDoubling.amount') };
}

function exact(value: unknown, label: string): string {
  return Score.fromString(text(value, label)).toExact();
}

function text(value: unknown, label: string): string {
  if (typeof value !== 'string') fail(label);
  return value;
}

function whole(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) fail(label);
  return value;
}

function flag(value: unknown, label: string): boolean {
  if (typeof value !== 'boolean') fail(label);
  return value;
}

function playerFormat(value: unknown): PlayerFormat {
  if (value === 'four' || value === 'three') return value;
  return fail('playerFormat');
}

function paymentMode(value: unknown): PaymentMode {
  if (value === 'full-discard' || value === 'half-discard') return value;
  return fail('paymentMode');
}

function arrayOf(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) fail(label);
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function fail(label: string): never {
  throw new Error(`A saved rules setup is missing ${label}.`);
}
