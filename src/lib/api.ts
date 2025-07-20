import { db } from '@/db';
import { useQuery } from '@tanstack/react-query';

declare module '@tanstack/react-query' {
  interface Register {
    queryKey: ['players' | 'courses', ...ReadonlyArray<unknown>];
    mutationKey: [...ReadonlyArray<unknown>];
  }
}

export const usePlayers = () => useQuery({ queryKey: ['players'], queryFn: async () => db.query.player.findMany() });

export const useCourses = () => useQuery({ queryKey: ['courses'], queryFn: async () => db.query.course.findMany() });
