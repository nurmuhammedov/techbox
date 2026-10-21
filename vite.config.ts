import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

const backend = process.env.BACKEND_URL || 'http://localhost:8000'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          mantine: ['@mantine/core', '@mantine/hooks', '@mantine/dates', '@mantine/notifications', '@mantine/modals'],
          data: ['@tanstack/react-query', 'i18next', 'react-i18next', 'dayjs'],
        },
      },
    },
  },
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: {
    port: 3000,
    proxy: {
      '/api': backend,
      '/media': backend,
      '/ws': { target: backend.replace('http', 'ws'), ws: true },
    },
  },
})
