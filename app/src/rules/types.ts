export type PlayerFormat = 'four' | 'three';

export type PaymentMode = 'full-discard' | 'half-discard';

export type RuleFamilyId = 'hong-kong' | 'taiwan' | 'japanese' | 'pak-kong' | 'hk-taiwan';

export type FanRow = {
  fan: number;
  /** Exact 食糊分數. Null means the row is in range but no amount is recorded or entered. */
  ordinary: string | null;
};

export type RuleSetup = {
  id: string;
  origin: 'preset' | 'custom';
  presetId: string | null;
  name: string;
  playerFormat: PlayerFormat;
  paymentMode: PaymentMode;
  minFan: number;
  maxFan: number;
  /** Exact 自摸倍數. */
  multiplier: string;
  multiplierEdited: boolean;
  jackpotEnabled: boolean;
  /** Exact 流局 contribution. The field is hidden while Jackpot is off. */
  jackpotContribution: string;
  trackDealer: boolean;
  passDealerOnDraw: boolean;
  rows: FanRow[];
  /**
   * Present only while a new 新玩法 still follows the demonstrated doubling table.
   * Cleared when an ordinary-win cell is edited, so later fans are not recalculated.
   */
  customDoubling: { fan: number; amount: string } | null;
};

export type RuleFamily = {
  id: RuleFamilyId;
  label: string;
  /** Hong Kong is the only family with a recorded score table. */
  recorded: boolean;
};

export type HongKongPreset = {
  id: string;
  name: string;
  playerFormat: PlayerFormat;
  minFan: number;
  maxFan: number;
  captionMinFan: number;
  captionMinAmount: string;
  captionMaxFan: number;
  captionMaxAmount: string;
  /**
   * Opened ordinary-win amounts, keyed by fan.
   * A missing key was not recorded. Do not invent it.
   */
  rows: Readonly<Record<number, string>>;
  opened: boolean;
  /**
   * Demonstrated 3番4辣辣上 rows when the same preset is used as 三人麻雀.
   * A null amount is a fan inside that range that was not shown.
   */
  threePlayer?: {
    multiplier: string;
    rows: Readonly<Record<number, string | null>>;
  };
};
