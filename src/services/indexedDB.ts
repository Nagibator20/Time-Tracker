const DB_NAME = 'time_tracker_db';
const DB_VERSION = 1;
const STORE_NAME = 'app_data';

interface AppDataRecord {
  id: string;
  value: unknown;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

async function getStore(mode: IDBTransactionMode = 'readonly'): Promise<{ db: IDBDatabase; store: IDBObjectStore }> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, mode);
  const store = tx.objectStore(STORE_NAME);
  return { db, store };
}

export const idb = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const { db, store } = await getStore('readonly');
      return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => {
          resolve((request.result as AppDataRecord | undefined)?.value as T ?? null);
          db.close();
        };
        request.onerror = () => reject(request.error);
      });
    } catch {
      return null;
    }
  },

  async set(key: string, value: unknown): Promise<void> {
    const { db, store } = await getStore('readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put({ id: key, value });
      request.onsuccess = () => {
        db.close();
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  },

  async remove(key: string): Promise<void> {
    const { db, store } = await getStore('readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => {
        db.close();
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  },

  async clear(): Promise<void> {
    const { db, store } = await getStore('readwrite');
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => {
        db.close();
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  },

  async getAllKeys(): Promise<string[]> {
    try {
      const { db, store } = await getStore('readonly');
      return new Promise((resolve, reject) => {
        const request = store.getAllKeys();
        request.onsuccess = () => {
          resolve(request.result as string[]);
          db.close();
        };
        request.onerror = () => reject(request.error);
      });
    } catch {
      return [];
    }
  },
};
