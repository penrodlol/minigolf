import { db, game, Game, gameHole, gameHolePlayer, GameHolePlayer, player, Player } from '@/db';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { asc, eq, inArray, sql, SQL } from 'drizzle-orm';

export type GameStoreGame = NonNullable<ReturnType<typeof useGameStore>>['game']['data'];
export type GameStoreSaveGameHolePlayersProps = Record<GameHolePlayer['id'], GameHolePlayer['stroke']>;
export type GameStoreSaveGameProp = Pick<Game, 'id'> & {
  strokes: GameStoreSaveGameHolePlayersProps;
  winner: Player['id'];
};

export const useGameStore = (id: Game['id']) => {
  const client = useQueryClient();
  const gameData = useQuery({
    queryKey: ['game', id],
    queryFn: async () =>
      db.query.game.findFirst({
        where: eq(game.id, id),
        with: {
          course: { with: { courseCompany: true } },
          gameHoles: { with: { gameHolePlayer: { with: { player: true } } }, orderBy: asc(gameHole.hole) },
        },
      }),
  });

  return {
    client,
    game: gameData,
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
    saveGame: useMutation({
      mutationKey: ['saveGame'],
      mutationFn: async (props: GameStoreSaveGameProp) =>
        db.transaction(async (tx) => {
          await tx.update(game).set({ completed: true }).where(eq(game.id, props.id));
          await tx
            .update(player)
            .set({ wins: sql`${player.wins} + 1` })
            .where(eq(player.id, props.winner));
        }),
      onSuccess: () => client.invalidateQueries({ queryKey: ['game', id] }),
      onError: (error) => console.error(error),
    }),
    utils: {
      getHole: (game: (typeof gameData)['data'], holeNumber: string) =>
        game?.gameHoles.find((h) => h.hole === Number(holeNumber)),
      getAllHolesComplete: (game: (typeof gameData)['data']) =>
        game?.gameHoles
          .filter((hole) => hole.hole !== game?.gameHoles.length)
          .every((hole) => hole.gameHolePlayer.every((player) => player.stroke > 0)),
      getLeaderBoard: (game: (typeof gameData)['data']) => {
        const payload = game?.gameHoles.reduce(
          (acc, hole) => {
            hole.gameHolePlayer.forEach(({ player, stroke }) => {
              if (!acc[player.id]) acc[player.id] = { name: player.name, strokes: 0 };
              acc[player.id].strokes += stroke;
            });
            return acc;
          },
          {} as Record<Player['id'], Pick<Player, 'name'> & { strokes: GameHolePlayer['stroke'] }>,
        );

        return Object.entries(payload ?? {})
          .sort(([, a], [, b]) => a.strokes - b.strokes)
          .map(([id, { name, strokes }]) => ({ id: Number(id), name, strokes }));
      },
    },
  };
};
