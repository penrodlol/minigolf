import migrations from '@/../drizzle/migrations';
import { db } from '@/db';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = { initialRouteName: '(tabs)' };

export default function Layout() {
  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    if (error) throw error;
    SplashScreen.hideAsync();
  }, [success, error]);

  if (!success) return null;

  return (
    <QueryClientProvider client={new QueryClient()}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
