import { Course, course, CourseCompany, courseCompany, db, Player, player } from '@/db';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { asc, eq } from 'drizzle-orm';

declare module '@tanstack/react-query' {
  interface Register {
    queryKey: ['players' | 'courseCompanies', ...ReadonlyArray<unknown>];
    mutationKey: [
      'savePlayer' | 'deletePlayer' | 'saveCompany' | 'deleteCompany' | 'saveCourse' | 'deleteCourse',
      ...ReadonlyArray<unknown>,
    ];
  }
}

export type PlayerStorePlayers = NonNullable<ReturnType<typeof usePlayerStore>['players']['data']>;
export type PlayerStoreSavePlayerProps = Pick<Player, 'name'> & { id: Player['id'] | undefined };
export type PlayerStoreDeletePlayerProps = Player['id'];
export type CourseStoreCourseCompanies = NonNullable<ReturnType<typeof useCourseStore>['courseCompanies']['data']>;
export type CourseStoreSaveCompanyProps = Omit<CourseCompany, 'id'> & { id: CourseCompany['id'] | undefined };
export type CourseStoreDeleteCompanyProps = CourseCompany['id'];
export type CourseStoreSaveCourseProps = Omit<Course, 'id'> & { id: Course['id'] | undefined };
export type CourseStoreDeleteCourseProps = Course['id'];

export const usePlayerStore = () => {
  const client = useQueryClient();

  return {
    players: useQuery({ queryKey: ['players'], queryFn: () => db.select().from(player).orderBy(asc(player.name)) }),
    savePlayer: useMutation({
      mutationKey: ['savePlayer'],
      mutationFn: async ({ id, name }: PlayerStoreSavePlayerProps) =>
        id ? await db.update(player).set({ name }).where(eq(player.id, id)) : await db.insert(player).values({ name }),
      onSuccess: () => client.invalidateQueries({ queryKey: ['players'] }),
      onError: (error) => console.error(error),
    }),
    deletePlayer: useMutation({
      mutationKey: ['deletePlayer'],
      mutationFn: async (props: PlayerStoreDeletePlayerProps) => await db.delete(player).where(eq(player.id, props)),
      onSuccess: () => client.invalidateQueries({ queryKey: ['players'] }),
      onError: (error) => console.error(error),
    }),
  };
};

export const useCourseStore = () => {
  const client = useQueryClient();

  return {
    courseCompanies: useQuery({
      queryKey: ['courseCompanies'],
      queryFn: () =>
        db.query.courseCompany.findMany({
          with: { courses: { orderBy: [asc(course.name)] } },
          orderBy: [asc(courseCompany.name)],
        }),
    }),
    saveCompany: useMutation({
      mutationKey: ['saveCompany'],
      mutationFn: async ({ id, name }: CourseStoreSaveCompanyProps) =>
        id
          ? await db.update(courseCompany).set({ name }).where(eq(courseCompany.id, id))
          : await db.insert(courseCompany).values({ name }),
      onSuccess: () => client.invalidateQueries({ queryKey: ['courseCompanies'] }),
      onError: (error) => console.error(error),
    }),
    deleteCompany: useMutation({
      mutationKey: ['deleteCompany'],
      mutationFn: async (props: CourseStoreDeleteCompanyProps) =>
        await db.transaction(async (tx) => {
          await tx.delete(course).where(eq(course.courseCompanyId, props));
          await tx.delete(courseCompany).where(eq(courseCompany.id, props));
        }),
      onSuccess: () => client.invalidateQueries({ queryKey: ['courseCompanies'] }),
      onError: (error) => console.error(error),
    }),
    saveCourse: useMutation({
      mutationKey: ['saveCourse'],
      mutationFn: async ({ id, name, location, holes, courseCompanyId }: CourseStoreSaveCourseProps) =>
        id
          ? await db.update(course).set({ name, location, holes, courseCompanyId }).where(eq(course.id, id))
          : await db.insert(course).values({ name, location, holes, courseCompanyId }),
      onSuccess: () => client.invalidateQueries({ queryKey: ['courseCompanies'] }),
      onError: (error) => console.error(error),
    }),
    deleteCourse: useMutation({
      mutationKey: ['deleteCourse'],
      mutationFn: async (props: CourseStoreDeleteCourseProps) => await db.delete(course).where(eq(course.id, props)),
      onSuccess: () => client.invalidateQueries({ queryKey: ['courseCompanies'] }),
      onError: (error) => console.error(error),
    }),
  };
};
