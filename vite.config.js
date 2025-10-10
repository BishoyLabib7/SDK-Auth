import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  base: './', // Use relative paths to work with any base URL
  build: {
    outDir: 'dist/oauth-ui',
    emptyOutDir: true,
  },
  server: {
    port: 3003,
    proxy: {
      '/': {
        target: 'http://localhost:3010',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
