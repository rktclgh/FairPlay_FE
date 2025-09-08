// auth.ts - HTTP-only 쿠키 기반 세션 관리 유틸리티

class AuthManager {
  private static instance: AuthManager;

  private constructor() {}

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  // 로그아웃 처리
  logout(): void {
    // 서버에 로그아웃 요청 (HTTP-only 쿠키 삭제)
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include', // 쿠키 포함
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(error => {
      console.error('로그아웃 요청 실패:', error);
    });
    
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

  // 인증된 API 요청을 위한 헬퍼 함수 (쿠키 기반)
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // HTTP-only 쿠키 자동 포함
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // 401 오류 시 로그아웃 처리
    if (response.status === 401) {
      console.log('401 오류 발생, 세션 만료');
      this.logout();
      throw new Error('인증이 만료되었습니다. 다시 로그인해 주세요.');
    }

    return response;
  }
}

export default AuthManager.getInstance();