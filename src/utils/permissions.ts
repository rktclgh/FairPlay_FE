// 사용자 권한 상수 정의 (DB 스키마와 일치)
export const USER_ROLES = {
  ADMIN: "ADMIN",
  EVENT_MANAGER: "EVENT_MANAGER",
  BOOTH_MANAGER: "BOOTH_MANAGER",
  COMMON: "COMMON",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// 권한 체크 함수들
// HOST 영역은 행사관리자 전용으로 제한 (ADMIN/BOOTH_MANAGER 접근 불가)
export const hasHostPermission = (role: string): boolean => {
  return role === USER_ROLES.EVENT_MANAGER;
};

export const hasAdminPermission = (role: string): boolean => {
  return role === USER_ROLES.ADMIN;
};

// 행사관리 권한: EVENT_MANAGER 전용
export const hasEventManagerPermission = (role: string): boolean => {
  return role === USER_ROLES.EVENT_MANAGER;
};

export const hasBoothManagerPermission = (role: string): boolean => {
  return role === USER_ROLES.BOOTH_MANAGER;
};

export const isCommonUser = (role: string): boolean => {
  return role === USER_ROLES.COMMON;
};

/**
 * ⚠️ DEPRECATED: 이 함수는 더 이상 사용되지 않습니다.
 * HTTP-only 쿠키 기반 인증으로 마이그레이션되었습니다.
 *
 * 대신 다음을 사용하세요:
 * ```tsx
 * import { useAuth } from '../context/AuthContext';
 *
 * const { user } = useAuth();
 * const role = user?.role;
 * ```
 *
 * @deprecated HTTP-only 쿠키로 마이그레이션되어 JWT 디코딩이 불가능합니다. useAuth() 훅을 사용하세요.
 */
export const getUserRoleFromToken = (): string | null => {
  console.warn(
    '⚠️ getUserRoleFromToken()은 deprecated되었습니다. ' +
    'AuthContext의 useAuth() 훅을 사용하여 user.role을 가져오세요.'
  );
  return null; // HTTP-only 쿠키에서는 클라이언트에서 JWT를 디코딩할 수 없음
};

// 권한별 리다이렉션 경로
export const getRedirectPathByRole = (role: string): string => {
  if (role === USER_ROLES.ADMIN) return "/admin_dashboard";
  if (hasHostPermission(role)) return "/host/dashboard";
  if (hasBoothManagerPermission(role)) return "/booth-admin/dashboard";
  return "/";
};

// 권한별 메뉴 접근 가능 여부
export const canAccessHostMenu = (role: string): boolean => {
  return hasHostPermission(role);
};

export const canAccessAdminMenu = (role: string): boolean => {
  return hasAdminPermission(role);
};

export const canAccessBoothAdminMenu = (role: string): boolean => {
  return hasBoothManagerPermission(role);
};
