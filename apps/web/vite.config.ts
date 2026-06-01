import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@upadhyay-erp/core': '../../packages/core/src/index.ts',
      '@upadhyay-erp/erp-services': '../../packages/erp-services/src/index.ts',
      '@upadhyay-erp/infra': '../../packages/infra/src/index.ts',
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
});
