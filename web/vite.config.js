import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // 部署到 GitHub Pages 子路径 /blogroll/
  // 与组织主站 ippclub.github.io 共用同一 GitHub Pages，无需额外账号配置
  // 如果未来配置了自定义域名（如 blogroll.ippclub.org），将 base 改回 '/'  
  base: '/blogroll/',
})