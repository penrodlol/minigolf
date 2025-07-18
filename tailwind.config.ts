import { hairlineWidth, platformSelect } from 'nativewind/theme';
import type { Config } from 'tailwindcss';

const withValue = (name: string) =>
  platformSelect({
    ios: `rgb(var(--${name}) / <alpha-value>)`,
    android: `rgba(var(--android-${name}) / <alpha-value>)`,
  });

export default {
  content: ['./src/**/*.tsx'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        border: withValue('border'),
        input: withValue('input'),
        ring: withValue('ring'),
        background: withValue('background'),
        foreground: withValue('foreground'),
        primary: { DEFAULT: withValue('primary'), foreground: withValue('primary-foreground') },
        secondary: { DEFAULT: withValue('secondary'), foreground: withValue('secondary-foreground') },
        destructive: { DEFAULT: withValue('destructive'), foreground: withValue('destructive-foreground') },
        muted: { DEFAULT: withValue('muted'), foreground: withValue('muted-foreground') },
        accent: { DEFAULT: withValue('accent'), foreground: withValue('accent-foreground') },
        popover: { DEFAULT: withValue('popover'), foreground: withValue('popover-foreground') },
        card: { DEFAULT: withValue('card'), foreground: withValue('card-foreground') },
      },
      borderWidth: { hairline: hairlineWidth() },
    },
  },
  plugins: [],
} satisfies Config;
