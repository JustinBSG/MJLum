export type DiceSeat = '自家' | '下家' | '對家' | '上家';

const SEATS: DiceSeat[] = ['上家', '自家', '下家', '對家'];

/** remainder of the total modulo 4: 1 自家, 2 下家, 3 對家, 0 上家. */
export function seatLabelForTotal(total: number): DiceSeat {
  if (!Number.isInteger(total) || total < 1) {
    throw new Error('A dice total must be a positive integer.');
  }
  return SEATS[total % 4]!;
}
