import * as courseAPI from '@/api/courses';
import * as gameAPI from '@/api/games';
import * as playerAPI from '@/api/players';
import Avatar from '@/components/avatar';
import * as Modal from '@/components/modal';
import { Course, Game } from '@/db';
import { useAppTheme } from '@/lib/theme';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { Button, FAB, Icon, IconButton, Surface, Text } from 'react-native-paper';
import { Dropdown, MultiSelectDropdown } from 'react-native-paper-dropdown';

export default function GamesPage() {
  const theme = useAppTheme();
  const client = useQueryClient();
  const router = useRouter();

  const [deleteGameId, setDeleteGameId] = useState<Game['id']>();
  const [addGameModalVisible, setAddGameModalVisible] = useState(false);
  const [newGameCourseId, setNewGameCourseId] = useState<Course['id']>();
  const [newGamePlayerIds, setNewGamePlayerIds] = useState<Array<string>>([]);

  const topPlayers = useQuery({ queryKey: ['topPlayers'], queryFn: () => gameAPI.getTopPlayers() });
  const games = useQuery({ queryKey: ['games'], queryFn: () => gameAPI.getGames() });
  const courses = useQuery({ queryKey: ['courses'], queryFn: () => courseAPI.getCourses() });
  const players = useQuery({ queryKey: ['players'], queryFn: () => playerAPI.getPlayers() });
  const addGame = useMutation({
    mutationKey: ['addGame'],
    mutationFn: (props: gameAPI.GamesAPI_POST_SaveGame_Props) => gameAPI.saveGame(props),
    onSuccess: () => client.invalidateQueries({ queryKey: ['games'] }),
    onError: (error) => console.error(error),
  });
  const deleteGame = useMutation({
    mutationKey: ['deleteGame'],
    mutationFn: (id: gameAPI.GamesAPI_DELETE_DeleteGame_Props) => gameAPI.deleteGame(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ['games'] }),
    onError: (error) => console.error(error),
  });

  return (
    <View style={{ flex: 1 }}>
      <Surface elevation={2} style={{ padding: 30, borderBottomEndRadius: 20, borderBottomStartRadius: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          {[topPlayers.data?.[1], topPlayers.data?.[0], topPlayers.data?.[2]]
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
        data={games.data}
        keyExtractor={(game) => String(game.id)}
        contentContainerStyle={{ paddingTop: 40, paddingBottom: 56 }}
        renderItem={({ item: game, index }) => (
          <View
            style={{
              flexDirection: 'column',
              gap: 4,
              paddingHorizontal: 16,
              paddingVertical: 32,
              backgroundColor: index % 2 === 0 ? theme.colors.surfaceVariant : theme.colors.surface,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text variant="titleMedium">{game.course?.courseCompany.name}</Text>
                <Icon source="circle-small" size={16} color={theme.colors.onSurfaceVariant} />
                <Text variant="titleMedium">{game.course?.name}</Text>
              </View>
              <IconButton icon="delete" onPress={() => setDeleteGameId(game.id)} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon source="list-status" size={18} color={theme.colors.onSurfaceVariant} />
              <Text style={{ color: theme.colors.onSurfaceVariant, ...theme.fonts.bodyMedium }}>
                {game.completed ? 'Completed' : 'In Progress'}
              </Text>
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
                {game.course?.location}
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
              <Button
                mode={game.completed ? 'text' : 'elevated'}
                onPress={() =>
                  game.completed
                    ? router.push({ pathname: '/[id]/results', params: { id: game.id } })
                    : router.push({ pathname: '/[id]', params: { id: game.id, hole: 1 } })
                }
              >
                {game.completed ? 'View Results' : 'Play'}
              </Button>
            </View>
          </View>
        )}
      />
      <FAB
        icon="plus"
        style={{ position: 'absolute', bottom: 16, right: 16 }}
        onPress={() => (setNewGameCourseId(undefined), setNewGamePlayerIds([]), setAddGameModalVisible(true))}
      />
      <Modal.Root visible={!!deleteGameId} onDismiss={() => setDeleteGameId(undefined)}>
        <Modal.Header title="Delete Game" />
        <Modal.Body>
          <Text>Are you sure you want to delete this game?</Text>
        </Modal.Body>
        <Modal.Footer>
          <Button onPress={() => setDeleteGameId(undefined)}>Cancel</Button>
          <Button
            mode="contained-tonal"
            onPress={() => (deleteGame.mutateAsync(Number(deleteGameId)), setDeleteGameId(undefined))}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal.Root>
      <Modal.Root visible={addGameModalVisible} onDismiss={() => setAddGameModalVisible(false)}>
        <Modal.Header title="New Game" />
        <Modal.Body>
          <Dropdown
            hideMenuHeader
            label="Course"
            placeholder="Select a course"
            options={courses.data?.map(({ name, id }) => ({ label: name, value: String(id) })) ?? []}
            value={String(newGameCourseId ?? '')}
            onSelect={(value) => setNewGameCourseId(value ? Number(value) : undefined)}
          />
          <MultiSelectDropdown
            hideMenuHeader
            label="Players"
            placeholder="Select players"
            options={players.data?.map(({ name, id }) => ({ label: name, value: String(id) })) ?? []}
            value={newGamePlayerIds}
            onSelect={setNewGamePlayerIds}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onPress={() => setAddGameModalVisible(false)}>Cancel</Button>
          <Button
            mode="contained-tonal"
            disabled={!newGameCourseId || newGamePlayerIds.length <= 1}
            onPress={async () => {
              if (!newGameCourseId || newGamePlayerIds.length <= 1) return;
              const playerIds = newGamePlayerIds.map((id) => Number(id));
              await addGame.mutateAsync({ courseId: newGameCourseId, playerIds });
              setAddGameModalVisible(false);
            }}
          >
            Start
          </Button>
        </Modal.Footer>
      </Modal.Root>
    </View>
  );
}
