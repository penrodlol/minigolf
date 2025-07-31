import { db, game, gameHole, player } from '@/db';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { asc, desc } from 'drizzle-orm';

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
  };
};
