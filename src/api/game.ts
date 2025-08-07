import { db, Game, game, gameHole, gameHolePlayer, GameHolePlayer, player, Player } from '@/db';
import { asc, eq, inArray, sql, SQL } from 'drizzle-orm';

export type GameAPI_GET_Game_Props = Game['id'];
export type GameAPI_GET_Game = Awaited<ReturnType<typeof getGame>>;
export type GameAPI_POST_SaveGameHolePlayers_Props = Record<GameHolePlayer['id'], GameHolePlayer['stroke']>;
export type GameAPI_POST_SaveGame_Props = Game['id'];
export type GameAPI_Util_GetGamePlayers = ReturnType<typeof util_getGamePlayers>;
export type GameAPI_Util_AllHolesComplete = ReturnType<typeof util_allHolesComplete>;
export type GameAPI_Util_GetGameHoleProps = { game: GameAPI_GET_Game; hole: string };
export type GameAPI_Util_GetGameHole = ReturnType<typeof util_getGameHole>;
export type GameAPI_Util_GetGameLeaderboard = ReturnType<typeof util_getGameLeaderboard>;

export const getGame = async (props: GameAPI_GET_Game_Props) =>
  db.query.game.findFirst({
    where: eq(game.id, props),
    with: {
      course: { with: { courseCompany: true } },
      gameHoles: { with: { gameHolePlayer: { with: { player: true } } }, orderBy: asc(gameHole.hole) },
    },
  });

export const saveGameHolePlayers = async (props: GameAPI_POST_SaveGameHolePlayers_Props) => {
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
};

export const saveGame = async (props: GameAPI_POST_SaveGame_Props) =>
  db.transaction(async (tx) => {
    await tx.update(game).set({ completed: true }).where(eq(game.id, props));
    const leaderboard = util_getGameLeaderboard(await getGame(props));
    await tx
      .update(player)
      .set({ wins: sql`${player.wins} + 1` })
      .where(eq(player.id, leaderboard[0]?.id));
  });

export const util_getGamePlayers = (props: GameAPI_GET_Game) =>
  props?.gameHoles[0].gameHolePlayer.sort((a, b) => a.player.name.localeCompare(b.player.name));

export const util_allHolesComplete = (props: GameAPI_GET_Game) =>
  !!props?.gameHoles
    .filter((hole) => hole.hole !== props?.gameHoles.length)
    .every((hole) => hole.gameHolePlayer.every((player) => player.stroke > 0));

export const util_getGameHole = (props: GameAPI_Util_GetGameHoleProps) =>
  props.game?.gameHoles.find((h) => h.hole === Number(props.hole));

export const util_getGameLeaderboard = (props: GameAPI_GET_Game) => {
  const payload = props?.gameHoles.reduce(
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
};
