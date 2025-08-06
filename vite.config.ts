import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window'
  },
  server: {
    proxy: {
      // /api는 기존대로
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // 이 부분! → 정규식 대신 prefix 전체로 처리
      '/ws': {
        target: 'http://localhost:8080',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
