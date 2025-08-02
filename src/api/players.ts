import { db, Player, player } from '@/db';
import { asc, eq } from 'drizzle-orm';

export type PlayersAPI_GET_Players = Awaited<ReturnType<typeof getPlayers>>;
export type PlayersAPI_POST_SavePlayer_Props = { id?: Player['id']; name: Player['name'] };
export type PlayersAPI_DELETE_DeletePlayer_Props = Player['id'];

export const getPlayers = async () => db.select().from(player).orderBy(asc(player.name));

export const savePlayer = async (props: PlayersAPI_POST_SavePlayer_Props) =>
  props.id
    ? db.update(player).set({ name: props.name }).where(eq(player.id, props.id))
    : db.insert(player).values({ name: props.name });

export const deletePlayer = async (props: PlayersAPI_DELETE_DeletePlayer_Props) =>
  db.delete(player).where(eq(player.id, props));
