/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0E14',
        surface: '#10151D',
        surface2: '#161C26',
        border: '#212938',
        text: '#E6EAF0',
        dim: '#8792A3',
        cyan: '#22D3EE',
        green: '#34D399',
        amber: '#FBBF24',
        red: '#FB7185',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
