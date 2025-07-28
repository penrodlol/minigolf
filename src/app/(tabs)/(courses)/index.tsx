import * as Modal from '@/components/modal';
import { Course, CourseCompany } from '@/db';
import { useCourseStore } from '@/lib/store';
import { useAppTheme } from '@/lib/theme';
import { useState } from 'react';
import { SectionList, View } from 'react-native';
import { Button, Divider, FAB, Icon, IconButton, Menu, Portal, Surface, Text, TextInput } from 'react-native-paper';
import { Dropdown } from 'react-native-paper-dropdown';

export default function CoursesPage() {
  const theme = useAppTheme();
  const store = useCourseStore();
  const [courseOrCompanyMenuVisible, setCourseOrCompanyMenuVisible] = useState(false);
  const [companyModalVisible, setCompanyModalVisible] = useState(false);
  const [company, setCompany] = useState<Partial<CourseCompany>>();
  const [companyToDelete, setCompanyToDelete] = useState<CourseCompany>();
  const [courseModalVisible, setCourseModalVisible] = useState(false);
  const [course, setCourse] = useState<Partial<Course>>();
  const [courseToDelete, setCourseToDelete] = useState<Course>();

  return (
    <View style={{ flex: 1 }}>
      <SectionList
        sections={store.courseCompanies.data?.map((company) => ({ ...company, data: company.courses })) ?? []}
        keyExtractor={(item) => String(item.id)}
        ItemSeparatorComponent={Divider}
        renderSectionHeader={({ section: company }) => (
          <Surface elevation={3} style={{ backgroundColor: theme.colors.surfaceVariant, paddingLeft: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: theme.colors.onSurfaceVariant, ...theme.fonts.titleMedium }}>{company.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <IconButton
                  icon="pencil"
                  onPress={() => (setCompany({ id: company.id, name: company.name }), setCompanyModalVisible(true))}
                />
                <IconButton icon="delete" onPress={() => setCompanyToDelete(company)} />
              </View>
            </View>
          </Surface>
        )}
        renderItem={({ item: course }) => {
          const [coureMenuVisible, setCourseMenuVisible] = useState(false);

          return (
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
                visible={coureMenuVisible}
                anchor={<IconButton icon="dots-vertical" onPress={() => setCourseMenuVisible(true)} />}
                onDismiss={() => setCourseMenuVisible(false)}
              >
                <Menu.Item
                  title="Edit"
                  leadingIcon="pencil"
                  onPress={() => (setCourse(course), setCourseMenuVisible(false), setCourseModalVisible(true))}
                />
                <Menu.Item
                  title="Delete"
                  leadingIcon="delete"
                  onPress={() => (setCourseToDelete(course), setCourseMenuVisible(false))}
                />
              </Menu>
            </View>
          );
        }}
      />
      <Portal>
        <FAB.Group
          visible
          open={courseOrCompanyMenuVisible}
          onStateChange={({ open }) => setCourseOrCompanyMenuVisible(open)}
          icon={courseOrCompanyMenuVisible ? 'close' : 'plus'}
          actions={[
            { icon: 'domain', label: 'Company', onPress: () => (setCompany({}), setCompanyModalVisible(true)) },
            { icon: 'golf', label: 'Course', onPress: () => (setCourse({ holes: 18 }), setCourseModalVisible(true)) },
          ]}
        />
      </Portal>
      <Modal.Root visible={companyModalVisible} onDismiss={() => setCompanyModalVisible(false)}>
        <Modal.Header title={company?.id ? 'Edit Company' : 'Add Company'} />
        <Modal.Body>
          <TextInput
            autoFocus
            label="Name"
            value={company?.name}
            right={<TextInput.Icon icon="account-edit" />}
            onChangeText={(name) => setCompany({ ...company, name })}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onPress={() => setCompanyModalVisible(false)}>Cancel</Button>
          <Button
            mode="contained-tonal"
            disabled={!company?.name?.trim()}
            onPress={async () => (
              await store.saveCompany.mutateAsync(company as CourseCompany),
              setCompanyModalVisible(false)
            )}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal.Root>
      <Modal.Root visible={courseModalVisible} onDismiss={() => setCourseModalVisible(false)}>
        <Modal.Header title={course?.id ? 'Edit Course' : 'Add Course'} />
        <Modal.Body>
          <TextInput
            autoFocus
            label="Name"
            value={course?.name}
            right={<TextInput.Icon icon="account-edit" />}
            onChangeText={(name) => setCourse({ ...course, name })}
          />
          <TextInput
            label="Location"
            value={course?.location}
            right={<TextInput.Icon icon="map-marker" />}
            onChangeText={(location) => setCourse({ ...course, location })}
          />
          <TextInput
            label="Holes"
            value={String(course?.holes)}
            keyboardType="numeric"
            right={<TextInput.Icon icon="target" />}
            onChangeText={(holes) => setCourse({ ...course, holes: Number(holes) })}
          />
          <Dropdown
            hideMenuHeader
            label="Company"
            placeholder="Select a company"
            options={store.courseCompanies.data?.map(({ name, id }) => ({ label: name, value: String(id) })) ?? []}
            value={String(course?.courseCompanyId ?? '')}
            onSelect={(value) => setCourse({ ...course, courseCompanyId: value ? Number(value) : undefined })}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onPress={() => setCourseModalVisible(false)}>Cancel</Button>
          <Button
            mode="contained-tonal"
            disabled={!course?.name?.trim() || !course?.location?.trim() || !course?.holes || !course?.courseCompanyId}
            onPress={async () => (await store.saveCourse.mutateAsync(course as Course), setCourseModalVisible(false))}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal.Root>
      <Modal.Root visible={!!companyToDelete} onDismiss={() => setCompanyToDelete(undefined)}>
        <Modal.Header title="Delete Company" />
        <Modal.Body>
          <Text>Are you sure you want to delete this company?</Text>
          <Text>This will also delete all courses associated with this company.</Text>
        </Modal.Body>
        <Modal.Footer>
          <Button onPress={() => setCompanyToDelete(undefined)}>Cancel</Button>
          <Button
            mode="contained-tonal"
            onPress={async () => {
              if (!companyToDelete) return;
              await store.deleteCompany.mutateAsync(companyToDelete.id);
              setCompanyToDelete(undefined);
            }}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal.Root>
      <Modal.Root visible={!!courseToDelete} onDismiss={() => setCourseToDelete(undefined)}>
        <Modal.Header title="Delete Course" />
        <Modal.Body>
          <Text>Are you sure you want to delete this course?</Text>
        </Modal.Body>
        <Modal.Footer>
          <Button onPress={() => setCourseToDelete(undefined)}>Cancel</Button>
          <Button
            mode="contained-tonal"
            onPress={async () => {
              if (!courseToDelete) return;
              await store.deleteCourse.mutateAsync(courseToDelete.id);
              setCourseToDelete(undefined);
            }}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal.Root>
    </View>
  );
}
