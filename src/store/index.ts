import { Course, course, db, player, Player } from '@/db';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { eq } from 'drizzle-orm';

declare module '@tanstack/react-query' {
  interface Register {
    queryKey: ['players' | 'courses', ...ReadonlyArray<unknown>];
    mutationKey: [
      'addPlayer' | 'updatePlayer' | 'deletePlayer' | 'addCourse' | 'updateCourse' | 'deleteCourse',
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
  };
}
