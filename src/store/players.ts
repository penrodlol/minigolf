import { db, player, Player } from '@/db';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { asc, eq } from 'drizzle-orm';

export type PlayerStorePlayers = NonNullable<ReturnType<typeof usePlayerStore>['players']['data']>;
export type PlayerStoreSavePlayerProps = Pick<Player, 'name'> & { id: Player['id'] | undefined };
export type PlayerStoreDeletePlayerProps = Player['id'];

export const usePlayerStore = () => {
  const client = useQueryClient();

  return {
    players: useQuery({ queryKey: ['players'], queryFn: () => db.select().from(player).orderBy(asc(player.name)) }),
    savePlayer: useMutation({
      mutationKey: ['savePlayer'],
      mutationFn: async ({ id, name }: PlayerStoreSavePlayerProps) =>
        id ? await db.update(player).set({ name }).where(eq(player.id, id)) : await db.insert(player).values({ name }),
      onSuccess: () => client.invalidateQueries({ queryKey: ['players'] }),
      onError: (error) => console.error(error),
    }),
    deletePlayer: useMutation({
      mutationKey: ['deletePlayer'],
      mutationFn: async (props: PlayerStoreDeletePlayerProps) => await db.delete(player).where(eq(player.id, props)),
      onSuccess: () => client.invalidateQueries({ queryKey: ['players'] }),
      onError: (error) => console.error(error),
    }),
  };
};
