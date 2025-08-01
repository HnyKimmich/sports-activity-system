import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // 允许外部访问
    port: 5173,
    proxy: {
      '/api': 'http://192.168.56.1:3001'  // 更新代理地址
    }
  }
})
