import { useAppTheme } from '@/lib/theme';
import { View, ViewProps } from 'react-native';
import { ModalProps, Portal, Modal as ReactNativePaperModal, Text } from 'react-native-paper';

export type ModalRootProps = ModalProps;
export type ModalHeaderProps = Omit<ViewProps, 'children'> & { title: string };
export type ModalBodyProps = ViewProps;
export type ModalFooterProps = ViewProps;

export function Root({ contentContainerStyle, ...props }: ModalRootProps) {
  const theme = useAppTheme();

  return (
    <Portal>
      <ReactNativePaperModal
        {...props}
        contentContainerStyle={[
          {
            position: 'absolute',
            top: 30,
            insetInline: 10,
            flexDirection: 'column',
            gap: 30,
            padding: 20,
            borderRadius: 20,
            backgroundColor: theme.colors.surface,
          },
          contentContainerStyle,
        ]}
      />
    </Portal>
  );
}

export function Header({ title, ...props }: ModalHeaderProps) {
  return (
    <View {...props}>
      <Text variant="titleLarge">{title}</Text>
    </View>
  );
}

export function Body({ style, ...props }: ModalBodyProps) {
  return <View {...props} style={[{ flexDirection: 'column', gap: 16 }, style]} />;
}

export function Footer(props: ModalFooterProps) {
  return (
    <View {...props} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }} />
  );
}
