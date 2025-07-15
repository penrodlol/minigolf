import { course, db, game, GameHole, gameHole, GameHolePlayer, gameHolePlayer, Player, player } from '@/db';
import { useQuery } from '@tanstack/react-query';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Text, View } from 'react-native';
import { z } from 'zod/v4';

export default function GameHoleScreen() {
  const params = useLocalSearchParams();
  const id = useMemo(() => z.coerce.number().parse(params.id), [params.id]);

  const gameAndCourse = useQuery({
    queryKey: ['game'],
    queryFn: () => db.select().from(game).leftJoin(course, eq(game.courseId, course.id)).where(eq(game.id, id)).get(),
  });

  const holes = useQuery({
    queryKey: ['holes'],
    queryFn: () =>
      db
        .select()
        .from(gameHole)
        .leftJoin(gameHolePlayer, eq(gameHole.id, gameHolePlayer.gameHoleId))
        .leftJoin(player, eq(gameHolePlayer.playerId, player.id))
        .where(eq(gameHole.gameId, id))
        .all()
        .reduce(
          (acc, row) => {
            const hole = acc.find((h) => h.id === row.game_hole.id);
            if (hole) hole.players.push({ ...row.game_hole_player!, player: row.player! });
            else acc.push({ ...row.game_hole, players: [{ ...row.game_hole_player!, player: row.player! }] });
            return acc;
          },
          [] as Array<GameHole & { players: Array<GameHolePlayer & { player: Player }> }>,
        ),
  });

  return (
    <View>
      <View style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
        <Text>Game:</Text>
        <Text>{gameAndCourse.data?.game.id}</Text>
        <Text>{gameAndCourse.data?.game.playedOn}</Text>
        <Text>{gameAndCourse.data?.game.completed.toString()}</Text>
      </View>
      <View style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
        <Text>Course:</Text>
        <Text>{gameAndCourse.data?.course?.id}</Text>
        <Text>{gameAndCourse.data?.course?.name}</Text>
        <Text>{gameAndCourse.data?.course?.holes}</Text>
      </View>
      <View style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Text>Holes:</Text>
        <FlatList
          data={holes.data ?? []}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
              <Text>{item.id}</Text>
              <Text>{item.hole}</Text>
              <Text>{item.completed.toString()}</Text>
              <FlatList
                data={item.players}
                keyExtractor={(player) => player.id.toString()}
                renderItem={({ item: player }) => (
                  <View style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
                    <Text>{player.playerId}</Text>
                    <Text>{player.stroke}</Text>
                    <Text>{player.player.name}</Text>
                  </View>
                )}
              />
            </View>
          )}
        />
      </View>
    </View>
  );
}
