import { parseSession, serializeSession } from './document.ts';
import type { SessionRepository } from './repository-types.ts';
import type { Session } from './types.ts';

export function createMemorySessionRepository(open: Session | null = null): SessionRepository {
  let current = open ? clone(open) : null;
  return {
    async getOpen() {
      return current ? clone(current) : null;
    },
    async saveOpen(session: Session) {
      current = clone(session);
    },
    async clearOpen() {
      current = null;
    },
  };
}

function clone(session: Session): Session {
  return parseSession(serializeSession(session));
}
