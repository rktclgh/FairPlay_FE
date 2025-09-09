// tokenValidator.ts - 간단한 쿠키 체크만 담당 (AuthContext와 중복 제거)

import { isAuthenticated } from './authGuard';

class TokenValidator {
  private static instance: TokenValidator;

  private constructor() {}

  static getInstance(): TokenValidator {
    if (!TokenValidator.instance) {
      TokenValidator.instance = new TokenValidator();
    }
    return TokenValidator.instance;
  }

  // 앱 시작 시 쿠키 존재 여부만 체크 (실제 인증은 AuthContext에서 담당)
  async validateTokensOnStartup(): Promise<boolean> {
    // HTTP-only 쿠키는 JavaScript로 접근 불가하므로 AuthContext에서만 인증 처리
    console.log('HTTP-only 쿠키 사용으로 인해 AuthContext에서 인증 상태 관리');
    return true; // AuthContext가 실제 검증 담당
  }

  // 주기적 검증은 AuthContext에서 담당하므로 제거
  startPeriodicValidation(): void {
    // AuthContext가 이미 인증 상태를 관리하므로 별도 주기적 검증 불필요
    console.log('주기적 검증은 AuthContext에서 담당');
  }
}

export default TokenValidator.getInstance();