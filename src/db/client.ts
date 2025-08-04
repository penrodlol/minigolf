import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

export const sqlite = openDatabaseSync('minigolf.db', { enableChangeListener: true });
sqlite.execSync('PRAGMA journal_mode = WAL');
sqlite.execSync('PRAGMA foreign_keys = ON');
export const db = drizzle(sqlite, { schema });
