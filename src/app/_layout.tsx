import migrations from '@/../drizzle/migrations';
import { db } from '@/db';
import THEME from '@/lib/theme';
import { MarkoOne_400Regular, useFonts } from '@expo-google-fonts/marko-one';
import { DarkTheme as NavDarkTheme, DefaultTheme as NavDefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { adaptNavigationTheme, PaperProvider } from 'react-native-paper';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const { success: dbSuccess, error: dbError } = useMigrations(db, migrations);
  const [fontLoaded, fontError] = useFonts({ MarkoOne_400Regular });
  const colorScheme = useColorScheme();
  const { LightTheme, DarkTheme } = adaptNavigationTheme({
    reactNavigationLight: NavDefaultTheme,
    reactNavigationDark: NavDarkTheme,
    materialLight: THEME.light,
    materialDark: THEME.dark,
  });

  useEffect(() => {
    if (dbError) throw dbError;
    if (fontError) throw fontError;
    SplashScreen.hideAsync();
  }, [dbSuccess, dbError, fontLoaded, fontError]);

  if (!dbSuccess || !fontLoaded) return null;

  return (
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : LightTheme}>
        <PaperProvider theme={colorScheme === 'dark' ? THEME.dark : THEME.light}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </PaperProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
