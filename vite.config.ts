import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  // Gitee Pages 部署在 https://zcmk123.gitee.io/hng-calculator/，生产环境需要子路径
  base: mode === 'production' ? '/hng-calculator/' : '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          // 框架运行时独立 chunk，便于浏览器长期缓存
          vendor: ['vue', 'vue-router', 'pinia', 'vue-i18n'],
          // 武器数据 624KB 独立 chunk，与主逻辑解耦
          weapons: ['src/data/weapons.ts'],
        },
      },
    },
  },
}))
