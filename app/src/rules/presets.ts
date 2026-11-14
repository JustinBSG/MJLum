import { Score } from '../score/score.ts';

import type { HongKongPreset, RuleFamily } from '@/rules/types';

export const RULE_FAMILIES: readonly RuleFamily[] = [
  { id: 'hong-kong', label: '香港', recorded: true },
  { id: 'taiwan', label: '台灣麻將', recorded: false },
  { id: 'japanese', label: '日本麻雀', recorded: false },
  { id: 'pak-kong', label: '碰槓牌（跑馬仔）', recorded: false },
  { id: 'hk-taiwan', label: '港式台灣麻將', recorded: false },
];

const DEFAULT_MULTIPLIER = '3/2';

/**
 * Doubling is used only where the opened 辣辣上 table, or the default 新玩法,
 * was recorded as doubling. 半辣上 tables are listed row by row below.
 */
function doubledRows(firstFan: number, firstAmount: string, lastFan: number): Record<number, string> {
  const rows: Record<number, string> = {};
  let amount = Score.fromString(firstAmount);
  const two = Score.fromString('2');
  for (let fan = firstFan; fan <= lastFan; fan += 1) {
    rows[fan] = amount.toExact();
    amount = amount.multiply(two);
  }
  return rows;
}

function listedRows(entries: readonly (readonly [number, string])[]): Record<number, string> {
  return Object.fromEntries(entries);
}

export const HONG_KONG_PRESETS: readonly HongKongPreset[] = [
  {
    id: '3fan4-half',
    name: '3番4 半辣上',
    playerFormat: 'four',
    minFan: 3,
    maxFan: 8,
    captionMinFan: 3,
    captionMinAmount: '4',
    captionMaxFan: 8,
    captionMaxAmount: '32',
    opened: true,
    rows: listedRows([
      [3, '4'],
      [4, '8'],
      [5, '12'],
      [6, '16'],
      [7, '24'],
      [8, '32'],
      [9, '48'],
      [10, '64'],
      [11, '96'],
      [12, '128'],
      [13, '192'],
    ]),
  },
  {
    id: '3fan4-full',
    name: '3番4 辣辣上',
    playerFormat: 'four',
    minFan: 3,
    maxFan: 8,
    captionMinFan: 3,
    captionMinAmount: '4',
    captionMaxFan: 8,
    captionMaxAmount: '128',
    opened: true,
    rows: doubledRows(0, '1/2', 13),
    threePlayer: {
      multiplier: '4/3',
      rows: {
        3: '3',
        4: '6',
        5: '12',
        6: '24',
        7: null,
        8: '96',
      },
    },
  },
  {
    id: '25-half',
    name: '二五雞 半辣上',
    playerFormat: 'four',
    minFan: 3,
    maxFan: 8,
    captionMinFan: 3,
    captionMinAmount: '8',
    captionMaxFan: 8,
    captionMaxAmount: '64',
    opened: true,
    rows: listedRows([
      [3, '8'],
      [4, '16'],
      [5, '24'],
      [6, '32'],
      [7, '48'],
      [8, '64'],
      [9, '96'],
      [10, '128'],
      [11, '192'],
      [12, '256'],
      [13, '384'],
    ]),
  },
  {
    id: '25-full',
    name: '二五雞 辣辣上',
    playerFormat: 'four',
    minFan: 3,
    maxFan: 8,
    captionMinFan: 3,
    captionMinAmount: '8',
    captionMaxFan: 8,
    captionMaxAmount: '256',
    opened: true,
    rows: doubledRows(3, '8', 8),
  },
  {
    id: '51-half',
    name: '五一 半辣上',
    playerFormat: 'four',
    minFan: 3,
    maxFan: 8,
    captionMinFan: 3,
    captionMinAmount: '16',
    captionMaxFan: 8,
    captionMaxAmount: '128',
    opened: true,
    rows: listedRows([
      [3, '16'],
      [4, '32'],
      [5, '48'],
      [6, '64'],
      [7, '96'],
      [8, '128'],
      [9, '192'],
      [10, '256'],
      [11, '384'],
      [12, '512'],
      [13, '768'],
    ]),
  },
  {
    id: '51-full',
    name: '五一 辣辣上',
    playerFormat: 'four',
    minFan: 3,
    maxFan: 8,
    captionMinFan: 3,
    captionMinAmount: '16',
    captionMaxFan: 8,
    captionMaxAmount: '512',
    opened: true,
    rows: doubledRows(3, '16', 13),
  },
  {
    id: '12-half',
    name: '一二蚊 半辣上',
    playerFormat: 'four',
    minFan: 3,
    maxFan: 8,
    captionMinFan: 3,
    captionMinAmount: '32',
    captionMaxFan: 8,
    captionMaxAmount: '256',
    opened: true,
    rows: listedRows([
      [0, '4'],
      [1, '8'],
      [2, '16'],
      [3, '32'],
      [4, '64'],
      [5, '96'],
      [6, '128'],
      [7, '192'],
      [8, '256'],
      [9, '384'],
      [10, '512'],
      [11, '768'],
      [12, '1024'],
      [13, '1536'],
    ]),
  },
  {
    id: '12-full',
    name: '一二蚊 辣辣上',
    playerFormat: 'four',
    minFan: 3,
    maxFan: 8,
    captionMinFan: 3,
    captionMinAmount: '32',
    captionMaxFan: 8,
    captionMaxAmount: '1024',
    opened: false,
    rows: { 3: '32', 8: '1024' },
  },
  {
    id: '3fan4-half-three',
    name: '3番4 半辣上（三人）',
    playerFormat: 'three',
    minFan: 3,
    maxFan: 8,
    captionMinFan: 3,
    captionMinAmount: '3',
    captionMaxFan: 8,
    captionMaxAmount: '24',
    opened: false,
    rows: { 3: '3', 8: '24' },
  },
];

export const DEFAULT_SELF_DRAW_MULTIPLIER = DEFAULT_MULTIPLIER;

export function hongKongPreset(id: string): HongKongPreset {
  const preset = HONG_KONG_PRESETS.find((item) => item.id === id);
  if (!preset) throw new Error(`Unknown Hong Kong preset "${id}".`);
  return preset;
}

export function presetCaption(preset: HongKongPreset): string {
  return `${preset.captionMinFan}番 ${preset.captionMinAmount} · ${preset.captionMaxFan}番 ${preset.captionMaxAmount}`;
}
