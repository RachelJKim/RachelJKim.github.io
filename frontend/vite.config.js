import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // bind all interfaces (localhost + LAN + Tailscale) so a phone can reach it
    allowedHosts: ['.ts.net'], // allow Tailscale MagicDNS hostnames (*.ts.net)
  },
})
