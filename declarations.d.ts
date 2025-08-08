declare module "tailwindcss-animate" {
    const plugin: any;
    export default plugin;
}

declare module "../../api/axios" {
    import { AxiosInstance } from 'axios';
    const api: AxiosInstance;
    export default api;
}

// Vite 환경변수 타입 정의
interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    readonly VITE_CDN_BASE_URL: string;
    readonly VITE_KAKAO_MAP_ID: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}