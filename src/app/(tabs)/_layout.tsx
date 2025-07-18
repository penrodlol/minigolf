import { useColorScheme } from '@/lib/color';
import { Tabs } from 'expo-router';
import { LandPlotIcon, TargetIcon, UsersIcon } from 'lucide-react-native';

export default function TabsLayout() {
  const { colors } = useColorScheme();

  return (
    <Tabs screenOptions={{ title: 'Mini Golf Scoresheet', tabBarActiveTintColor: colors.primary }}>
      <Tabs.Screen
        name="index"
        options={{ tabBarLabel: 'Games', tabBarIcon: ({ color }) => <TargetIcon color={color} /> }}
      />
      <Tabs.Screen
        name="courses"
        options={{ tabBarLabel: 'Courses', tabBarIcon: ({ color }) => <LandPlotIcon color={color} /> }}
      />
      <Tabs.Screen
        name="players"
        options={{ tabBarLabel: 'Players', tabBarIcon: ({ color }) => <UsersIcon color={color} /> }}
      />
    </Tabs>
  );
}
