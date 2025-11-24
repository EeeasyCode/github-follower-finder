import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { GitHubUser } from './github';

interface FollowerSnapshot {
  username: string;
  timestamp: number;
  followers: GitHubUser[];
}

interface DailyHistory {
  date: string; // YYYY-MM-DD
  count: number;
}

interface MyDB extends DBSchema {
  snapshots: {
    key: string; // username
    value: FollowerSnapshot;
  };
  history: {
    key: string; // [username, date] compound key or just unique ID? 
    // Let's use a simpler approach: Store history array in a separate object store keyed by username
    value: {
      username: string;
      records: DailyHistory[];
    };
  };
}

const DB_NAME = 'github-followers-db';
const STORE_NAME = 'snapshots';
const HISTORY_STORE = 'history';

export class StorageService {
  private dbPromise: Promise<IDBPDatabase<MyDB>>;

  constructor() {
    this.dbPromise = openDB<MyDB>(DB_NAME, 2, {
      upgrade(db, _oldVersion, _newVersion, _transaction) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'username' });
      }
      if (!db.objectStoreNames.contains(HISTORY_STORE)) {
        db.createObjectStore(HISTORY_STORE, { keyPath: 'username' });
      }
    },
    });
  }

  async saveSnapshot(username: string, followers: GitHubUser[]): Promise<void> {
    const db = await this.dbPromise;
    await db.put(STORE_NAME, {
      username,
      timestamp: Date.now(),
      followers,
    });
    
    // Also save daily history
    await this.saveDailyHistory(username, followers.length);
  }

  async getSnapshot(username: string): Promise<FollowerSnapshot | undefined> {
    const db = await this.dbPromise;
    return db.get(STORE_NAME, username);
  }

  async saveDailyHistory(username: string, count: number): Promise<void> {
    const db = await this.dbPromise;
    // Use local date to ensure "today" matches the user's perspective
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
    
    const existing = await db.get(HISTORY_STORE, username);
    let records = existing ? existing.records : [];

    // Remove today's entry if exists (to update it)
    records = records.filter(r => r.date !== today);
    
    // Add today's entry
    records.push({ date: today, count });

    // Sort by date
    records.sort((a, b) => a.date.localeCompare(b.date));

    // Keep only last 7 days
    if (records.length > 7) {
      records = records.slice(records.length - 7);
    }

    await db.put(HISTORY_STORE, {
      username,
      records
    });
  }

  async getHistory(username: string): Promise<DailyHistory[]> {
    const db = await this.dbPromise;
    const entry = await db.get(HISTORY_STORE, username);
    return entry ? entry.records : [];
  }
}

export const storage = new StorageService();
