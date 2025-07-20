import { useAppTheme } from '@/lib/theme';
import { ComponentProps, useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export type SkeletonProps = ComponentProps<typeof Animated.View> & {
  width?: ViewStyle['width'];
  height?: ViewStyle['height'];
};

export default function Skeleton({ style, width, height, ...props }: SkeletonProps) {
  const { roundness, colors } = useAppTheme();
  const opacity = useSharedValue(0);
  const pulseStyle = useAnimatedStyle(() => ({ opacity: opacity.value }), []);

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 300 }),
      withRepeat(withTiming(0.4, { duration: 1000, easing: Easing.inOut(Easing.ease) }), -1, true),
    );
  }, []);

  return (
    <Animated.View
      style={[{ width, height, borderRadius: roundness, backgroundColor: colors.surfaceVariant }, pulseStyle, style]}
      {...props}
    />
  );
}
