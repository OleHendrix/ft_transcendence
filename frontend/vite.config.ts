import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from "vite-plugin-svgr";
import fs from 'fs';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, './ssl/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, './ssl/cert.pem')),
    },
    host: '0.0.0.0', // Ensure that the server is accessible on LAN
    port: 5173, // Adjust the port if needed
  },
  plugins: [react(), tailwindcss(), svgr()],
})
