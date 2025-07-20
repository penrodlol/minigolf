import Skeleton from '@/components/skeleton';
import { usePlayers } from '@/lib/api';
import { useAppTheme } from '@/lib/theme';
import { FlatList, View } from 'react-native';
import { Card, FAB } from 'react-native-paper';

export default function PlayersPage() {
  const theme = useAppTheme();
  const players = usePlayers();

  return (
    <View style={{ flex: 1, padding: 24 }}>
      {players.isLoading && (
        <View style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
          {[...Array(8)].map((_, index) => (
            <Skeleton key={index} width="100%" height={50} />
          ))}
        </View>
      )}
      <FlatList
        data={players.data}
        keyExtractor={(player) => String(player.id)}
        contentContainerStyle={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        renderItem={({ item: player }) => (
          <Card>
            <Card.Title title={player.name} />
          </Card>
        )}
      />
      <FAB icon="plus" style={{ position: 'absolute', bottom: 0, right: 15 }} />
    </View>
  );
}
