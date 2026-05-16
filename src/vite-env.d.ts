/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_BACKEND_BASE_URL: string;
    readonly VITE_FRONTEND_BASE_URL: string;
    readonly VITE_CDN_BASE_URL: string;
    readonly VITE_KAKAO_CLIENT_ID: string;
    readonly VITE_KAKAO_MAP_ID: string;
    readonly VITE_BUSINESS_SERVICE_KEY: string;
}
