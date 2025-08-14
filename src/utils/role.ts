import api from "../api/axios";

// LocalStorage 키 상수
const ROLE_CODE_KEY = "roleCode";

export const getCachedRoleCode = (): string | null => {
  try {
    return localStorage.getItem(ROLE_CODE_KEY);
  } catch {
    return null;
  }
};

export const setCachedRoleCode = (roleCode: string): void => {
  try {
    localStorage.setItem(ROLE_CODE_KEY, roleCode);
  } catch {
    // noop
  }
};

export const clearCachedRoleCode = (): void => {
  try {
    localStorage.removeItem(ROLE_CODE_KEY);
  } catch {
    // noop
  }
};

// 역할 API 호출하여 roleCode를 가져오고 캐싱
export const fetchAndCacheRoleCode = async (): Promise<string | null> => {
  try {
    const res = await api.get("/api/events/user/role");
    const roleCode: string | undefined = res?.data?.roleCode;
    if (roleCode) {
      setCachedRoleCode(roleCode);
      return roleCode;
    }
    return null;
  } catch (error) {
    console.error("역할 정보 조회 실패:", error);
    return null;
  }
};

// 캐시에 있으면 사용, 없으면 API 조회
export const getRoleCode = async (): Promise<string | null> => {
  const cached = getCachedRoleCode();
  if (cached) return cached;
  return await fetchAndCacheRoleCode();
};

export { ROLE_CODE_KEY };
