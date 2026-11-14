import { parseRuleSetup, serializeRuleSetup } from './document.ts';
import type { RuleRepository } from './repository-types.ts';
import type { RuleSetup } from './types.ts';

type Memory = {
  saved: RuleSetup[];
  active: RuleSetup | null;
};

export function createMemoryRuleRepository(memory: Memory = { saved: [], active: null }): RuleRepository {
  return {
    async listSaved() {
      return memory.saved.map(cloneSetup);
    },
    async save(setup: RuleSetup) {
      const stored = cloneSetup(setup);
      const index = memory.saved.findIndex((item) => item.id === stored.id);
      if (index === -1) memory.saved.push(stored);
      else memory.saved[index] = stored;
    },
    async deleteSaved(id: string) {
      memory.saved = memory.saved.filter((item) => item.id !== id);
    },
    async getActive() {
      return memory.active ? cloneSetup(memory.active) : null;
    },
    async setActive(setup: RuleSetup) {
      memory.active = cloneSetup(setup);
    },
  };
}

function cloneSetup(setup: RuleSetup): RuleSetup {
  return parseRuleSetup(serializeRuleSetup(setup));
}
