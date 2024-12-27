import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import rollupReplace from "@rollup/plugin-replace";

export default defineConfig({
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "./src"),
      },
    ],
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
  server: {
    proxy: {
      '/api/': {
        // target: 'https://ad-management-ad-management-api.t0llnh.easypanel.host/',
        target : "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        timeout: 60000, // Increase the timeout value (in milliseconds)
      },
    },
  },
  plugins: [
    rollupReplace({
      preventAssignment: true,
      values: {
        __DEV__: JSON.stringify(true),
        "process.env.NODE_ENV": JSON.stringify("development"),
      },
    }),
    react(),
  ],
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000, // Increase this value as needed
    rollupOptions: {
      output: {
        // Split large dependencies into smaller chunks
        manualChunks: {
          vendor: ["react", "react-dom"],
          utils: ["axios", "lodash"], // Example of splitting out utility libraries
        },
      },
    },
  },
});
