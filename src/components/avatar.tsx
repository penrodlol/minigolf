import { useAppTheme } from '@/lib/theme';
import { AvatarTextProps, Avatar as ReactNativePaperAvatar } from 'react-native-paper';

export type AvatarProps = AvatarTextProps;

export default function Avatar({ labelStyle, style, ...props }: AvatarProps) {
  const theme = useAppTheme();

  return (
    <ReactNativePaperAvatar.Text
      {...props}
      labelStyle={[{ color: theme.colors.onSecondary }, labelStyle]}
      style={[{ backgroundColor: theme.colors.secondary }, style]}
    />
  );
}
