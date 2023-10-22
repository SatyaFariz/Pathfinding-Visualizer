import { defineConfig, loadEnv } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [solidPlugin()],
    build: {
      target: 'esnext',
      polyfillDynamicImport: false,
    },
    base: '/Pathfinding-Visualizer/',
    mode: env.NODE_ENV,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    }
  }
});