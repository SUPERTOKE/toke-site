import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    // Avoid full reloads when `npm run build` writes to dist/ while dev is running
    watch: {
      ignored: ['**/dist/**'],
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_ORIGIN || 'https://mctoken.xyz',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: {
    target: 'esnext',
  },
});
