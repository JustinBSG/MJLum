import type { Session } from './types.ts';

export type SessionRepository = {
  getOpen(): Promise<Session | null>;
  saveOpen(session: Session): Promise<void>;
  clearOpen(): Promise<void>;
};
