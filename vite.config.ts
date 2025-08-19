import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    define: {
      global: "window",
      __VITE_KAKAO_MAP_ID__: JSON.stringify(env.VITE_KAKAO_MAP_ID),
    },
    server: {
      host: true,
      port: 5173,
      strictPort: false,
      cors: true,
      historyApiFallback: true,
      proxy: {
        "/api": {
          target: env.VITE_BACKEND_BASE_URL || "http://localhost:8080",
          changeOrigin: true,
        },
        // 이 부분! → 정규식 대신 prefix 전체로 처리
        "/ws": {
          target: env.VITE_BACKEND_BASE_URL || "http://localhost:8080",
          ws: true,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: "dist",
      rollupOptions: {
        // SPA 라우팅을 위한 히스토리 API 폴백 지원
        input: {
          main: "./index.html"
        }
      }
    },
    preview: {
      // 빌드된 앱 미리보기에서도 히스토리 API 폴백 적용
      port: 4173,
      strictPort: true,
      historyApiFallback: true
    }
  };
});
