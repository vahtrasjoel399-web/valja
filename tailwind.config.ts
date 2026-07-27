import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: '#FFFFFF',
        surface: '#FFFFFF',
        ink: '#171717',
        soft: '#525252',
        faint: '#737373',
        beige: '#EFEFEC',
        sand: '#F7F7F4',
        rose: '#D9B8C4',
        accent: '#9B6A82',
        accentDeep: '#7C5468',
        line: '#EAEAE7',
      },
      letterSpacing: {
        tightest: '-0.03em',
      },
    },
  },
  plugins: [],
};

export default config;
