import { parseSession, serializeSession } from './document.ts';
import type { SessionRepository } from './repository-types.ts';
import type { Session } from './types.ts';

export function createMemorySessionRepository(open: Session | null = null): SessionRepository {
  let current = open ? clone(open) : null;
  const archived: Session[] = [];
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
    async archiveOpen() {
      if (!current) return;
      const stored = clone(current);
      const index = archived.findIndex((item) => item.id === stored.id);
      if (index === -1) archived.push(stored);
      else archived[index] = stored;
      current = null;
    },
    async listArchived() {
      return archived.map(clone);
    },
    async saveArchived(session: Session) {
      const stored = clone(session);
      const index = archived.findIndex((item) => item.id === stored.id);
      if (index === -1) archived.push(stored);
      else archived[index] = stored;
    },
    async deleteArchived(id: string) {
      const index = archived.findIndex((item) => item.id === id);
      if (index >= 0) archived.splice(index, 1);
    },
  };
}

function clone(session: Session): Session {
  return parseSession(serializeSession(session));
}
