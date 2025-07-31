import { relations, sql } from 'drizzle-orm';
import { integer, SQLiteColumnBuilder, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export type Player = typeof player.$inferSelect;
export type CourseCompany = typeof courseCompany.$inferSelect;
export type Course = typeof course.$inferSelect;
export type Game = typeof game.$inferSelect;
export type GameHole = typeof gameHole.$inferSelect;
export type GameHolePlayer = typeof gameHolePlayer.$inferSelect;

const primaryKey = integer().primaryKey({ autoIncrement: true });
const foreignKey = (...props: Parameters<SQLiteColumnBuilder['references']>) =>
  integer()
    .notNull()
    .references(...props);

// ==================================================================
//                              TABLES
// ==================================================================

export const player = sqliteTable('player', {
  id: primaryKey,
  name: text().notNull().unique(),
  wins: integer().notNull().default(0),
  holeInOnes: integer().notNull().default(0),
});

export const courseCompany = sqliteTable('course_company', {
  id: primaryKey,
  name: text().notNull().unique(),
});

export const course = sqliteTable('course', {
  id: primaryKey,
  name: text().notNull().unique(),
  holes: integer().notNull().default(18),
  location: text().notNull(),
  courseCompanyId: foreignKey(() => courseCompany.id),
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
  playerId: foreignKey(() => player.id),
  gameHoleId: foreignKey(() => gameHole.id, { onDelete: 'cascade' }),
});

// ==================================================================
//                            RELATIONS
// ==================================================================

export const courseCompanyRelations = relations(courseCompany, ({ many }) => ({
  courses: many(course),
}));

export const courseRelations = relations(course, ({ one }) => ({
  courseCompany: one(courseCompany, { fields: [course.courseCompanyId], references: [courseCompany.id] }),
}));

export const gameRelations = relations(game, ({ one, many }) => ({
  course: one(course, { fields: [game.courseId], references: [course.id] }),
  gameHoles: many(gameHole),
}));

export const gameHoleRelations = relations(gameHole, ({ one, many }) => ({
  game: one(game, { fields: [gameHole.gameId], references: [game.id] }),
  gameHolePlayer: many(gameHolePlayer),
}));

export const gameHolePlayerRelations = relations(gameHolePlayer, ({ one }) => ({
  player: one(player, { fields: [gameHolePlayer.playerId], references: [player.id] }),
  gameHole: one(gameHole, { fields: [gameHolePlayer.gameHoleId], references: [gameHole.id] }),
}));
