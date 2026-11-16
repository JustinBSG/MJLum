export type DiceSeat = '自家' | '下家' | '對家' | '上家';

export const MIN_DICE = 1;
export const MAX_DICE = 9;

export type DiceRoll = {
  count: number;
  faces: number[];
  total: number;
  seat: DiceSeat;
};

const SEATS: DiceSeat[] = ['上家', '自家', '下家', '對家'];

/** remainder of the total modulo 4: 1 自家, 2 下家, 3 對家, 0 上家. */
export function seatLabelForTotal(total: number): DiceSeat {
  if (!Number.isInteger(total) || total < 1) {
    throw new Error('A dice total must be a positive integer.');
  }
  return SEATS[total % 4]!;
}

export function clampDiceCount(count: number): number {
  if (!Number.isInteger(count)) return MIN_DICE;
  if (count < MIN_DICE) return MIN_DICE;
  if (count > MAX_DICE) return MAX_DICE;
  return count;
}

export function rollDice(count: number, face: () => number = randomFace): DiceRoll {
  const n = clampDiceCount(count);
  const faces = Array.from({ length: n }, () => {
    const value = face();
    if (!Number.isInteger(value) || value < 1 || value > 6) {
      throw new Error('A die face must be an integer from 1 to 6.');
    }
    return value;
  });
  const total = faces.reduce((sum, value) => sum + value, 0);
  return { count: n, faces, total, seat: seatLabelForTotal(total) };
}

function randomFace(): number {
  return 1 + Math.floor(Math.random() * 6);
}
