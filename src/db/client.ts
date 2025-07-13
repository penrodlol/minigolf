import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import { z } from 'zod/v4';
import * as schema from './schema';

export const dbName = z.string().parse(process.env.EXPO_PUBLIC_DB_NAME);
export const sqlite = openDatabaseSync(dbName, { enableChangeListener: true });
export const db = drizzle(sqlite, { schema });
