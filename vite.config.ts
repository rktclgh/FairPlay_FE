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
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
        },
        // 이 부분! → 정규식 대신 prefix 전체로 처리
        "/ws": {
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          ws: true,
          changeOrigin: true,
        },
      },
    },
    define: {
      __VITE_KAKAO_MAP_ID__: JSON.stringify(env.VITE_KAKAO_MAP_ID),
      __VITE_API_BASE_URL__: JSON.stringify(env.VITE_API_BASE_URL),
      __VITE_CDN_BASE_URL__: JSON.stringify(env.VITE_CDN_BASE_URL),
    },
  };
});
