import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        earth: {
          50: '#faf6f1',
          100: '#f0e8dc',
          800: '#3d2f24',
          950: '#1c1410',
        },
        jade: { 500: '#0d9488', 600: '#0f766e' },
      },
    },
  },
  plugins: [],
} satisfies Config;
