import { idb } from '../services/indexedDB';

const IDB_KEY = 'time_tracker_state';

export const indexedDBStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const data = await idb.get<string>(IDB_KEY);
      if (data) return data;
    } catch {
      // fallback to localStorage
    }
    return localStorage.getItem(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await idb.set(IDB_KEY, value);
    } catch {
      localStorage.setItem(name, value);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await idb.remove(IDB_KEY);
    } catch {
      localStorage.removeItem(name);
    }
  },
};
