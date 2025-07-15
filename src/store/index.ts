import { Course, course, db, game, gameHole, gameHolePlayer, player, Player } from '@/db';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { eq } from 'drizzle-orm';

declare module '@tanstack/react-query' {
  interface Register {
    queryKey: ['players' | 'courses' | 'games' | 'game' | 'holes', ...ReadonlyArray<unknown>];
    mutationKey: [
      (
        | 'addPlayer'
        | 'updatePlayer'
        | 'deletePlayer'
        | 'addCourse'
        | 'updateCourse'
        | 'deleteCourse'
        | 'addGame'
        | 'deleteGame'
      ),
      ...ReadonlyArray<unknown>,
    ];
  }
}

export function useStore() {
  const client = useQueryClient();

  return {
    client,
    players: useQuery({ queryKey: ['players'], queryFn: () => db.query.player.findMany() }),
    courses: useQuery({ queryKey: ['courses'], queryFn: () => db.query.course.findMany() }),
    games: useQuery({ queryKey: ['games'], queryFn: () => db.query.game.findMany() }),
    addPlayer: useMutation({
      mutationKey: ['addPlayer'],
      mutationFn: async (name: Player['name']) => db.insert(player).values({ name }),
      onSuccess: () => client.invalidateQueries({ queryKey: ['players'] }),
    }),
    updatePlayer: useMutation({
      mutationKey: ['updatePlayer'],
      mutationFn: async (playerData: Player) => db.update(player).set(playerData).where(eq(player.id, playerData.id)),
      onSuccess: () => client.invalidateQueries({ queryKey: ['players'] }),
    }),
    deletePlayer: useMutation({
      mutationKey: ['deletePlayer'],
      mutationFn: async (id: Player['id']) => db.delete(player).where(eq(player.id, id)),
      onSuccess: () => client.invalidateQueries({ queryKey: ['players'] }),
    }),
    addCourse: useMutation({
      mutationKey: ['addCourse'],
      mutationFn: async (data: Pick<Course, 'name' | 'holes'>) => db.insert(course).values(data),
      onSuccess: () => client.invalidateQueries({ queryKey: ['courses'] }),
    }),
    updateCourse: useMutation({
      mutationKey: ['updateCourse'],
      mutationFn: async (courseData: Course) => db.update(course).set(courseData).where(eq(course.id, courseData.id)),
      onSuccess: () => client.invalidateQueries({ queryKey: ['courses'] }),
    }),
    deleteCourse: useMutation({
      mutationKey: ['deleteCourse'],
      mutationFn: async (id: Course['id']) => db.delete(course).where(eq(course.id, id)),
      onSuccess: () => client.invalidateQueries({ queryKey: ['courses'] }),
    }),
    addGame: useMutation({
      mutationKey: ['addGame'],
      mutationFn: async (gameData: { course: Course; players: Array<Player['id']> }) => {
        await db.transaction(async (transaction) => {
          const newGame = transaction.insert(game).values({ courseId: gameData.course.id }).returning().get();
          const newGameHoleId = transaction.insert(gameHole).values({ gameId: newGame.id }).returning().get();
          await transaction
            .insert(gameHolePlayer)
            .values(gameData.players.map((playerId) => ({ playerId, gameHoleId: newGameHoleId.id })));
        });
      },
      onSuccess: () => client.invalidateQueries({ queryKey: ['games'] }),
    }),
    deleteGame: useMutation({
      mutationKey: ['deleteGame'],
      mutationFn: async (id: number) => db.delete(game).where(eq(game.id, id)),
      onSuccess: () => client.invalidateQueries({ queryKey: ['games'] }),
    }),
  };
}
