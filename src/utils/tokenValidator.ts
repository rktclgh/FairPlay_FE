// tokenValidator.ts - 앱 시작 시 토큰 유효성 검증

import authManager from './auth';

class TokenValidator {
  private static instance: TokenValidator;
  private isValidating = false;

  private constructor() {}

  static getInstance(): TokenValidator {
    if (!TokenValidator.instance) {
      TokenValidator.instance = new TokenValidator();
    }
    return TokenValidator.instance;
  }

  // 앱 시작 시 토큰 유효성 검증
  async validateTokensOnStartup(): Promise<boolean> {
    if (this.isValidating) return false;
    
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    // 토큰이 없으면 검증할 필요 없음
    if (!accessToken && !refreshToken) {
      return true;
    }

    // 토큰이 있으면 실제 서버 검증 필요
    console.log('앱 시작 시 토큰 유효성 검증 시작');
    this.isValidating = true;

    try {
      // 1단계: 토큰 형식 검증
      if (accessToken && !authManager.isTokenValidFormat(accessToken)) {
        console.log('토큰 형식 오류 - 로그아웃 처리');
        authManager.logout();
        this.isValidating = false;
        return false;
      }

      // 2단계: 간단한 API 호출로 토큰 검증 (authenticatedFetch 사용하지 않음)
      const response = await fetch('/api/users/mypage', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (response.ok) {
        console.log('토큰 유효성 검증 성공');
        this.isValidating = false;
        return true;
      } else if (response.status === 401 || response.status === 403) {
        console.log('서버에서 토큰 거부 - 로그아웃 처리');
        authManager.logout();
        this.isValidating = false;
        return false;
      } else {
        // 기타 서버 오류 (500 등)는 토큰 문제가 아닐 수 있음
        console.warn('서버 오류로 토큰 검증 실패, 토큰 유지:', response.status);
        this.isValidating = false;
        return true;
      }
    } catch (error) {
      console.warn('토큰 검증 중 오류 발생:', error);
      this.isValidating = false;
      
      // 인증 관련 오류라면 로그아웃 처리
      if (error instanceof Error && error.message.includes('인증이 만료')) {
        return false;
      }
      
      // 네트워크 오류 등은 토큰을 유지
      return true;
    }
  }

  // 주기적 토큰 검증 (옵션)
  startPeriodicValidation(): void {
    // 5분마다 토큰 상태 확인
    setInterval(async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken && !authManager.isTokenExpired(accessToken)) {
        // 토큰이 있고 만료되지 않았으면 서버 검증은 생략
        return;
      }
      
      // 토큰이 만료되었거나 없으면 검증
      await this.validateTokensOnStartup();
    }, 5 * 60 * 1000); // 5분
  }
}

export default TokenValidator.getInstance();