import { Player } from '@/db';
import { useStore } from '@/store';
import { useState } from 'react';
import { Button, FlatList, Modal, Text, TextInput, View } from 'react-native';

export default function PlayersScreen() {
  const store = useStore();
  const [editing, setEditing] = useState(false);
  const [player, setPlayer] = useState<Omit<Player, 'id'> & { id: Player['id'] | undefined }>();

  return (
    <View style={{ display: 'flex', flexDirection: 'column', gap: 40, padding: 20 }}>
      <FlatList
        data={store.players.data ?? []}
        keyExtractor={(player) => String(player.id)}
        renderItem={({ item: player }) => (
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ flex: 1 }}>{player.name}</Text>
            <Button title="Edit" onPress={() => (setPlayer(player), setEditing(true))} />
            <Button title="Delete" onPress={() => store.deletePlayer.mutate(player.id)} />
          </View>
        )}
      />
      <Button title="Add Player" onPress={() => setEditing(true)} />
      <Modal animationType="slide" visible={editing} onRequestClose={() => (setEditing(false), setPlayer(undefined))}>
        <View style={{ display: 'flex', flexDirection: 'column', gap: 40, padding: 20 }}>
          <TextInput
            placeholder="Player Name"
            value={player?.name}
            style={{ borderWidth: 1 }}
            onChangeText={(name) => setPlayer({ id: player?.id, name })}
          />
          <Button
            title="Save"
            onPress={async () => {
              if (player?.id) await store.updatePlayer.mutateAsync({ id: player.id, name: player.name });
              else if (player?.name) await store.addPlayer.mutateAsync(player.name);
              setEditing(false);
              setPlayer(undefined);
            }}
          />
        </View>
      </Modal>
    </View>
  );
}
