// src/api/axios.js
import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://fair-play.ink'),
  withCredentials: true,
});

// ✅ 모든 응답 에러를 toast로 띄우는 인터셉터
api.interceptors.response.use(
  (res) => res,
  (error) => {
    let msg = "알 수 없는 오류가 발생했습니다.";
    let showToast = true;
    
    // 네트워크 오류 (서버 연결 실패)
    if (error.code === 'ERR_NETWORK' || !error.response) {
      msg = "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.";
      console.warn('백엔드 서버가 실행되지 않았거나 네트워크 오류가 발생했습니다.');
      showToast = false; // 네트워크 오류는 토스트를 표시하지 않음 (콘솔에만 로그)
    }
    // 서버 커스텀 메시지 있으면 그걸로
    else if (error.response?.data?.message) msg = error.response.data.message;
    else if (error.response?.data?.error) msg = error.response.data.error;
    else if (error.response?.status === 401) msg = "로그인이 필요합니다.";
    else if (error.response?.status === 403) msg = "권한이 없습니다.";
    else if (error.message) msg = error.message;
    
    if (showToast) {
      toast.error(msg);
    }
    
    // 실제 에러를 계속 전달하여 각 컴포넌트에서 적절히 처리할 수 있도록 함
    return Promise.reject(error);
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
