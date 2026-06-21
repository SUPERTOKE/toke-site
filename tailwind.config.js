/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{vue,js,ts}'],
  theme: {
    screens: {
      'sm': '640px',
      // => @media (min-width: 640px) { ... }

      'md': '768px',
      // => @media (min-width: 768px) { ... }

      'lg': '1024px',
      // => @media (min-width: 1024px) { ... }

      'xl': '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }

      '3xl': '1800px',
      // => @media (min-width: 1536px) { ... }
    },
    extend: {
      // Refresh design tokens (additive — existing utilities unchanged).
      fontFamily: {
        display: ['Space Grotesk', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        numeric: ['JetBrains Mono', 'ui-monospace', 'Menlo', 'monospace'],
      },
      colors: {
        mcblue: { DEFAULT: '#5aa2ff', deep: '#2f6fd6', ink: '#06101f' },
        mcbase: { DEFAULT: '#0a0c10', deep: '#06070a', panel: '#13161d', panel2: '#181c24' },
        mcline: { DEFAULT: '#242a33', strong: '#2e3540' },
        mctext: { DEFAULT: '#e7eaef', mut: '#8b94a3', mut2: '#5b6472' },
        mcdata: { teal: '#5ad1b3', gold: '#e7b84a', purple: '#9b8cff' },
      },
      keyframes: {
        gradientWave: {
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' },
        },
      },
      animation: {
        gradientWave: 'gradientWave 15s ease infinite',
      },
    },
  },
  plugins: [],
}

