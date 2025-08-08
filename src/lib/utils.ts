/**
 * CDN 기반 이미지 URL 생성 함수
 * @param imagePath - 이미지 경로 (예: "/images/logo.png" 또는 "images/logo.png")
 * @returns 완전한 CDN URL
 */
export const getCdnImageUrl = (imagePath: string): string => {
  const cdnBaseUrl = import.meta.env.VITE_CDN_BASE_URL || 'https://d3lmalqtze27ii.cloudfront.net';
  
  // 이미 완전한 URL인 경우 그대로 반환
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // 로컬 public 폴더의 이미지인 경우 그대로 반환
  if (imagePath.startsWith('/') && !imagePath.startsWith('/api')) {
    // 개발 환경에서는 로컬 이미지를 우선 사용
    if (import.meta.env.DEV) {
      return imagePath;
    }
    // 프로덕션에서는 CDN 사용
    return `${cdnBaseUrl}${imagePath}`;
  }
  
  // CDN URL 생성
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${cdnBaseUrl}${cleanPath}`;
};

/**
 * API 기본 URL 반환
 */
export const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8080';
};