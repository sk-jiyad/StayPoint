import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()],
  server: {
    port: 3000,
    // Proxy API calls to the Spring Boot backend so the browser stays same-origin
    // (no CORS in dev). The backend listens on :1004 by default.
    proxy: {
      "/api": "http://localhost:1004",
    },
  },
})
