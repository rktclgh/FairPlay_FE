import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    define: {
      __VITE_KAKAO_MAP_ID__: JSON.stringify(env.VITE_KAKAO_MAP_ID),
    },
  };
});