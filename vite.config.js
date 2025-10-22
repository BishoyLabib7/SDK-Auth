import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  base: '/oauth2/',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Proxy all API requests to backend
      // This prevents conflicts with frontend routes like /oauth/authorize
      '/oauth2/api': {
        target: 'http://localhost:3010',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/oauth2\/api/, ''), // Removes /oauth2/api prefix, so /oauth2/api/forget-password -> /forget-password
      }
    }
  }
})
