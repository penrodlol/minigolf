import { Course } from '@/db';
import { useStore } from '@/store';
import { useState } from 'react';
import { Button, FlatList, Modal, Text, TextInput, View } from 'react-native';

export default function CoursesScreen() {
  const store = useStore();
  const [editing, setEditing] = useState(false);
  const [course, setCourse] = useState<Omit<Course, 'id'> & { id: Course['id'] | undefined }>();

  return (
    <View style={{ display: 'flex', flexDirection: 'column', gap: 40, padding: 20 }}>
      <FlatList
        data={store.courses.data ?? []}
        keyExtractor={(course) => String(course.id)}
        renderItem={({ item: course }) => (
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ flex: 1 }}>{course.name}</Text>
            <Button title="Edit" onPress={() => (setCourse(course), setEditing(true))} />
            <Button title="Delete" onPress={() => store.deleteCourse.mutate(course.id)} />
          </View>
        )}
      />
      <Button title="Add Course" onPress={() => setEditing(true)} />
      <Modal animationType="slide" visible={editing} onRequestClose={() => (setEditing(false), setCourse(undefined))}>
        <View style={{ display: 'flex', flexDirection: 'column', gap: 40, padding: 20 }}>
          <TextInput
            placeholder="Course Name"
            value={course?.name}
            style={{ borderWidth: 1 }}
            onChangeText={(name) => setCourse({ id: course?.id, name, holes: course?.holes ?? 18 })}
          />
          <TextInput
            placeholder="Course Holes"
            keyboardType="number-pad"
            value={course?.holes?.toString() ?? '18'}
            style={{ borderWidth: 1 }}
            onChangeText={(holes) => setCourse({ id: course?.id, name: course?.name ?? '', holes: Number(holes) })}
          />
          <Button
            title="Save"
            onPress={async () => {
              if (course?.id)
                await store.updateCourse.mutateAsync({ id: course.id, name: course.name, holes: course.holes });
              else if (course?.name) await store.addCourse.mutateAsync({ name: course.name, holes: course.holes });
              setEditing(false);
              setCourse(undefined);
            }}
          />
        </View>
      </Modal>
    </View>
  );
}
