import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src', // Resolve @ to the src directory
    },
  },
  server: {
    host: true,        // listen on 0.0.0.0 so Docker can forward traffic
    port: 5173,
    watch: {
      usePolling: true // helps hot reload on WSL with /mnt/d files
    },
  },
});
