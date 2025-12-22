const SESSIONS_STORAGE_KEY = "cyberpunk_active_sessions";

export interface HackSession {
  targetIP: string;
  startTime: number;
  dataSize: number;
  accessLevel: string;
}

export const getActiveSessions = (): HackSession[] => {
  try {
    const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn("Failed to load active sessions", e);
  }
  return [];
};

export const addSession = (session: HackSession): void => {
  try {
    const sessions = getActiveSessions();
    const filtered = sessions.filter((s) => s.targetIP !== session.targetIP);
    filtered.push(session);
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn("Failed to save session", e);
  }
};

export const removeSession = (targetIP: string): boolean => {
  try {
    const sessions = getActiveSessions();
    const filtered = sessions.filter((s) => s.targetIP !== targetIP);
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(filtered));
    return sessions.length > filtered.length;
  } catch (e) {
    console.warn("Failed to remove session", e);
  }
  return false;
};

export const clearAllSessions = (): void => {
  try {
    localStorage.removeItem(SESSIONS_STORAGE_KEY);
  } catch (e) {
    console.warn("Failed to clear sessions", e);
  }
};

export const hasActiveSession = (targetIP?: string): boolean => {
  const sessions = getActiveSessions();
  if (targetIP) {
    return sessions.some((s) => s.targetIP === targetIP);
  }
  return sessions.length > 0;
};

export const getSession = (targetIP: string): HackSession | null => {
  const sessions = getActiveSessions();
  return sessions.find((s) => s.targetIP === targetIP) || null;
};
