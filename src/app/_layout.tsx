import migrations from '@/../drizzle/migrations';
import { db } from '@/db';
import { THEME, useColorScheme } from '@/lib/color';
import { ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import '../tailwind.css';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = { initialRouteName: '(tabs)' };

export default function Layout() {
  const { colorScheme } = useColorScheme();
  const { success: dbSuccess, error: dbError } = useMigrations(db, migrations);

  useEffect(() => {
    if (dbError) throw dbError;
    SplashScreen.hideAsync();
  }, [dbSuccess, dbError]);

  if (!dbSuccess) return null;

  return (
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider value={THEME[colorScheme]}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
