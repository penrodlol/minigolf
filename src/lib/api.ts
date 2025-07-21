import { db, Player, player } from '@/db';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { asc, eq } from 'drizzle-orm';

declare module '@tanstack/react-query' {
  interface Register {
    queryKey: ['players' | 'courses', ...ReadonlyArray<unknown>];
    mutationKey: ['savePlayer' | 'deletePlayer', ...ReadonlyArray<unknown>];
  }
}

export const usePlayers = () =>
  useQuery({ queryKey: ['players'], queryFn: async () => db.select().from(player).orderBy(asc(player.name)) });

export const useCourses = () =>
  useQuery({ queryKey: ['courses'], queryFn: async () => db.select().from(player).orderBy(asc(player.name)) });

export const useSavePlayer = () => {
  const client = useQueryClient();
  return useMutation({
    mutationKey: ['savePlayer'],
    mutationFn: async (payload: { id: Player['id'] | undefined; name: Player['name'] }) =>
      payload.id
        ? await db.update(player).set({ name: payload.name }).where(eq(player.id, payload.id))
        : await db.insert(player).values({ name: payload.name }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['players'] }),
    onError: (error) => console.error(error),
  });
};

export const useDeletePlayer = () => {
  const client = useQueryClient();
  return useMutation({
    mutationKey: ['deletePlayer'],
    mutationFn: async (id: Player['id']) => await db.delete(player).where(eq(player.id, id)),
    onSuccess: () => client.invalidateQueries({ queryKey: ['players'] }),
    onError: (error) => console.error(error),
  });
};
