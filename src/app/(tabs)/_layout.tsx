import { Tabs } from 'expo-router';
import { LandPlot, PlayIcon, Users } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'indigo' }}>
      <Tabs.Screen redirect name="index" />
      <Tabs.Screen
        name="(game)"
        options={{ title: 'Game', tabBarIcon: ({ color }) => <PlayIcon size={20} color={color} fill={color} /> }}
      />
      <Tabs.Screen
        name="courses"
        options={{ title: 'Courses', tabBarIcon: ({ color }) => <LandPlot size={20} color={color} /> }}
      />
      <Tabs.Screen
        name="players"
        options={{ title: 'Players', tabBarIcon: ({ color }) => <Users size={20} color={color} /> }}
      />
    </Tabs>
  );
}
