// src/api/axios.js
import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({

    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    withCredentials: true,

});

// ✅ 모든 응답 에러를 toast로 띄우는 인터셉터
api.interceptors.response.use(
  (res) => res,
  (error) => {
    let msg = "알 수 없는 오류가 발생했습니다.";
    // 서버 커스텀 메시지 있으면 그걸로
    if (error.response?.data?.message) msg = error.response.data.message;
    else if (error.response?.data?.error) msg = error.response.data.error;
    else if (error.response?.status === 401) msg = "로그인이 필요합니다.";
    else if (error.response?.status === 403) msg = "권한이 없습니다.";
    else if (error.message) msg = error.message;
    toast.error(msg);
    // 필요하면 아래 주석 해제: 실제 에러처리까지 전달
    // return Promise.reject(error);
  }
);

// 인증 헤더 자동 추가 인터셉터
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
