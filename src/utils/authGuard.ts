import { NavigateFunction } from 'react-router-dom';

// AuthContext 없이 사용할 수 있는 레거시 함수들
// 새로운 코드에서는 useAuth() 훅을 사용하는 것을 권장

// 빠른 쿠키 체크 (동기)
export const isAuthenticated = (): boolean => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name] = cookie.trim().split('=');
    if (name === 'FAIRPLAY_SESSION') {
      return true;
    }
  }
  return false;
};

// AuthContext 기반 인증 확인을 위한 헬퍼
export const requireAuth = (
  isAuth: boolean,
  navigate: NavigateFunction, 
  feature: string = '기능'
): boolean => {
  if (!isAuth) {
    alert(`로그인이 필요한 서비스입니다.`);
    navigate('/login');
    return false;
  }
  return true;
};

// AuthContext 기반 사용자 ID 가져오기
export const getUserIdFromAuth = (user: { userId: number } | null): number | null => {
  return user?.userId || null;
};