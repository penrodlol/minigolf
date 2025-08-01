import { Course, course, CourseCompany, courseCompany, db } from '@/db';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { asc, eq } from 'drizzle-orm';

export type CourseStoreCourseCompanies = NonNullable<ReturnType<typeof useCourseStore>['courseCompanies']['data']>;
export type CourseStoreSaveCompanyProps = Omit<CourseCompany, 'id'> & { id: CourseCompany['id'] | undefined };
export type CourseStoreDeleteCompanyProps = CourseCompany['id'];
export type CourseStoreSaveCourseProps = Omit<Course, 'id'> & { id: Course['id'] | undefined };
export type CourseStoreDeleteCourseProps = Course['id'];

export const useCourseStore = () => {
  const client = useQueryClient();

  return {
    courses: useQuery({ queryKey: ['courses'], queryFn: () => db.select().from(course).orderBy(asc(course.name)) }),
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
