import type { RuleSetup } from '../rules/types.ts';

export type Wind = 'east' | 'south' | 'west' | 'north';

export type ProgressDisplay = 'wind' | 'hand-count';

/** One badge. 連N and 冧N are different marks. */
export type DealerMark =
  | { kind: 'plain' }
  | { kind: 'consecutive'; count: number }
  | { kind: 'draw'; count: number };

export type Player = {
  id: string;
  name: string;
  avatar: string;
  /** Exact net balance. It stays with this person after they leave a seat. */
  balance: string;
  /** Session counters. Rate formulas are feature 10 and are not calculated here. */
  wins: number;
  selfDraws: number;
  discards: number;
};

export type Seat = {
  index: number;
  playerId: string | null;
};

export type BoardState = {
  players: Player[];
  seats: Seat[];
  dealerId: string | null;
  dealerMark: DealerMark;
  roundWind: Wind;
  seatWind: Wind;
  handCount: number;
  /** Exact Jackpot pool. Shown on 現時賽果 only when the rules enable Jackpot. */
  pool: string;
};

export type LedgerEntry = {
  id: string;
  label: string;
  before: BoardState;
};

export type Session = BoardState & {
  id: string;
  rules: RuleSetup;
  startedAt: string;
  progressDisplay: ProgressDisplay;
  ledger: LedgerEntry[];
};
