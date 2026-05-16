// src/api/axios.js
import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://fair-play.ink'),
  withCredentials: true,
});

const isSilentAuthRequest = (headers: unknown): boolean => {
  if (!headers) return false;

  if (typeof headers === 'object' && 'get' in headers && typeof headers.get === 'function') {
    return String(headers.get('X-Silent-Auth')).toLowerCase() === 'true';
  }

  const headerMap = headers as Record<string, unknown>;
  return String(headerMap['X-Silent-Auth'] ?? headerMap['x-silent-auth']).toLowerCase() === 'true';
};

// ✅ 모든 응답 에러를 toast로 띄우는 인터셉터
api.interceptors.response.use(
  (res) => res,
  (error) => {
    let msg = "알 수 없는 오류가 발생했습니다.";
    let showToast = true;

    // Silent auth 헤더가 있는 요청은 토스트를 표시하지 않음
    const isSilentAuth = isSilentAuthRequest(error.config?.headers);

    // 네트워크 오류 (서버 연결 실패)
    if (error.code === 'ERR_NETWORK' || !error.response) {
      msg = "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.";
      console.warn('백엔드 서버가 실행되지 않았거나 네트워크 오류가 발생했습니다.');
      showToast = false; // 네트워크 오류는 토스트를 표시하지 않음 (콘솔에만 로그)
    }
    // 401은 서버 메시지보다 먼저 처리한다. Silent auth 확인은 비로그인도 정상 흐름이다.
    else if (error.response?.status === 401) {
      msg = "로그인이 필요합니다.";
      if (isSilentAuth) {
        showToast = false;
      } else {
        // AuthContext의 logout을 트리거하기 위한 custom event
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    // 서버 커스텀 메시지 있으면 그걸로
    else if (error.response?.data?.message) msg = error.response.data.message;
    else if (error.response?.data?.error) msg = error.response.data.error;
    else if (error.response?.status === 403) msg = "권한이 없습니다.";
    else if (error.message) msg = error.message;

    if (showToast) {
      toast.error(msg);
    }

    // 실제 에러를 계속 전달하여 각 컴포넌트에서 적절히 처리할 수 있도록 함
    return Promise.reject(error);
  }
);

// HTTP-only 쿠키 기반 인증으로 변경 - Authorization 헤더 인터셉터 제거
// 쿠키는 withCredentials: true로 자동 전송됨

export default api;
