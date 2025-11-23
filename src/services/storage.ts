import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { GitHubUser } from './github';

interface FollowerSnapshot {
  username: string;
  timestamp: number;
  followers: GitHubUser[];
}

interface MyDB extends DBSchema {
  snapshots: {
    key: string; // username
    value: FollowerSnapshot;
  };
}

const DB_NAME = 'github-followers-db';
const STORE_NAME = 'snapshots';

export class StorageService {
  private dbPromise: Promise<IDBPDatabase<MyDB>>;

  constructor() {
    this.dbPromise = openDB<MyDB>(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME, { keyPath: 'username' });
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
  }

  async getSnapshot(username: string): Promise<FollowerSnapshot | undefined> {
    const db = await this.dbPromise;
    return db.get(STORE_NAME, username);
  }
}

export const storage = new StorageService();
