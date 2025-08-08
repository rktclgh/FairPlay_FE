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
        "/api": {
          target: "http://localhost:9000",
          changeOrigin: true,
        },
        // 이 부분! → 정규식 대신 prefix 전체로 처리
        "/ws": {
          target: "http://localhost:9000",
          ws: true,
          changeOrigin: true,
        },
      },
    },
  };
});
