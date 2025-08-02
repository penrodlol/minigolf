import * as api from '@/api/courses';
import * as Modal from '@/components/modal';
import { Course, CourseCompany } from '@/db';
import { useAppTheme } from '@/lib/theme';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { SectionList, View } from 'react-native';
import { Button, Divider, FAB, Icon, IconButton, Menu, Portal, Text, TextInput } from 'react-native-paper';
import { Dropdown } from 'react-native-paper-dropdown';

export default function CoursesPage() {
  const theme = useAppTheme();
  const client = useQueryClient();

  const [addCompanyOrCourseFabOpen, setAddCompanyOrCourseFabOpen] = useState(false);
  const [deleteCompanyId, setDeleteCompanyId] = useState<CourseCompany['id']>();
  const [addEditCompanyModalVisible, setAddEditCompanyModalVisible] = useState(false);
  const [editCompany, setEditCompany] = useState<Partial<CourseCompany>>();
  const [menuCourseId, setMenuCourseId] = useState<Course['id']>();
  const [deleteCourseId, setDeleteCourseId] = useState<Course['id']>();
  const [addEditCourseModalVisible, setAddEditCourseModalVisible] = useState(false);
  const [editCourse, setEditCourse] = useState<Partial<Course>>();

  const courseCompanies = useQuery({ queryKey: ['courseCompanies'], queryFn: () => api.getCourseCompanies() });
  const saveCompany = useMutation({
    mutationKey: ['saveCompany'],
    mutationFn: (props: api.CoursesAPI_POST_SaveCourseCompany_Props) => api.saveCourseCompany(props),
    onSuccess: () => client.invalidateQueries(),
    onError: (error) => console.error(error),
  });
  const deleteCompany = useMutation({
    mutationKey: ['deleteCompany'],
    mutationFn: (props: api.CoursesAPI_DELETE_DeleteCourseCompany_Props) => api.deleteCourseCompany(props),
    onSuccess: () => client.invalidateQueries({ queryKey: ['courseCompanies'] }),
    onError: (error) => console.error(error),
  });
  const saveCourse = useMutation({
    mutationKey: ['saveCourse'],
    mutationFn: (props: api.CoursesAPI_POST_SaveCourse_Props) => api.saveCourse(props),
    onSuccess: () => client.invalidateQueries(),
    onError: (error) => console.error(error),
  });
  const deleteCourse = useMutation({
    mutationKey: ['deleteCourse'],
    mutationFn: (props: api.CoursesAPI_DELETE_DeleteCourse_Props) => api.deleteCourse(props),
    onSuccess: () => client.invalidateQueries({ queryKey: ['courseCompanies'] }),
    onError: (error) => console.error(error),
  });

  return (
    <View style={{ flex: 1 }}>
      <SectionList
        sections={courseCompanies.data?.map((company) => ({ ...company, data: company.courses })) ?? []}
        keyExtractor={(item) => String(item.id)}
        ItemSeparatorComponent={Divider}
        contentContainerStyle={{ paddingBottom: 56 }}
        renderSectionHeader={({ section: company }) => (
          <View style={{ backgroundColor: theme.colors.surfaceVariant, paddingLeft: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: theme.colors.onSurfaceVariant, ...theme.fonts.titleMedium }}>{company.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <IconButton
                  icon="pencil"
                  onPress={() => (setEditCompany(company), setAddEditCompanyModalVisible(true))}
                />
                <IconButton icon="delete" onPress={() => setDeleteCompanyId(company.id)} />
              </View>
            </View>
          </View>
        )}
        renderItem={({ item: course }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'column', gap: 2, paddingVertical: 16, paddingHorizontal: 24 }}>
              <Text variant="bodyLarge">{course.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ color: theme.colors.onSurfaceVariant }}>{course.location}</Text>
                <Icon source="circle-small" size={16} color={theme.colors.onSurfaceVariant} />
                <Text style={{ color: theme.colors.onSurfaceVariant }}>{course.holes} Holes</Text>
              </View>
            </View>
            <Menu
              visible={menuCourseId === course.id}
              anchor={<IconButton icon="dots-vertical" onPress={() => setMenuCourseId(course.id)} />}
              onDismiss={() => setMenuCourseId(undefined)}
            >
              <Menu.Item
                title="Edit"
                leadingIcon="pencil"
                onPress={() => (setMenuCourseId(undefined), setEditCourse(course), setAddEditCourseModalVisible(true))}
              />
              <Menu.Item
                title="Delete"
                leadingIcon="delete"
                onPress={() => (setMenuCourseId(undefined), setDeleteCourseId(course.id))}
              />
            </Menu>
          </View>
        )}
      />
      <Portal.Host>
        <Portal>
          <FAB.Group
            visible
            open={addCompanyOrCourseFabOpen}
            icon={addCompanyOrCourseFabOpen ? 'close' : 'plus'}
            onStateChange={({ open }) => setAddCompanyOrCourseFabOpen(open)}
            style={{ paddingBottom: 0 }}
            actions={[
              {
                icon: 'domain',
                label: 'Company',
                onPress: () => (setEditCompany(undefined), setAddEditCompanyModalVisible(true)),
              },
              {
                icon: 'golf',
                label: 'Course',
                onPress: () => (setEditCourse(undefined), setAddEditCourseModalVisible(true)),
              },
            ]}
          />
        </Portal>
      </Portal.Host>

      <Modal.Root visible={!!deleteCourseId} onDismiss={() => setDeleteCourseId(undefined)}>
        <Modal.Header title="Delete Course" />
        <Modal.Body>
          <Text>Are you sure you want to delete this course?</Text>
        </Modal.Body>
        <Modal.Footer>
          <Button onPress={() => setDeleteCourseId(undefined)}>Cancel</Button>
          <Button
            mode="contained-tonal"
            onPress={() => (deleteCourse.mutateAsync(Number(deleteCourseId)), setDeleteCourseId(undefined))}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal.Root>
      <Modal.Root visible={!!deleteCompanyId} onDismiss={() => setDeleteCompanyId(undefined)}>
        <Modal.Header title="Delete Company" />
        <Modal.Body>
          <Text>Are you sure you want to delete this company?</Text>
          <Text>This will also delete all associated courses.</Text>
        </Modal.Body>
        <Modal.Footer>
          <Button onPress={() => setDeleteCompanyId(undefined)}>Cancel</Button>
          <Button
            mode="contained-tonal"
            onPress={() => (deleteCompany.mutateAsync(Number(deleteCompanyId)), setDeleteCompanyId(undefined))}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal.Root>
      <Modal.Root visible={addEditCompanyModalVisible} onDismiss={() => setAddEditCompanyModalVisible(false)}>
        <Modal.Header title={editCompany?.id ? 'Edit Company' : 'Add Company'} />
        <Modal.Body>
          <TextInput
            autoFocus
            label="Name"
            value={editCompany?.name}
            right={<TextInput.Icon icon="account-edit" />}
            onChangeText={(name) => setEditCompany({ ...editCompany, name })}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onPress={() => setAddEditCompanyModalVisible(false)}>Cancel</Button>
          <Button
            mode="contained-tonal"
            disabled={!editCompany?.name?.trim()}
            onPress={async () => (
              await saveCompany.mutateAsync(editCompany as CourseCompany),
              setAddEditCompanyModalVisible(false)
            )}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal.Root>
      <Modal.Root visible={addEditCourseModalVisible} onDismiss={() => setAddEditCourseModalVisible(false)}>
        <Modal.Header title={editCourse?.id ? 'Edit Course' : 'Add Course'} />
        <Modal.Body>
          <TextInput
            autoFocus
            label="Name"
            value={editCourse?.name}
            right={<TextInput.Icon icon="account-edit" />}
            onChangeText={(name) => setEditCourse({ ...editCourse, name })}
          />
          <TextInput
            label="Location"
            value={editCourse?.location}
            right={<TextInput.Icon icon="map-marker" />}
            onChangeText={(location) => setEditCourse({ ...editCourse, location })}
          />
          <TextInput
            label="Holes"
            value={String(editCourse?.holes ?? 18)}
            keyboardType="numeric"
            maxLength={2}
            right={<TextInput.Icon icon="target" />}
            onChangeText={(holes) => setEditCourse({ ...editCourse, holes: Number(holes.replace(/\D/g, '')) })}
          />
          <Dropdown
            hideMenuHeader
            label="Company"
            placeholder="Select a company"
            options={courseCompanies.data?.map(({ name, id }) => ({ label: name, value: String(id) })) ?? []}
            value={String(editCourse?.courseCompanyId ?? '')}
            onSelect={(value) => setEditCourse({ ...editCourse, courseCompanyId: value ? Number(value) : undefined })}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onPress={() => setAddEditCourseModalVisible(false)}>Cancel</Button>
          <Button
            mode="contained-tonal"
            disabled={!editCourse?.name?.trim()}
            onPress={async () => {
              await saveCourse.mutateAsync(editCourse as Course);
              setAddEditCourseModalVisible(false);
            }}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal.Root>
    </View>
  );
}
