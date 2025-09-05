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

  // 앱 시작 시 토큰 유효성 검증 (HTTP-only 쿠키 기반)
  async validateTokensOnStartup(): Promise<boolean> {
    if (this.isValidating) return false;
    
    console.log('앱 시작 시 토큰 유효성 검증 시작');
    this.isValidating = true;

    try {
      // HTTP-only 쿠키 기반 인증이므로 간단한 API 호출로 세션 확인
      const response = await authManager.authenticatedFetch('/api/users/mypage', {
        method: 'GET',
      });
      
      if (response.ok) {
        console.log('세션 유효성 검증 성공');
        this.isValidating = false;
        return true;
      } else {
        console.log('세션 검증 실패 - 로그아웃 처리됨');
        this.isValidating = false;
        return false;
      }
    } catch (error) {
      console.warn('세션 검증 중 오류 발생:', error);
      this.isValidating = false;
      
      // authenticatedFetch에서 401 처리는 이미 완료됨
      if (error instanceof Error && error.message.includes('인증이 만료')) {
        return false;
      }
      
      // 네트워크 오류 등은 세션을 유지
      return true;
    }
  }

  // 주기적 세션 검증 (옵션)
  startPeriodicValidation(): void {
    // 5분마다 세션 상태 확인
    setInterval(async () => {
      // HTTP-only 쿠키 기반이므로 주기적으로 서버에 세션 확인
      await this.validateTokensOnStartup();
    }, 5 * 60 * 1000); // 5분
  }
}

export default TokenValidator.getInstance();