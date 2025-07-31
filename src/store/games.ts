import { course, db, Game, game, gameHole, gameHolePlayer, Player, player } from '@/db';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { asc, desc, eq } from 'drizzle-orm';

export type GameStoreTopPlayers = NonNullable<ReturnType<typeof useGamesStore>['topPlayers']['data']>;
export type GameStoreGames = NonNullable<ReturnType<typeof useGamesStore>['games']['data']>;
export type GameStoreSaveGameProps = { id?: Game['id']; courseId: Game['courseId']; playerIds: Array<Player['id']> };
export type GameStoreDeleteGameProps = Game['id'];

export const useGamesStore = () => {
  const client = useQueryClient();

  return {
    client,
    topPlayers: useQuery({
      queryKey: ['topPlayers'],
      queryFn: () => db.select().from(player).orderBy(desc(player.wins)).limit(3),
    }),
    games: useQuery({
      queryKey: ['games'],
      queryFn: () =>
        db.query.game.findMany({
          with: {
            course: { with: { courseCompany: true } },
            gameHoles: {
              limit: 1,
              with: { gameHolePlayer: { with: { player: true } } },
              orderBy: [asc(gameHole.completed), asc(gameHole.hole)],
            },
          },
          orderBy: [asc(game.completed), desc(game.playedOn)],
        }),
    }),
    addGame: useMutation({
      mutationKey: ['addGame'],
      mutationFn: async ({ id, courseId, playerIds }: GameStoreSaveGameProps) => {
        if (id) {
        } else {
          await db.transaction(async (tx) => {
            const newGame = tx.insert(game).values({ courseId }).returning().get();
            const newGameCourse = tx.select().from(course).where(eq(course.id, newGame.courseId)).get();
            if (!newGameCourse) return tx.rollback();

            const newGameHoles = await tx
              .insert(gameHole)
              .values(Array.from({ length: newGameCourse.holes }, (_, i) => ({ gameId: newGame.id, hole: i + 1 })))
              .returning();
            if (newGameHoles.length !== newGameCourse.holes) return tx.rollback();

            await tx
              .insert(gameHolePlayer)
              .values(playerIds.map((playerId) => newGameHoles.map(({ id }) => ({ gameHoleId: id, playerId }))).flat());
          });
        }
      },
      onSuccess: () => client.invalidateQueries({ queryKey: ['games'] }),
      onError: (error) => console.error(error),
    }),
    deleteGame: useMutation({
      mutationKey: ['deleteGame'],
      mutationFn: async (props: GameStoreDeleteGameProps) => db.delete(game).where(eq(game.id, props)),
      onSuccess: () => client.invalidateQueries({ queryKey: ['games'] }),
      onError: (error) => console.error(error),
    }),
  };
};
