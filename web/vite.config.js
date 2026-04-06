import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // 部署到 GitHub Pages 的子路径 /blogroll/
  // 与组织主站 ippclub.github.io 共���同一 GitHub Pages，无需额外域名配置
  base: '/blogroll/',
})