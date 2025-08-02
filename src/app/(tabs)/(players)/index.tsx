import * as api from '@/api/players';
import Avatar from '@/components/avatar';
import * as Modal from '@/components/modal';
import { Player } from '@/db';
import { useAppTheme } from '@/lib/theme';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { Button, FAB, Icon, IconButton, Menu, Text, TextInput } from 'react-native-paper';

export default function PlayersPage() {
  const theme = useAppTheme();
  const client = useQueryClient();

  const [menuPlayerId, setMenuPlayerId] = useState<Player['id']>();
  const [deletePlayerId, setDeletePlayerId] = useState<Player['id']>();
  const [addEditPlayerModalVisible, setAddEditPlayerModalVisible] = useState(false);
  const [editPlayer, setEditPlayer] = useState<Partial<Player>>();

  const players = useQuery({ queryKey: ['players'], queryFn: () => api.getPlayers() });
  const savePlayer = useMutation({
    mutationKey: ['savePlayer'],
    mutationFn: (props: api.PlayersAPI_POST_SavePlayer_Props) => api.savePlayer(props),
    onSuccess: () => client.invalidateQueries(),
    onError: (error) => console.error(error),
  });
  const deletePlayer = useMutation({
    mutationKey: ['deletePlayer'],
    mutationFn: (props: api.PlayersAPI_DELETE_DeletePlayer_Props) => api.deletePlayer(props),
    onSuccess: () => client.invalidateQueries({ queryKey: ['players'] }),
    onError: (error) => console.error(error),
  });

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={players.data}
        keyExtractor={(player) => String(player.id)}
        renderItem={({ item: player, index }) => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              paddingVertical: 16,
              paddingLeft: 16,
              backgroundColor: index % 2 === 0 ? theme.colors.surfaceVariant : theme.colors.surface,
            }}
          >
            <Avatar size={40} label={player.name[0]} />
            <View style={{ flex: 1, flexDirection: 'column' }}>
              <Text variant="titleMedium">{player.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ color: theme.colors.onSurfaceVariant }}>{player.wins} Wins</Text>
                <Icon source="circle-small" size={16} color={theme.colors.onSurfaceVariant} />
                <Text style={{ color: theme.colors.onSurfaceVariant }}>{player.holeInOnes} Hole In Ones</Text>
              </View>
            </View>
            <Menu
              visible={menuPlayerId === player.id}
              anchor={<IconButton icon="dots-vertical" onPress={() => setMenuPlayerId(player.id)} />}
              onDismiss={() => setMenuPlayerId(undefined)}
            >
              <Menu.Item
                title="Edit"
                leadingIcon="pencil"
                onPress={() => (setMenuPlayerId(undefined), setEditPlayer(player), setAddEditPlayerModalVisible(true))}
              />
              <Menu.Item
                title="Delete"
                leadingIcon="delete"
                onPress={() => (setMenuPlayerId(undefined), setDeletePlayerId(player.id))}
              />
            </Menu>
          </View>
        )}
      />
      <FAB
        icon="plus"
        mode="elevated"
        style={{ position: 'absolute', bottom: 16, right: 16 }}
        onPress={() => (setEditPlayer(undefined), setAddEditPlayerModalVisible(true))}
      />
      <Modal.Root visible={!!deletePlayerId} onDismiss={() => setDeletePlayerId(undefined)}>
        <Modal.Header title="Delete Player" />
        <Modal.Body>
          <Text>Are you sure you want to delete this player?</Text>
        </Modal.Body>
        <Modal.Footer>
          <Button onPress={() => setDeletePlayerId(undefined)}>Cancel</Button>
          <Button
            mode="contained-tonal"
            onPress={() => (deletePlayer.mutateAsync(Number(deletePlayerId)), setDeletePlayerId(undefined))}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal.Root>
      <Modal.Root visible={addEditPlayerModalVisible} onDismiss={() => setAddEditPlayerModalVisible(false)}>
        <Modal.Header title={editPlayer?.id ? 'Edit Player' : 'Add Player'} />
        <Modal.Body>
          <TextInput
            autoFocus
            label="Player Name"
            value={editPlayer?.name}
            right={<TextInput.Icon icon="account-edit" />}
            onChangeText={(name) => setEditPlayer((prev) => ({ ...prev, name }))}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onPress={() => setAddEditPlayerModalVisible(false)}>Cancel</Button>
          <Button
            mode="contained-tonal"
            disabled={!editPlayer?.name}
            onPress={async () => {
              if (!editPlayer?.name) return;
              await savePlayer.mutateAsync({ name: editPlayer.name, id: editPlayer.id });
              setAddEditPlayerModalVisible(false);
            }}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal.Root>
    </View>
  );
}
