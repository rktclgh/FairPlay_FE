import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import presenceManager from '../utils/presenceManager';

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
  const navigate = useNavigate();
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

        // 인증 성공 시 presenceManager heartbeat 시작
        presenceManager.startHeartbeat();

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

    // 로그인 성공 시 presenceManager heartbeat 시작
    presenceManager.startHeartbeat();
  };

  // 로그아웃 처리 (HTTP-only 쿠키 + Redis 세션 + 로컬스토리지 정리)
  const logout = async (): Promise<void> => {
    try {
      // 서버에 로그아웃 요청 (HTTP-only 쿠키 삭제 + Redis 세션 삭제)
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('서버 로그아웃 요청 실패:', error);
    }

    // presenceManager heartbeat 중지
    presenceManager.stopHeartbeat();

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

    // 로그인 페이지로 리다이렉트 (React Router 사용)
    if (!window.location.pathname.includes('/login')) {
      navigate('/login', { replace: true });
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

      // HTTP-only 세션 쿠키는 JS에서 읽을 수 없으므로 서버에 silent 확인을 바로 보낸다.
      await checkAuth();

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

  // 🔴 401 에러 시 자동 로그아웃 처리 (axios interceptor에서 트리거)
  useEffect(() => {
    const handleUnauthorized = () => {
      // 이미 로그인된 상태일 때만 로그아웃 처리 (비로그인 상태에서 401은 정상)
      if (isAuthenticated) {
        console.log('🚨 401 Unauthorized 이벤트 감지, 자동 로그아웃 실행');
        logout();
      } else {
        console.log('ℹ️ 401 에러 발생했지만 이미 비로그인 상태 - 무시');
      }
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [isAuthenticated, logout]);

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
