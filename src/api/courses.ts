import { Course, course, CourseCompany, courseCompany, db } from '@/db';
import { asc, eq } from 'drizzle-orm';

export type CoursesAPI_GET_Courses = Awaited<ReturnType<typeof getCourses>>;
export type CoursesAPI_GET_CourseCompanies = Awaited<ReturnType<typeof getCourseCompanies>>;
export type CoursesAPI_POST_SaveCourseCompany_Props = { id?: CourseCompany['id']; name: CourseCompany['name'] };
export type CoursesAPI_DELETE_DeleteCourseCompany_Props = CourseCompany['id'];
export type CoursesAPI_POST_SaveCourse_Props = Omit<Course, 'id'> & { id?: Course['id'] };
export type CoursesAPI_DELETE_DeleteCourse_Props = Course['id'];

export const getCourses = async () => db.select().from(course).orderBy(asc(course.name));

export const getCourseCompanies = async () =>
  db.query.courseCompany.findMany({
    with: { courses: { orderBy: [asc(course.name)] } },
    orderBy: [asc(courseCompany.name)],
  });

export const saveCourseCompany = async (props: CoursesAPI_POST_SaveCourseCompany_Props) =>
  props.id
    ? db.update(courseCompany).set({ name: props.name }).where(eq(courseCompany.id, props.id))
    : db.insert(courseCompany).values({ name: props.name });

export const deleteCourseCompany = async (props: CoursesAPI_DELETE_DeleteCourseCompany_Props) =>
  db.transaction(async (tx) => {
    await tx.delete(course).where(eq(course.courseCompanyId, props));
    await tx.delete(courseCompany).where(eq(courseCompany.id, props));
  });

export const saveCourse = async (props: CoursesAPI_POST_SaveCourse_Props) =>
  props.id ? db.update(course).set(props).where(eq(course.id, props.id)) : db.insert(course).values(props);

export const deleteCourse = async (props: CoursesAPI_DELETE_DeleteCourse_Props) =>
  db.delete(course).where(eq(course.id, props));
