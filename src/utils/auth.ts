// auth.ts - JWT 토큰 관리 유틸리티

interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  email: string;
  name: string;
  phone: string;
}

class AuthManager {
  private static instance: AuthManager;
  private refreshPromise: Promise<boolean> | null = null;

  private constructor() {}

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  // JWT 토큰 만료 시간 확인 (초 단위)
  private getTokenExpiry(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp;
    } catch (error) {
      console.error('토큰 파싱 실패:', error);
      return null;
    }
  }

  // 토큰이 만료되었는지 확인
  isTokenExpired(token: string): boolean {
    const expiry = this.getTokenExpiry(token);
    if (!expiry) return true;
    
    const now = Math.floor(Date.now() / 1000);
    // 30초 여유를 두고 만료 체크
    return (expiry - now) < 30;
  }

  // 토큰 유효성 검증 (클라이언트 측면만)
  isTokenValidFormat(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // 페이로드 파싱 시도
      const payload = JSON.parse(atob(parts[1]));
      return payload.exp && payload.sub;
    } catch (error) {
      return false;
    }
  }

  // 토큰 자동 갱신
  async refreshTokenIfNeeded(): Promise<boolean> {
    // 이미 리프레시 중이면 기다림
    if (this.refreshPromise) {
      return await this.refreshPromise;
    }

    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!accessToken || !refreshToken) {
      this.logout();
      return false;
    }

    // 액세스 토큰이 아직 유효하면 갱신하지 않음
    if (!this.isTokenExpired(accessToken)) {
      return true;
    }

    console.log('액세스 토큰 만료됨, 리프레시 토큰으로 갱신 시도');

    // 리프레시 토큰도 만료되었으면 로그아웃
    if (this.isTokenExpired(refreshToken)) {
      console.log('리프레시 토큰도 만료됨, 로그아웃 처리');
      this.logout();
      return false;
    }

    // 토큰 갱신 시도
    this.refreshPromise = this.performTokenRefresh(refreshToken);
    const success = await this.refreshPromise;
    this.refreshPromise = null;

    return success;
  }

  private async performTokenRefresh(refreshToken: string): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data: TokenRefreshResponse = await response.json();
        
        // 새 토큰 저장
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        console.log('토큰 갱신 성공');
        return true;
      } else {
        console.error('토큰 갱신 실패:', response.status, response.statusText);
        this.logout();
        return false;
      }
    } catch (error) {
      console.error('토큰 갱신 중 오류:', error);
      this.logout();
      return false;
    }
  }

  // 로그아웃 처리
  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // 로그아웃 알림 메시지
    this.showLogoutMessage();
    
    // 로그인 페이지로 리다이렉트 (현재 페이지가 로그인 페이지가 아닌 경우)
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }

  // 로그아웃 알림 메시지 표시
  private showLogoutMessage(): void {
    // Toast 알림이 있다면 사용, 없으면 기본 alert
    if (typeof window !== 'undefined') {
      // react-toastify가 있는지 확인
      const toastContainer = document.querySelector('.Toastify__toast-container');
      if (toastContainer) {
        // 동적으로 toast import 시도
        import('react-toastify').then(({ toast }) => {
          toast.warn('로그아웃 되었습니다. 다시 로그인해 주세요.', {
            position: 'top-center',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
          });
        }).catch(() => {
          // toast import 실패 시 기본 alert
          alert('로그아웃 되었습니다. 다시 로그인해 주세요.');
        });
      } else {
        // 기본 alert 사용
        alert('로그아웃 되었습니다. 다시 로그인해 주세요.');
      }
    }
  }

  // 현재 로그인한 사용자 ID 가져오기
  getCurrentUserId(): number | null {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return null;
      
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      return payload.userId || payload.sub || null;
    } catch (error) {
      console.error('사용자 ID 추출 실패:', error);
      return null;
    }
  }

  // 인증된 API 요청을 위한 헬퍼 함수
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    // 토큰 갱신 체크
    const tokenValid = await this.refreshTokenIfNeeded();
    if (!tokenValid) {
      throw new Error('인증이 만료되었습니다. 다시 로그인해 주세요.');
    }

    const accessToken = localStorage.getItem('accessToken');
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // 401 오류 시 토큰 갱신 재시도
    if (response.status === 401) {
      console.log('401 오류 발생, 토큰 강제 갱신 시도');
      
      // 강제로 토큰 갱신
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        const refreshSuccess = await this.performTokenRefresh(refreshToken);
        if (refreshSuccess) {
          // 갱신된 토큰으로 재요청
          const newAccessToken = localStorage.getItem('accessToken');
          const retryResponse = await fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${newAccessToken}`,
              'Content-Type': 'application/json',
            },
          });
          return retryResponse;
        }
      }
      
      // 토큰 갱신 실패 시 로그아웃
      this.logout();
      throw new Error('인증이 만료되었습니다. 다시 로그인해 주세요.');
    }

    return response;
  }
}

export default AuthManager.getInstance();