import Avatar from '@/components/avatar';
import * as Modal from '@/components/modal';
import { Player } from '@/db';
import { useAppTheme } from '@/lib/theme';
import { usePlayerStore } from '@/store';
import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { Button, Card, FAB, IconButton, Surface, Text, TextInput } from 'react-native-paper';

export default function PlayersPage() {
  const theme = useAppTheme();
  const store = usePlayerStore();
  const playersByWin = useMemo(() => store.players.data?.sort((a, b) => b.wins - a.wins), [store.players.data]);
  const [editing, setEditing] = useState(false);
  const [player, setPlayer] = useState<Partial<Player>>();
  const [playerToDelete, setPlayerToDelete] = useState<Player>();

  return (
    <View style={{ flex: 1, flexDirection: 'column', gap: 40 }}>
      <Surface elevation={2} style={{ padding: 30, borderBottomEndRadius: 20, borderBottomStartRadius: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          {[playersByWin?.[1], playersByWin?.[0], playersByWin?.[2]]
            .filter((player) => !!player)
            .map((player, index) => (
              <View key={player.id} style={{ flexDirection: 'column', alignItems: 'center' }}>
                <Avatar size={index === 1 ? 100 : 80} label={player.name[0]} style={{ marginBottom: 8 }} />
                <Text variant="titleMedium">{player.name}</Text>
                <Text style={{ color: theme.colors.onSurfaceVariant }}>{player.wins} Wins</Text>
              </View>
            ))}
        </View>
      </Surface>
      <View style={{ flex: 1 }}>
        <FlatList
          contentContainerStyle={{ gap: 16, paddingHorizontal: 32, paddingBottom: 24 }}
          data={store.players.data}
          keyExtractor={(player) => String(player.id)}
          renderItem={({ item: player }) => (
            <Card mode="contained">
              <Card.Title
                title={player.name}
                subtitle={`Player Wins: ${player.wins}`}
                subtitleStyle={{ color: theme.colors.onSurfaceVariant, lineHeight: 12 }}
                left={(props) => <Avatar {...props} size={40} label={player.name[0]} />}
                right={(props) => (
                  <View style={{ flexDirection: 'row' }}>
                    <IconButton {...props} icon="pencil" onPress={() => (setEditing(true), setPlayer(player))} />
                    <IconButton {...props} icon="delete" onPress={() => setPlayerToDelete(player)} />
                  </View>
                )}
              />
            </Card>
          )}
        />
      </View>
      <FAB
        icon="plus"
        mode="elevated"
        style={{ position: 'absolute', bottom: 16, right: 16 }}
        onPress={() => setEditing(true)}
      />
      <Modal.Root visible={editing} onDismiss={() => (setEditing(false), setPlayer(undefined))}>
        <Modal.Header title={player ? 'Edit Player' : 'Add Player'} />
        <Modal.Body>
          <TextInput
            autoFocus
            label="Player Name"
            value={player?.name}
            right={<TextInput.Icon icon="account-edit" />}
            onChangeText={(text) => setPlayer((prev) => ({ ...prev, name: text.trim() }))}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onPress={() => (setEditing(false), setPlayer(undefined))}>Cancel</Button>
          <Button
            mode="contained-tonal"
            disabled={!player?.name}
            onPress={async () => {
              if (!player?.name) return;
              await store.savePlayer.mutateAsync({ name: player.name, id: player.id });
              setEditing(false);
              setPlayer(undefined);
            }}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal.Root>
      <Modal.Root visible={!!playerToDelete} onDismiss={() => setPlayerToDelete(undefined)}>
        <Modal.Header title="Delete Player" />
        <Modal.Body>
          <Text>Are you sure you want to delete this player?</Text>
        </Modal.Body>
        <Modal.Footer>
          <Button onPress={() => setPlayerToDelete(undefined)}>Cancel</Button>
          <Button
            mode="contained-tonal"
            onPress={async () => {
              if (!playerToDelete) return;
              await store.deletePlayer.mutateAsync(playerToDelete.id);
              setPlayerToDelete(undefined);
            }}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal.Root>
    </View>
  );
}
