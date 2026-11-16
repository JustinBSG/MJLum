import type { RuleSetup } from './types.ts';

export type RuleRepository = {
  listSaved(): Promise<RuleSetup[]>;
  save(setup: RuleSetup): Promise<void>;
  deleteSaved(id: string): Promise<void>;
  getActive(): Promise<RuleSetup | null>;
  setActive(setup: RuleSetup): Promise<void>;
};
