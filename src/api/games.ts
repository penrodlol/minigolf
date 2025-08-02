import { Course, course, db, Game, game, gameHole, gameHolePlayer, Player, player } from '@/db';
import { asc, desc, eq } from 'drizzle-orm';

export type GamesAPI_GET_TopPlayers = Awaited<ReturnType<typeof getTopPlayers>>;
export type GamesAPI_GET_Games = Awaited<ReturnType<typeof getGames>>;
export type GamesAPI_POST_SaveGame_Props = { courseId: Course['id']; playerIds: Array<Player['id']> };
export type GamesAPI_DELETE_DeleteGame_Props = Game['id'];

export const getTopPlayers = async () => db.select().from(player).orderBy(desc(player.wins)).limit(3);

export const getGames = async () =>
  db.query.game.findMany({
    with: {
      course: { with: { courseCompany: true } },
      gameHoles: { limit: 1, with: { gameHolePlayer: { with: { player: true } } }, orderBy: [asc(gameHole.hole)] },
    },
    orderBy: [asc(game.completed), desc(game.playedOn)],
  });

export const saveGame = async (props: GamesAPI_POST_SaveGame_Props) =>
  db.transaction(async (tx) => {
    const newGame = tx.insert(game).values({ courseId: props.courseId }).returning().get();
    if (!newGame.courseId) return tx.rollback();

    const newGameCourse = tx.select().from(course).where(eq(course.id, newGame.courseId)).get();
    if (!newGameCourse) return tx.rollback();

    const newGameHoles = await tx
      .insert(gameHole)
      .values(Array.from({ length: newGameCourse.holes }, (_, i) => ({ gameId: newGame.id, hole: i + 1 })))
      .returning();
    if (newGameHoles.length !== newGameCourse.holes) return tx.rollback();

    await tx
      .insert(gameHolePlayer)
      .values(props.playerIds.map((playerId) => newGameHoles.map(({ id }) => ({ gameHoleId: id, playerId }))).flat());
  });

export const deleteGame = async (props: GamesAPI_DELETE_DeleteGame_Props) => db.delete(game).where(eq(game.id, props));
