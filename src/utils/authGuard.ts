import { NavigateFunction } from 'react-router-dom';
import api from '../api/axios';

export const isAuthenticated = (): boolean => {
  // 쿠키 기반 인증 상태 체크 (API 호출하지 않음)
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name] = cookie.trim().split('=');
    if (name === 'FAIRPLAY_SESSION') {
      return true;
    }
  }
  return false;
};

export const requireAuth = async (
  navigate: NavigateFunction, 
  feature: string = '기능'
): Promise<boolean> => {
  try {
    // 백엔드 API를 통해 실제 인증 상태 확인
    const response = await api.get('/api/events/user/role');
    return true;
  } catch (error: any) {
    if (error.response?.status === 401) {
      alert(`로그인이 필요한 서비스입니다.`);
      navigate('/login');
      return false;
    }
    return true;
  }
};

// 세션 기반 인증에서는 사용자 ID를 백엔드 API를 통해 가져옴
export const getUserIdFromSession = async (): Promise<number | null> => {
  try {
    const response = await api.get('/api/events/user/role');
    return response.data.userId;
  } catch (error) {
    return null;
  }
};