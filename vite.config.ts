import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'
  return {
    plugins: [
      vueDevTools(),
      tsconfigPaths(),
      tailwindcss(),
      vue(),
      vueJsx(),
      vueDevTools(),
      viteStaticCopy({
        targets: [{ src: 'manifest.json', dest: '.' }],
      }),
      // viteStaticCopy({
      //   targets: [{ src: 'content.css', dest: '.' }],
      // }),
      viteStaticCopy({
        targets: [{ src: 'src/assets/icons', dest: '.' }],
      }),
    ],
    build: {
      emptyOutDir: false,
      minify: isProduction,
      sourcemap: !isProduction,
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'index.html'), // Entry point for popup
          // background: resolve(__dirname, 'chrome-scripts/background.ts'), // Entry point for background script
          //content: resolve(__dirname, "chrome-scripts/content.ts"), // Entry point for content script
        },
        output: {
          // Avoid code splitting for compatibility with manifest V3
          manualChunks: undefined,
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name === 'background') {
              return 'scripts/background.js' // Output for background script
            }
            if (chunkInfo.name === 'content') {
              return 'scripts/content.js' // Output for content script
            }
            return 'assets/[name]-[hash].js' // Default output for other assets
          },
          assetFileNames: 'assets/[name]-[hash].[ext]', // Default asset path
          chunkFileNames: 'assets/[name]-[hash].js', // Default chunk path
        },
        external: [], // Ensure no external dependencies are left out
      },
      outDir: 'dist',
    },
  }
})
