import { NavigateFunction } from 'react-router-dom';

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    return false;
  }
  
  try {
    // JWT 토큰이 만료되었는지 확인
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = payload.exp * 1000 < Date.now();
    
    if (isExpired) {
      // 만료된 토큰 제거
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return false;
    }
    
    return true;
  } catch (error) {
    // 토큰이 유효하지 않은 경우
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return false;
  }
};

export const requireAuth = (
  navigate: NavigateFunction, 
  feature: string = '기능'
): boolean => {
  if (!isAuthenticated()) {
    alert(`로그인이 필요한 서비스입니다.`);
    navigate('/login');
    return false;
  }
  return true;
};

export const getUserIdFromToken = (): number | null => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    return null;
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return parseInt(payload.sub);
  } catch (error) {
    return null;
  }
};