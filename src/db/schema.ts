import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export type Player = typeof player.$inferSelect;
export type Course = typeof course.$inferSelect;
export type Game = typeof game.$inferSelect;
export type Hole = typeof hole.$inferSelect;

export const player = sqliteTable('player', {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
});

export const course = sqliteTable('course', {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  holes: integer().notNull().default(18),
});

export const game = sqliteTable('game', {
  id: integer().primaryKey({ autoIncrement: true }),
  gameDate: text().notNull().default('CURRENT_TIMESTAMP'),
  courseId: integer()
    .notNull()
    .references(() => course.id),
});

export const hole = sqliteTable('hole', {
  id: integer().primaryKey({ autoIncrement: true }),
  hole: integer().notNull(),
  stroke: integer().notNull().default(0),
  completed: integer().notNull().default(0),
  gameId: integer()
    .notNull()
    .references(() => game.id),
  playerId: integer()
    .notNull()
    .references(() => player.id),
});
