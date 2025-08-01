import Avatar from '@/components/avatar';
import { GameHolePlayer, Player } from '@/db';
import { useAppTheme } from '@/lib/theme';
import { useGameStore } from '@/store';
import dayjs from 'dayjs';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Keyboard, ScrollView, View } from 'react-native';
import { Button, Divider, Icon, SegmentedButtons, Surface, Text, TextInput } from 'react-native-paper';

export default function GamePage() {
  const params = useLocalSearchParams<{ id: string; hole: string }>();
  const theme = useAppTheme();
  const router = useRouter();
  const store = useGameStore(Number(params.id));
  const [leaderboardVisible, setLeaderboardVisible] = useState(false);
  const [strokes, setStrokes] = useState<Record<GameHolePlayer['id'], GameHolePlayer['stroke']>>({});

  useFocusEffect(useCallback(() => setStrokes({}), []));

  const lastHoleNumber = useMemo(() => store.game.data?.gameHoles.length ?? 0, [store.game.data]);
  const allPreviousHolesComplete = useMemo(
    () =>
      store.game.data?.gameHoles
        .filter((hole) => hole.hole !== store.game.data?.gameHoles.length)
        .every((hole) => hole.gameHolePlayer.every((player) => player.stroke > 0)),
    [store.game.data?.gameHoles],
  );
  const hole = useMemo(
    () => store.game.data?.gameHoles.find((h) => h.hole === Number(params.hole)),
    [store.game.data, params.hole],
  );
  const leaderboard = useMemo(
    () =>
      store.game.data?.gameHoles.reduce(
        (acc, currentHole) => {
          currentHole.gameHolePlayer.forEach((player) => {
            if (!acc[player.player.id]) acc[player.player.id] = { name: player.player.name, strokes: 0 };
            acc[player.player.id].strokes += player.stroke;
          });
          return acc;
        },
        {} as Record<Player['id'], Pick<Player, 'name'> & { strokes: GameHolePlayer['stroke'] }>,
      ),
    [store.game.data?.gameHoles],
  );

  const goToHole = useCallback(
    (hole: string) => (router.push({ pathname: '/[id]', params: { id: params.id, hole } }), setStrokes({})),
    [params.id, router],
  );

  return (
    <View style={{ flex: 1 }}>
      <Surface elevation={2} style={{ gap: 10, padding: 20, borderBottomEndRadius: 20, borderBottomStartRadius: 20 }}>
        <View style={{ flexDirection: 'column', gap: 8, display: leaderboardVisible ? 'flex' : 'none' }}>
          {Object.values(leaderboard ?? {})
            .sort((a, b) => a.strokes - b.strokes)
            .map((player, index) => (
              <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Avatar label={player.name.charAt(0)} size={24} />
                <Text>{player.name}</Text>
                <Divider style={{ flex: 1 }} />
                <Text style={{ color: theme.colors.primary, ...theme.fonts.titleMedium }}>{player.strokes}</Text>
              </View>
            ))}
        </View>
        <Button
          icon={leaderboardVisible ? 'chevron-up' : 'chevron-down'}
          mode="contained-tonal"
          style={{ alignSelf: 'center' }}
          onPress={() => setLeaderboardVisible(!leaderboardVisible)}
        >
          {leaderboardVisible ? 'Hide' : 'Show'} Leaderboard
        </Button>
      </Surface>
      <View style={{ flexDirection: 'column', gap: 32, paddingHorizontal: 16, paddingVertical: 32 }}>
        <View style={{ flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Text variant="headlineSmall">{store.game.data?.course?.courseCompany.name}</Text>
            <Icon source="circle-small" size={24} color={theme.colors.onSurfaceVariant} />
            <Text variant="headlineSmall">{store.game.data?.course?.name}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon source="calendar" size={18} color={theme.colors.onSurfaceVariant} />
              <Text style={{ color: theme.colors.onSurfaceVariant, ...theme.fonts.bodyMedium }}>
                {dayjs(store.game.data?.playedOn).format('dddd, MMMM D, YYYY')}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon source="map-marker" size={18} color={theme.colors.onSurfaceVariant} />
              <Text style={{ color: theme.colors.onSurfaceVariant, ...theme.fonts.bodyMedium }}>
                {store.game.data?.course?.location}
              </Text>
            </View>
          </View>
        </View>
        <ScrollView horizontal>
          <SegmentedButtons
            value={params.hole}
            onValueChange={(nextHole) => goToHole(nextHole)}
            buttons={store.game.data?.gameHoles.map(({ hole }) => ({ value: String(hole), label: String(hole) })) ?? []}
          />
        </ScrollView>
        <FlatList
          data={hole?.gameHolePlayer.sort((a, b) => a.player.name.localeCompare(b.player.name)) ?? []}
          keyExtractor={(gameHolePlayer) => String(gameHolePlayer.player.id)}
          contentContainerStyle={{ gap: 16 }}
          renderItem={({ item: gameHolePlayer }) => (
            <TextInput
              keyboardType="numeric"
              disabled={store.game.data?.completed}
              label={gameHolePlayer.player.name}
              value={String(strokes[gameHolePlayer.id] ?? (gameHolePlayer.stroke === 0 ? '' : gameHolePlayer.stroke))}
              onChangeText={(stroke) => (
                setStrokes((prev) => ({ ...prev, [gameHolePlayer.id]: Number(stroke) })),
                Keyboard.dismiss()
              )}
            />
          )}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 16 }}>
          <Button
            mode="elevated"
            icon="chevron-left"
            disabled={hole?.hole === 1}
            onPress={() => goToHole(String((hole?.hole ?? 1) - 1))}
          >
            Previous Hole
          </Button>
          <Button
            mode="elevated"
            icon={hole?.hole === lastHoleNumber ? 'party-popper' : 'chevron-right'}
            contentStyle={{ flexDirection: 'row-reverse' }}
            disabled={
              Object.keys(strokes).length === 0 ||
              Object.values(strokes).some((stroke) => stroke === 0) ||
              (lastHoleNumber === hole?.hole &&
                (!allPreviousHolesComplete || Object.keys(strokes).length !== hole?.gameHolePlayer.length))
            }
            onPress={async () => {
              if (hole?.hole !== lastHoleNumber) {
                await store.saveGameHolePlayers.mutateAsync(strokes);
                return goToHole(String((hole?.hole ?? 1) + 1));
              }
            }}
          >
            {hole?.hole === lastHoleNumber ? 'Finish Game' : 'Next Hole'}
          </Button>
        </View>
      </View>
    </View>
  );
}
