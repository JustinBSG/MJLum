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
  /** W. Valid 食糊, including 自摸. A 詐糊 does not count. */
  wins: number;
  /** Z. Valid 自摸, including 出銃者包自摸. */
  selfDraws: number;
  /** D. Valid 出銃 events. One 一炮多響 is one event. */
  discards: number;
  /** H. Completed normal hands while seated, including a normal 流局. */
  hands: number;
  /** F. Sum of scoring fans on this player's valid wins. */
  fanSum: number;
  /** L. Sum of every winner's scoring fan on this player's 出銃 events. */
  discardFanSum: number;
  /** Current automatic 留莊 streak. A manual 莊家設定 does not raise it. */
  dealerStreak: number;
  /** Longest automatic 留莊 streak. 冧莊王 needs at least 3. */
  bestDealerStreak: number;
  /** When set, this person's table money is posted to that player. Statistics stay here. */
  billToId?: string;
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
  /** Rules that replace `rules` on the next confirmed hand. Earlier hands stay on the old rules. */
  pendingRules?: RuleSetup;
  startedAt: string;
  progressDisplay: ProgressDisplay;
  ledger: LedgerEntry[];
  /** Pool moved out of this session and waiting for the next one to claim it. */
  outboundPool?: string;
};
