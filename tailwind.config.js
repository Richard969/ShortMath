/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        app: {
          bg: 'rgb(var(--app-bg) / <alpha-value>)',
          surface: 'rgb(var(--app-surface) / <alpha-value>)',
          elevated: 'rgb(var(--app-elevated) / <alpha-value>)',
          text: 'rgb(var(--app-text) / <alpha-value>)',
          'text-secondary': 'rgb(var(--app-text-secondary) / <alpha-value>)',
          'text-muted': 'rgb(var(--app-text-muted) / <alpha-value>)',
          border: 'rgb(var(--app-border) / <alpha-value>)',
        },
        chalk: {
          yellow: 'rgb(var(--chalk-yellow-rgb) / <alpha-value>)',
          pink: 'rgb(var(--chalk-pink-rgb) / <alpha-value>)',
          blue: 'rgb(var(--chalk-blue-rgb) / <alpha-value>)',
          green: 'rgb(var(--chalk-green-rgb) / <alpha-value>)',
          white: '#e8e4df',
        },
        brand: {
          50: '#fdf8e8',
          100: '#faefc0',
          200: '#f6e498',
          300: '#f2d970',
          400: '#f0d060',
          500: '#e8c030',
          600: '#c8a020',
          700: '#a08018',
          800: '#786010',
          900: '#504008',
        },
        magenta: {
          400: '#f0a0b0',
          500: '#e88090',
          600: '#c06070',
        },
        gold: {
          400: '#f0d880',
          500: '#f0d060',
          600: '#d0b040',
        },
        surface: {
          deep: 'rgb(var(--app-bg) / <alpha-value>)',
          mid: 'rgb(var(--app-bg) / <alpha-value>)',
          card: 'rgb(var(--app-surface) / <alpha-value>)',
          elevated: 'rgb(var(--app-elevated) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['Lora', 'Georgia', 'Times New Roman', 'serif'],
        hand: ['Caveat', 'Segoe Script', 'cursive'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        body: ['Lora', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
