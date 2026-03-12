import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'midnight-navy': '#0B0F1C',
        'deep-navy': '#1A2040',
        'matte-gold': '#D4A843',
        'signal-white': '#F5F5F5',
        'muted-silver': '#8B9BAE',
      },
    },
  },
  plugins: [],
};

export default config;
