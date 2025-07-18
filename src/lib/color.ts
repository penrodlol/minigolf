import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import { Platform } from 'react-native';

export function useColorScheme() {
  const { colorScheme, setColorScheme: setNativewindColorScheme } = useNativewindColorScheme();
  const toggleColorScheme = () => setColorScheme(colorScheme === 'light' ? 'dark' : 'light');
  const setColorScheme = (scheme: Parameters<typeof setNativewindColorScheme>[0]) => setNativewindColorScheme(scheme);

  return {
    colorScheme: colorScheme ?? 'light',
    isDarkColorScheme: colorScheme === 'dark',
    setColorScheme,
    toggleColorScheme,
    colors: COLORS[colorScheme ?? 'light'],
  };
}

export const IOS_SYSTEM_COLORS = {
  white: 'rgb(255, 255, 255)',
  black: 'rgb(0, 0, 0)',
  light: {
    gray1: 'rgb(153, 153, 158)',
    gray2: 'rgb(176, 176, 181)',
    gray3: 'rgb(199, 199, 204)',
    gray4: 'rgb(210, 210, 215)',
    gray5: 'rgb(230, 230, 235)',
    gray6: 'rgb(242, 242, 247)',
    background: 'rgb(242, 242, 247)',
    foreground: 'rgb(0, 0, 0)',
    root: 'rgb(242, 242, 247)',
    card: 'rgb(242, 242, 247)',
    destructive: 'rgb(255, 56, 43)',
    primary: 'rgb(0, 123, 255)',
  },
  dark: {
    gray1: 'rgb(158, 158, 158)',
    gray2: 'rgb(99, 99, 99)',
    gray3: 'rgb(70, 70, 70)',
    gray4: 'rgb(51, 51, 51)',
    gray5: 'rgb(40, 40, 40)',
    gray6: 'rgb(21, 21, 24)',
    background: 'rgb(0, 0, 0)',
    foreground: 'rgb(255, 255, 255)',
    root: 'rgb(0, 0, 0)',
    card: 'rgb(0, 0, 0)',
    destructive: 'rgb(254, 67, 54)',
    primary: 'rgb(3, 133, 255)',
  },
} as const;

export const ANDROID_COLORS = {
  white: 'rgb(255, 255, 255)',
  black: 'rgb(0, 0, 0)',
  light: {
    gray1: 'rgb(231, 234, 234)',
    gray2: 'rgb(233, 236, 236)',
    gray3: 'rgb(236, 239, 239)',
    gray4: 'rgb(239, 241, 241)',
    gray5: 'rgb(244, 246, 246)',
    gray6: 'rgb(249, 251, 251)',
    background: 'rgb(252, 252, 252)',
    foreground: 'rgb(13, 13, 13)',
    root: 'rgb(252, 252, 252)',
    card: 'rgb(252, 252, 252)',
    destructive: 'rgb(186, 26, 26)',
    primary: 'rgb(95, 135, 135)',
  },
  dark: {
    gray1: 'rgb(52, 56, 56)',
    gray2: 'rgb(47, 50, 50)',
    gray3: 'rgb(44, 48, 48)',
    gray4: 'rgb(40, 42, 42)',
    gray5: 'rgb(35, 37, 37)',
    gray6: 'rgb(27, 29, 29)',
    background: 'rgb(24, 25, 25)',
    foreground: 'rgb(229, 231, 231)',
    root: 'rgb(24, 25, 25)',
    card: 'rgb(24, 25, 25)',
    destructive: 'rgb(147, 0, 10)',
    primary: 'rgb(95, 135, 135)',
  },
} as const;

export const COLORS = Platform.OS === 'ios' ? IOS_SYSTEM_COLORS : ANDROID_COLORS;

export const THEME = {
  light: {
    ...DefaultTheme,
    colors: {
      background: COLORS.light.background,
      border: COLORS.light.gray5,
      card: COLORS.light.card,
      notification: COLORS.light.destructive,
      primary: COLORS.light.primary,
      text: COLORS.black,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: COLORS.dark.background,
      border: COLORS.dark.gray5,
      card: COLORS.dark.gray6,
      notification: COLORS.dark.destructive,
      primary: COLORS.dark.primary,
      text: COLORS.white,
    },
  },
};
