declare module "tailwindcss-animate" {
    const plugin: any;
    export default plugin;
}

declare module "../../api/axios" {
    import { AxiosInstance } from 'axios';
    const api: AxiosInstance;
    export default api;
}