import { useAppTheme } from '@/lib/theme';
import { useGameStore } from '@/store';
import dayjs from 'dayjs';
import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { DataTable, Icon, Text } from 'react-native-paper';

export default function GameResultsPage() {
  const params = useLocalSearchParams<{ id: string }>();
  const theme = useAppTheme();
  const store = useGameStore(Number(params.id));

  const players = useMemo(
    () => store.game.data?.gameHoles[0].gameHolePlayer.sort((a, b) => a.player.name.localeCompare(b.player.name)),
    [store.game.data],
  );

  const leaderboard = useMemo(() => store.utils.getLeaderBoard(store.game.data), [store.game.data]);

  const data = useMemo(
    () => store.game.data?.gameHoles.map(({ hole, gameHolePlayer }) => ({ hole, players: gameHolePlayer })),
    [store.game.data?.gameHoles],
  );

  return (
    <View style={{ flex: 1, paddingTop: 16 }}>
      <View style={{ flexDirection: 'column', justifyContent: 'center', gap: 8, padding: 16, paddingBottom: 16 }}>
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
      <DataTable.Header>
        <DataTable.Title>{''}</DataTable.Title>
        {players?.map(({ id, player }) => (
          <DataTable.Title key={id} style={{ justifyContent: 'center' }}>
            {player.name}
          </DataTable.Title>
        ))}
      </DataTable.Header>
      <ScrollView>
        {data?.map((item) => (
          <DataTable.Row key={item.hole}>
            <DataTable.Cell>
              <Text style={{ color: theme.colors.onSurfaceVariant, ...theme.fonts.labelSmall }}>Hole #{item.hole}</Text>
            </DataTable.Cell>
            {item.players
              .sort((a, b) => a.player.name.localeCompare(b.player.name))
              .map(({ player, stroke }) => (
                <DataTable.Cell key={player.id} style={{ justifyContent: 'center' }}>
                  {stroke}
                </DataTable.Cell>
              ))}
          </DataTable.Row>
        ))}
      </ScrollView>
      <DataTable.Row style={{ elevation: 2, height: 52, paddingTop: 8 }}>
        <DataTable.Cell>
          <Text style={{ color: theme.colors.onSurfaceVariant, ...theme.fonts.bodyLarge }}>Total:</Text>
        </DataTable.Cell>
        {leaderboard
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((player) => (
            <DataTable.Cell key={player.name} style={{ justifyContent: 'center' }}>
              <Text style={{ color: theme.colors.primary, ...theme.fonts.bodyLarge }}>{player.strokes}</Text>
            </DataTable.Cell>
          ))}
      </DataTable.Row>
    </View>
  );
}
