import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/axios';

interface User {
  userId: number;
  email: string;
  name: string;
  role?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 서버에서 사용자 정보 가져오기 (HTTP-only 쿠키 자동 전송)
  const fetchUserInfo = async (): Promise<User | null> => {
    try {
      const response = await api.get('/api/users/mypage', {
        headers: { 'X-Silent-Auth': 'true' }
      });
      
      if (response.data && response.data.userId) {
        return {
          userId: response.data.userId,
          email: response.data.email || '',
          name: response.data.name || '',
          role: response.data.role
        };
      }
      return null;
    } catch (error: any) {
      // Silent 인증에서는 401 에러를 조용히 처리
      if (error.response?.status === 401) {
        return null;
      }
      console.error('AuthContext fetchUserInfo 에러:', error);
      return null;
    }
  };

  // 인증 상태 확인 (HTTP-only 쿠키 + Redis 세션)
  const checkAuth = async (): Promise<boolean> => {
    console.log('🔍 AuthContext checkAuth 호출');
    try {
      const userData = await fetchUserInfo();
      if (userData) {
        console.log('✅ AuthContext 인증 성공:', userData);
        setIsAuthenticated(true);
        setUser(userData);
        return true;
      } else {
        console.log('❌ AuthContext 인증 실패: userData null');
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }
    } catch (error) {
      console.log('❌ AuthContext 인증 오류:', error);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
  };

  // 로그인 처리
  const login = (userData: User) => {
    console.log('🚀 AuthContext login 호출:', userData);
    setIsAuthenticated(true);
    setUser(userData);
  };

  // 로그아웃 처리 (HTTP-only 쿠키 + Redis 세션 + 로컬스토리지 정리)
  const logout = async (): Promise<void> => {
    try {
      // 서버에 로그아웃 요청 (HTTP-only 쿠키 삭제 + Redis 세션 삭제)
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('서버 로그아웃 요청 실패:', error);
    }

    // 로컬 상태 초기화
    setIsAuthenticated(false);
    setUser(null);

    // 🔒 보안: 로컬스토리지의 모든 토큰 데이터 완전 삭제
    const tokensToRemove = [
      'accessToken', 'access_token', 'token', 
      'refreshToken', 'refresh_token',
      'authToken', 'sessionToken', 'userToken'
    ];
    
    tokensToRemove.forEach(tokenKey => {
      localStorage.removeItem(tokenKey);
      sessionStorage.removeItem(tokenKey);
    });

    // 사용자 정보도 삭제
    localStorage.removeItem('userInfo');
    localStorage.removeItem('user');
    sessionStorage.removeItem('userInfo');
    sessionStorage.removeItem('user');

    // 로그아웃 알림
    if (typeof window !== 'undefined') {
      try {
        const { toast } = await import('react-toastify');
        toast.warn('로그아웃 되었습니다. 다시 로그인해 주세요.', {
          position: 'top-center',
          autoClose: 3000,
        });
      } catch {
        alert('로그아웃 되었습니다. 다시 로그인해 주세요.');
      }
    }

    // 로그인 페이지로 리다이렉트
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  };

  // 인증 상태 새로고침
  const refreshAuth = async (): Promise<void> => {
    setLoading(true);
    await checkAuth();
    setLoading(false);
  };

  // 앱 시작 시 인증 상태 확인 (React StrictMode 중복 실행 방지)
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      if (!isMounted) return;
      
      console.log('🔧 AuthContext 초기화 시작');
      setLoading(true);
      
      // 쿠키 확인: 세션이 있는 경우에만 API 호출
      const hasSessionCookie = document.cookie.includes('JSESSIONID') || 
                               document.cookie.includes('SESSIONID') ||
                               document.cookie.includes('session');
      
      if (hasSessionCookie) {
        console.log('🍪 세션 쿠키 발견, 인증 상태 확인');
        await checkAuth();
      } else {
        console.log('🚫 세션 쿠키 없음, 비로그인 상태로 설정');
        setIsAuthenticated(false);
        setUser(null);
      }
      
      if (isMounted) {
        setLoading(false);
        console.log('🔧 AuthContext 초기화 완료, isAuthenticated:', isAuthenticated);
      }
    };

    initializeAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    checkAuth,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}