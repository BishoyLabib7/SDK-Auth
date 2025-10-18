import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Derive base from VITE_API_BASE_URL
  const apiBaseUrl = process.env.VITE_API_BASE_URL || '';
  let base = '/oauth/';
  if (apiBaseUrl) {
    try {
      const url = new URL(apiBaseUrl);
      const pathname = url.pathname === '/' ? '' : url.pathname;
      base = pathname + '/oauth/';
    } catch (e) {
      console.warn('Invalid VITE_API_BASE_URL, using default /oauth/');
    }
  }

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
