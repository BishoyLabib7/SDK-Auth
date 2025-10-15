import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Use /testAPI/oauth/ for production, /oauth/ for development
  const base = mode === 'production' ? '/testAPI/oauth/' : '/oauth/';
  
  return {
    plugins: [react(), tailwindcss()],
    build: {
      outDir: '../poswize-backend-dashboard_and_app/public/oauth-sdk',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
    base,
    define: {
      'process.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || ''),
    },
  };
})
