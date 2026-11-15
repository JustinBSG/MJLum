import { blankRoster } from './session.ts';
import type { Player, Session } from './types.ts';

export type StagedRoster = { players: Player[]; seatedIds: string[] };

let staged: StagedRoster | null = null;

/** Names and identities to prefill the next seat screen. Cleared when that session starts. */
export function stageRoster(session: Session) {
  staged = blankRoster(session);
}

export function peekRoster(): StagedRoster | null {
  return staged;
}

export function clearRoster() {
  staged = null;
}
