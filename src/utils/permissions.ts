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

// 토큰에서 사용자 역할 추출
export const getUserRoleFromToken = (): string | null => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;

    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || null;
  } catch (error) {
    console.error("토큰에서 역할 추출 실패:", error);
    return null;
  }
};

// 권한별 리다이렉션 경로
export const getRedirectPathByRole = (role: string): string => {
  if (role === USER_ROLES.ADMIN) return "/admin_dashboard";
  if (hasHostPermission(role)) return "/host/dashboard";
  return "/";
};

// 권한별 메뉴 접근 가능 여부
export const canAccessHostMenu = (role: string): boolean => {
  return hasHostPermission(role);
};

export const canAccessAdminMenu = (role: string): boolean => {
  return hasAdminPermission(role);
};
