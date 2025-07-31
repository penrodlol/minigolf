import Avatar from '@/components/avatar';
import { useAppTheme } from '@/lib/theme';
import { useGamesStore } from '@/store';
import dayjs from 'dayjs';
import { FlatList, View } from 'react-native';
import { Button, Chip, FAB, Icon, Surface, Text } from 'react-native-paper';

export default function GamesPage() {
  const theme = useAppTheme();
  const store = useGamesStore();

  return (
    <View style={{ flex: 1, flexDirection: 'column', gap: 40 }}>
      <Surface elevation={2} style={{ padding: 30, borderBottomEndRadius: 20, borderBottomStartRadius: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          {[store.topPlayers.data?.[1], store.topPlayers.data?.[0], store.topPlayers.data?.[2]]
            .filter((player) => !!player)
            .map((player, index) => (
              <View key={player.id} style={{ flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <Avatar size={index === 1 ? 100 : 80} label={player.name[0]} />
                <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                  <Text variant="titleMedium">{player.name}</Text>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>{player.wins} Wins</Text>
                </View>
              </View>
            ))}
        </View>
      </Surface>
      <FlatList
        data={store.games.data}
        keyExtractor={(game) => String(game.id)}
        renderItem={({ item: game, index }) => (
          <View
            style={{
              flexDirection: 'column',
              gap: 6,
              paddingHorizontal: 16,
              paddingVertical: 32,
              backgroundColor: index % 2 === 0 ? theme.colors.surfaceVariant : theme.colors.surface,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text variant="titleMedium">{game.course.courseCompany.name}</Text>
                <Icon source="circle-small" size={16} color={theme.colors.onSurfaceVariant} />
                <Text variant="titleMedium">{game.course.name}</Text>
              </View>
              <Chip compact elevation={3} textStyle={{ ...theme.fonts.labelSmall }}>
                {game.completed ? 'Completed' : 'In Progress'}
              </Chip>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon source="calendar" size={18} color={theme.colors.onSurfaceVariant} />
              <Text style={{ color: theme.colors.onSurfaceVariant, ...theme.fonts.bodyMedium }}>
                {dayjs(game.playedOn).format('dddd, MMMM D, YYYY')}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Icon source="map-marker" size={18} color={theme.colors.onSurfaceVariant} />
              <Text style={{ color: theme.colors.onSurfaceVariant, ...theme.fonts.bodyMedium }}>
                {game.course.location}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {game.gameHoles[0].gameHolePlayer?.map((player, playerIndex) => (
                  <View key={player.id} style={{ position: 'relative', marginLeft: playerIndex > 0 ? -10 : 0 }}>
                    <Avatar size={32} label={player.player.name[0]} style={{ elevation: 5 }} />
                  </View>
                ))}
              </View>
              <Button mode={game.completed ? 'text' : 'elevated'}>{game.completed ? 'View Results' : 'Play'}</Button>
            </View>
          </View>
        )}
      />
      <FAB icon="plus" style={{ position: 'absolute', bottom: 16, right: 16 }} />
    </View>
  );
}
