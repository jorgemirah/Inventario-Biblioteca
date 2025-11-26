
import { InventorySession, InventoryItem } from '../types';
import { generateId } from '../utils/helpers';

const STORAGE_KEY = 'BIBLIOTRACK_SESSIONS';

export const getSessions = (): InventorySession[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load sessions", e);
    return [];
  }
};

export const saveSession = (session: InventorySession) => {
  const sessions = getSessions();
  const index = sessions.findIndex(s => s.id === session.id);
  
  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.push(session);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

export const deleteSession = (sessionId: string) => {
  const sessions = getSessions().filter(s => s.id !== sessionId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

export const createSession = (
  name: string,
  sede: any,
  coleccion: any
): InventorySession => {
  const newSession: InventorySession = {
    id: generateId(),
    name,
    sede,
    coleccion,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    items: []
  };
  saveSession(newSession);
  return newSession;
};
