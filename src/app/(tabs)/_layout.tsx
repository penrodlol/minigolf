import { useAppTheme } from '@/lib/theme';
import { CommonActions } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import { Image, View } from 'react-native';
import { BottomNavigation, Icon, IconButton, Text } from 'react-native-paper';

export default function TabsPage() {
  const theme = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerTitle: () => (
          <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Image source={require('@/assets/icon.png')} alt="Logo" style={{ width: 36, height: 36 }} />
            <Text style={{ ...theme.fonts.markoOneHeadlineSmall }}>Mini Golf</Text>
            <IconButton icon="cog" size={24} />
          </View>
        ),
      }}
      tabBar={({ state, insets, navigation, descriptors }) => (
        <BottomNavigation.Bar
          navigationState={{ ...state, routes: state.routes.filter((route) => !route.name.startsWith('(games)/[id]')) }}
          safeAreaInsets={insets}
          renderIcon={({ route, ...props }) => descriptors[route.key].options.tabBarIcon?.({ ...props, size: 20 })}
          getLabelText={({ route }) => String(descriptors[route.key].options.tabBarLabel)}
          onTabPress={({ route, preventDefault }) => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (event.defaultPrevented) preventDefault();
            else navigation.dispatch({ ...CommonActions.navigate(route.name, route.params), target: state.key });
          }}
        />
      )}
    >
      <Tabs.Screen
        name="(games)/index"
        options={{ tabBarLabel: 'Games', tabBarIcon: () => <Icon source="trophy" size={20} /> }}
      />
      <Tabs.Screen
        name="(courses)/index"
        options={{ tabBarLabel: 'Courses', tabBarIcon: () => <Icon source="golf" size={20} /> }}
      />
      <Tabs.Screen
        name="(players)/index"
        options={{ tabBarLabel: 'Players', tabBarIcon: () => <Icon source="account-multiple" size={20} /> }}
      />
      <Tabs.Screen name="(games)/[id]/index" options={{ href: null }} />
      <Tabs.Screen name="(games)/[id]/results" options={{ href: null }} />
    </Tabs>
  );
}
