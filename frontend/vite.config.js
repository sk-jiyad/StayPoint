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
    // Bind 0.0.0.0 and accept any Host header so the dev server is reachable over
    // a LAN/router forward or a tunnel (ngrok, VS Code port forwarding, cloudflared).
    host: true,
    allowedHosts: true,
    // Proxy API calls to the Spring Boot backend so the browser stays same-origin
    // (no CORS in dev). The backend listens on :1004 on THIS machine, so a friend
    // hitting the forwarded :3000 reaches your backend through this proxy — only
    // port 3000 needs to be forwarded, not 1004.
    proxy: {
      "/api": "http://localhost:1004",
    },
  },
})
