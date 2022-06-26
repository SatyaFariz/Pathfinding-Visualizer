import { defineConfig, loadEnv } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [solidPlugin()],
    build: {
      target: 'esnext',
      polyfillDynamicImport: false,
    },
    define: {
      __APP_ENV__: env.NODE_ENV
    }
  }
});
