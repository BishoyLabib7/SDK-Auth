import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Proxy all API requests to backend
      // This prevents conflicts with frontend routes like /oauth/authorize
      '/api': {
        target: 'http://localhost:3010',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''), // Removes /api prefix, so /api/forget-password -> /forget-password
      }
    }
  }
})
