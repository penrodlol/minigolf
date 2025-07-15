import { sql } from 'drizzle-orm';
import { integer, SQLiteColumnBuilder, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export type Player = typeof player.$inferSelect;
export type Course = typeof course.$inferSelect;
export type Game = typeof game.$inferSelect;
export type GameHole = typeof gameHole.$inferSelect;
export type GameHolePlayer = typeof gameHolePlayer.$inferSelect;

const primaryKey = integer().primaryKey({ autoIncrement: true });
const foreignKey = (...props: Parameters<SQLiteColumnBuilder['references']>) =>
  integer()
    .notNull()
    .references(...props);

export const player = sqliteTable('player', {
  id: primaryKey,
  name: text().notNull().unique(),
});

export const course = sqliteTable('course', {
  id: primaryKey,
  name: text().notNull().unique(),
  holes: integer().notNull().default(18),
});

export const game = sqliteTable('game', {
  id: primaryKey,
  playedOn: text()
    .notNull()
    .default(sql`(current_timestamp)`),
  completed: integer({ mode: 'boolean' }).notNull().default(false),
  courseId: foreignKey(() => course.id),
});

export const gameHole = sqliteTable('game_hole', {
  id: primaryKey,
  hole: integer().notNull().default(1),
  completed: integer({ mode: 'boolean' }).notNull().default(false),
  gameId: foreignKey(() => game.id, { onDelete: 'cascade' }),
});

export const gameHolePlayer = sqliteTable('game_hole_player', {
  id: primaryKey,
  stroke: integer().notNull().default(0),
  playerId: foreignKey(() => player.id, { onDelete: 'cascade' }),
  gameHoleId: foreignKey(() => gameHole.id, { onDelete: 'cascade' }),
});
