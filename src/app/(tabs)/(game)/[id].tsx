import { course, db, game, gameHole, gameHolePlayer, GameHolePlayer, Player } from '@/db';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { and, eq } from 'drizzle-orm';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Button, FlatList, Text, TextInput, View } from 'react-native';
import { z } from 'zod/v4';

export default function GameHoleScreen() {
  const params = useLocalSearchParams();
  const id = useMemo(() => z.coerce.number().parse(params.id), [params.id]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [strokes, setStrokes] = useState<
    Array<{ id: GameHolePlayer['id']; playerId: Player['id']; stroke: GameHolePlayer['stroke'] }>
  >([]);

  const client = useQueryClient();

  const gameAndCourse = useQuery({
    queryKey: ['game'],
    queryFn: () => db.select().from(game).leftJoin(course, eq(game.courseId, course.id)).where(eq(game.id, id)).get(),
  });

  const holes = useQuery({
    queryKey: ['holes', id],
    queryFn: () =>
      db.query.gameHole.findMany({
        where: eq(gameHole.gameId, id),
        with: { gameHolePlayer: { with: { player: true } } },
        orderBy: gameHole.hole,
      }),
  });

  const hole = useQuery({
    queryKey: ['hole', id],
    queryFn: async () => {
      if (gameAndCourse.data?.game.completed) return null;

      return db.query.gameHole.findFirst({
        where: and(eq(gameHole.gameId, id), eq(gameHole.completed, false)),
        with: { gameHolePlayer: { with: { player: true } } },
        orderBy: gameHole.hole,
      });
    },
  });

  const nextHole = useMutation({
    mutationKey: ['nextHole'],
    mutationFn: async () => {
      if (!hole.data) return;

      await db.transaction(async (transaction) => {
        if (!hole.data) return;

        await transaction.update(gameHole).set({ completed: true }).where(eq(gameHole.id, hole.data.id));
        const nextHoleId = transaction
          .insert(gameHole)
          .values({ gameId: id, hole: hole.data.hole + 1 })
          .returning()
          .get();
        if (!nextHoleId) return;

        for (const { id: gameHolePlayerId, stroke, playerId } of strokes) {
          await transaction.update(gameHolePlayer).set({ stroke }).where(eq(gameHolePlayer.id, gameHolePlayerId));
          await transaction.insert(gameHolePlayer).values({ gameHoleId: nextHoleId.id, playerId });
        }
      });
    },
    onSuccess: () => {
      setStrokes([]);
      client.invalidateQueries({ queryKey: ['holes'] });
      client.invalidateQueries({ queryKey: ['hole'] });
    },
    onError: (error) => {
      console.error('Error updating hole:', error);
    },
  });

  const endGame = useMutation({
    mutationKey: ['endGame'],
    mutationFn: async () => {
      await db.transaction(async (transaction) => {
        if (!hole.data) return;

        await transaction.update(game).set({ completed: true }).where(eq(game.id, id));
        await transaction.update(gameHole).set({ completed: true }).where(eq(gameHole.id, hole.data.id));

        for (const { id: gameHolePlayerId, stroke, playerId } of strokes) {
          await transaction.update(gameHolePlayer).set({ stroke }).where(eq(gameHolePlayer.id, gameHolePlayerId));
        }
      });
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['holes'] });
      client.invalidateQueries({ queryKey: ['hole'] });
      client.invalidateQueries({ queryKey: ['game'] });
    },
    onError: (error) => {
      console.error('Error ending game:', error);
    },
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
      <View>
        <Text>
          Hole {hole.data?.hole} of {gameAndCourse.data?.course?.holes}
        </Text>
      </View>
      <View style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
        <FlatList
          data={hole.data?.gameHolePlayer}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={{ display: 'flex', width: '100%', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text>{item.player.name}</Text>
              <TextInput
                placeholder="Enter stroke"
                keyboardType="number-pad"
                style={{ flex: 1, borderWidth: 1 }}
                onKeyPress={(e) => {
                  const key = z.coerce.number().safeParse(e.nativeEvent.key);
                  if (!key.success) return;

                  setStrokes((prev) => {
                    return prev.some((s) => s.id === item.id)
                      ? prev.map((s) => (s.id === item.id ? { ...s, stroke: key.data } : s))
                      : [...prev, { id: item.id, playerId: item.player.id, stroke: key.data }];
                  });

                  e.currentTarget.blur();
                }}
              />
            </View>
          )}
        />
      </View>
      <View style={{ marginTop: 40 }}>
        {hole.data?.hole === gameAndCourse.data?.course?.holes ? (
          <Button title="End Game" onPress={() => endGame.mutateAsync()} />
        ) : (
          <Button title="Next Hole" onPress={() => nextHole.mutateAsync()} />
        )}
      </View>
      <View style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
        <Text>Scorecard:</Text>
        <FlatList
          data={holes.data?.filter((h) => h.id !== hole.data?.id)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text>Hole {item.hole}</Text>
              {item.gameHolePlayer.map((player) => (
                <View key={player.id} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Text>{player.player.name}:</Text>
                  <Text>{player.stroke}</Text>
                </View>
              ))}
            </View>
          )}
        />
      </View>
      <View>{winner && <Text>Winner: {winner.name}!</Text>}</View>
    </View>
  );
}
