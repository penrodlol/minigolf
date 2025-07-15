import { Course, Player } from '@/db';
import { useStore } from '@/store';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Button, FlatList, Modal, Text, View } from 'react-native';

export default function GameScreen() {
  const store = useStore();
  const [configuringGame, setConfiguringGame] = useState(false);
  const [players, setPlayers] = useState<Array<Player['id']>>([]);
  const [course, setCourse] = useState<Course>();

  return (
    <View style={{ display: 'flex', flexDirection: 'column', gap: 40, padding: 20 }}>
      <FlatList
        data={store.games.data}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ flex: 1 }}>{item.playedOn}</Text>
            <Link href={`/(game)/${item.id}`} asChild>
              <Button title="Play" disabled={item.completed} />
            </Link>
            <Button title="Delete" onPress={() => store.deleteGame.mutate(item.id)} />
          </View>
        )}
      />
      <Button title="New Game" onPress={() => setConfiguringGame(true)} />
      <Modal animationType="slide" visible={configuringGame} onRequestClose={() => setConfiguringGame(false)}>
        <View style={{ display: 'flex', flexDirection: 'column', gap: 40, padding: 20 }}>
          <View style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Text>Select Course:</Text>
            <FlatList
              data={store.courses.data}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <Button
                  title={item.name}
                  color={item.id === course?.id ? 'blue' : 'gray'}
                  onPress={() => setCourse(item)}
                />
              )}
            />
          </View>
          <View style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Text>Select Players:</Text>
            <FlatList
              data={store.players.data}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <Button
                  title={item.name}
                  color={players.includes(item.id) ? 'blue' : 'gray'}
                  onPress={() =>
                    setPlayers((prev) =>
                      prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id],
                    )
                  }
                />
              )}
            />
          </View>
        </View>
        <Button
          title="Start Game"
          onPress={() => {
            if (!course || players.length === 0) return;
            store.addGame.mutate({ course, players });
            setConfiguringGame(false);
            setPlayers([]);
            setCourse(undefined);
          }}
        />
      </Modal>
    </View>
  );
}
