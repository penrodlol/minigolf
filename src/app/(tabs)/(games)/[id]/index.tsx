import * as api from '@/api/game';
import Avatar from '@/components/avatar';
import { useAppTheme } from '@/lib/theme';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Keyboard, ScrollView, View } from 'react-native';
import { Button, Divider, Icon, SegmentedButtons, Surface, Text, TextInput } from 'react-native-paper';

export default function GamePage() {
  const params = useLocalSearchParams<{ id: string; hole: string }>();
  const theme = useAppTheme();
  const client = useQueryClient();
  const router = useRouter();

  const [leaderboardVisible, setLeaderboardVisible] = useState(false);
  const [strokes, setStrokes] = useState<api.GameAPI_POST_SaveGameHolePlayers_Props>({});

  useFocusEffect(useCallback(() => setStrokes({}), []));

  const id = useMemo(() => Number(params.id), []);
  const game = useQuery({ queryKey: ['game', id], queryFn: () => api.getGame(id) });

  const lastHoleNumber = useMemo(() => game.data?.gameHoles.length ?? 0, [game.data]);
  const allHolesComplete = useMemo(() => api.util_allHolesComplete(game.data), [game.data]);
  const hole = useMemo(() => api.util_getGameHole({ game: game.data, hole: params.hole }), [game.data, params.hole]);
  const leaderboard = useMemo(() => api.util_getGameLeaderboard(game.data), [game.data]);

  const goToHole = useCallback(
    (hole: string) => (router.push({ pathname: '/[id]', params: { id: params.id, hole } }), setStrokes({})),
    [params.id, router],
  );

  const saveGameHolePlayers = useMutation({
    mutationKey: ['saveGameHolePlayers'],
    mutationFn: async (props: api.GameAPI_POST_SaveGameHolePlayers_Props) => api.saveGameHolePlayers(props),
    onSuccess: () => client.invalidateQueries({ queryKey: ['game', id] }),
    onError: (error) => console.error(error),
  });
  const saveGame = useMutation({
    mutationKey: ['saveGame'],
    mutationFn: async (props: api.GameAPI_POST_SaveGame_Props) => api.saveGame(props),
    onSuccess: () => (
      client.invalidateQueries({ queryKey: ['game', id] }),
      client.invalidateQueries({ queryKey: ['games'] }),
      client.invalidateQueries({ queryKey: ['topPlayers'] }),
      client.invalidateQueries({ queryKey: ['players'] })
    ),
    onError: (error) => console.error(error),
  });

  return (
    <View style={{ flex: 1 }}>
      <Surface elevation={2} style={{ gap: 10, padding: 20, borderBottomEndRadius: 20, borderBottomStartRadius: 20 }}>
        <View style={{ flexDirection: 'column', gap: 8, display: leaderboardVisible ? 'flex' : 'none' }}>
          {leaderboard.map((player, index) => (
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
            <Text variant="headlineSmall">{game.data?.course?.courseCompany.name}</Text>
            <Icon source="circle-small" size={24} color={theme.colors.onSurfaceVariant} />
            <Text variant="headlineSmall">{game.data?.course?.name}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon source="calendar" size={18} color={theme.colors.onSurfaceVariant} />
              <Text style={{ color: theme.colors.onSurfaceVariant, ...theme.fonts.bodyMedium }}>
                {dayjs(game.data?.playedOn).format('dddd, MMMM D, YYYY')}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon source="map-marker" size={18} color={theme.colors.onSurfaceVariant} />
              <Text style={{ color: theme.colors.onSurfaceVariant, ...theme.fonts.bodyMedium }}>
                {game.data?.course?.location}
              </Text>
            </View>
          </View>
        </View>
        <ScrollView horizontal>
          <SegmentedButtons
            value={params.hole}
            onValueChange={(nextHole) => goToHole(nextHole)}
            buttons={game.data?.gameHoles.map(({ hole }) => ({ value: String(hole), label: String(hole) })) ?? []}
          />
        </ScrollView>
        <FlatList
          data={hole?.gameHolePlayer.sort((a, b) => a.player.name.localeCompare(b.player.name)) ?? []}
          keyExtractor={(gameHolePlayer) => String(gameHolePlayer.player.id)}
          contentContainerStyle={{ gap: 16 }}
          renderItem={({ item: gameHolePlayer }) => (
            <TextInput
              keyboardType="numeric"
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
                (!allHolesComplete || Object.keys(strokes).length !== hole?.gameHolePlayer.length))
            }
            onPress={async () => {
              if (!game.data) return;

              await saveGameHolePlayers.mutateAsync(strokes);
              if (hole?.hole !== lastHoleNumber) return goToHole(String((hole?.hole ?? 1) + 1));
              await saveGame.mutateAsync(game.data.id);
              router.push({ pathname: '/[id]/results', params: { id: game.data.id } });
            }}
          >
            {hole?.hole === lastHoleNumber ? 'Finish Game' : 'Next Hole'}
          </Button>
        </View>
      </View>
    </View>
  );
}
