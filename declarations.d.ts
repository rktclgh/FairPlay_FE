declare module "tailwindcss-animate" {
  const plugin: any;
  export default plugin;
}

declare module "../../api/axios" {
  import { AxiosInstance } from "axios";
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

// Kakao Map API 타입 정의
interface Window {
  kakao: {
    maps: {
      load: (callback: () => void) => void;
      Map: new (container: HTMLElement, options: any) => any;
      LatLng: new (lat: number, lng: number) => any;
      CustomOverlay: new (options: any) => any;
      MapTypeControl: new () => any;
      ZoomControl: new () => any;
      LatLngBounds: new () => any;
      MapTypeId: {
        ROADMAP: string;
      };
      ControlPosition: {
        TOPRIGHT: string;
        RIGHT: string;
      };
      services: {
        Geocoder: new () => any;
        Places: new () => any;
        Status: {
          OK: string;
          ZERO_RESULT: string;
        };
      };
    };
  };
  // Swiper instance for hero section thumbnail hover control
  heroSwiper?: import("swiper").Swiper;
}

// Allow importing Swiper CSS in TS
declare module "swiper/css";
declare module "swiper/css/effect-fade";
declare module "swiper/css/navigation";
declare module "swiper/css/effect-coverflow";
