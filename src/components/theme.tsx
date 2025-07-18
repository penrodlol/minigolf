import { useColorScheme } from '@/lib/color';
import { MoonStar, Sun } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import Animated, { LayoutAnimationConfig, ZoomInRotate } from 'react-native-reanimated';
import { twMerge } from 'tailwind-merge';

export function Theme() {
  const { colorScheme, setColorScheme } = useColorScheme();

  return (
    <LayoutAnimationConfig skipEntering>
      <Animated.View className="items-center justify-center" key={'toggle-' + colorScheme} entering={ZoomInRotate}>
        <Pressable className="opacity-80" onPress={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}>
          {colorScheme === 'dark'
            ? ({ pressed }) => (
                <View className={twMerge('px-0.5', pressed && 'opacity-50')}>
                  <MoonStar className="text-white" />
                </View>
              )
            : ({ pressed }) => (
                <View className={twMerge('px-0.5', pressed && 'opacity-50')}>
                  <Sun className="text-black" />
                </View>
              )}
        </Pressable>
      </Animated.View>
    </LayoutAnimationConfig>
  );
}
