import { db, game, Game, gameHole, gameHolePlayer, GameHolePlayer } from '@/db';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { asc, eq, inArray, sql, SQL } from 'drizzle-orm';

export type GameStoreGame = NonNullable<ReturnType<typeof useGameStore>>['game']['data'];
export type GameStoreSaveGameHolePlayersProps = Record<GameHolePlayer['id'], GameHolePlayer['stroke']>;

export const useGameStore = (id: Game['id']) => {
  const client = useQueryClient();

  return {
    client,
    game: useQuery({
      queryKey: ['game', id],
      queryFn: async () =>
        db.query.game.findFirst({
          where: eq(game.id, id),
          with: {
            course: { with: { courseCompany: true } },
            gameHoles: { with: { gameHolePlayer: { with: { player: true } } }, orderBy: asc(gameHole.hole) },
          },
        }),
    }),
    saveGameHolePlayers: useMutation({
      mutationKey: ['saveGameHolePlayers'],
      mutationFn: async (props: GameStoreSaveGameHolePlayersProps) => {
        const chunks: Array<SQL> = [];
        const ids: Array<GameHolePlayer['id']> = [];

        chunks.push(sql`(case`);
        for (const [id, stroke] of Object.entries(props)) {
          chunks.push(sql`when ${gameHolePlayer.id} = ${id} then ${stroke}`);
          ids.push(Number(id));
        }
        chunks.push(sql`end)`);

        await db
          .update(gameHolePlayer)
          .set({ stroke: sql.join(chunks, sql.raw(' ')) })
          .where(inArray(gameHolePlayer.id, ids));
      },
      onSuccess: () => client.invalidateQueries({ queryKey: ['game', id] }),
      onError: (error) => console.error(error),
    }),
  };
};
