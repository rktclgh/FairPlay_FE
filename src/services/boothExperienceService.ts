import authManager from '../utils/auth';
import {
  BoothExperience,
  BoothExperienceReservation,
  BoothExperienceReservationRequest,
  BoothExperienceRequest,
  BoothExperienceStatusUpdate,
  QueueStatusResponse,
  BoothExperienceFilters,
  ReservationFilters,
  ExperienceStatistics,
  PagedResponse
} from './types/boothExperienceType';

// 예약자 관리용 타입 정의
export interface ReservationManagementResponse {
  reservationId: number;
  boothName: string;
  experienceTitle: string;
  experienceDate: string;
  reserverName: string;
  reserverPhone: string;
  canEnter: boolean;
  queuePosition: number;
  statusCode: string;
  statusName: string;
  reservedAt: string;
  readyAt?: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
}

export interface BoothExperienceSummary {
  experienceId: number;
  experienceTitle: string;
  boothName: string;
  maxCapacity: number;
  currentParticipants: number;
  waitingCount: number;
  currentParticipantNames: string[];
  nextParticipantName?: string;
  congestionRate: number;
  isReservationAvailable: boolean;
}

export interface ReservationManagementFilters {
  boothId?: number;
  reserverName?: string;
  reserverPhone?: string;
  experienceDate?: string;
  statusCode?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface Booth {
  boothId: number;
  boothTitle: string;
  boothDescription: string;
  eventId: number;
  eventTitle: string;
  boothAdminId: number;
  boothAdminName: string;
}

// ================================
// 부스 체험 관리 API (부스 담당자용)
// ================================

/**
 * 특정 부스에 새로운 체험 등록
 */
export const createBoothExperience = async (
  boothId: number,
  experienceData: BoothExperienceRequest
): Promise<BoothExperience> => {
  const response = await authManager.authenticatedFetch(`/api/booth-experiences/booths/${boothId}`, {
    method: 'POST',
    body: JSON.stringify(experienceData),
  });
  return await response.json();
};

/**
 * 특정 부스의 체험 목록 조회 (부스 담당자용)
 */
export const getBoothExperiences = async (boothId: number): Promise<BoothExperience[]> => {
  const response = await authManager.authenticatedFetch(`/api/booth-experiences/booths/${boothId}`);
  return await response.json();
};

/**
 * 권한별 관리 가능한 체험 목록 조회 (체험 관리용)
 */
export const getManageableExperiences = async (): Promise<BoothExperience[]> => {
  const response = await authManager.authenticatedFetch('/api/booth-experiences/manageable-experiences');
  return await response.json();
};

/**
 * 부스 체험 수정 (부스 담당자용)
 */
export const updateBoothExperience = async (
  experienceId: number,
  experienceData: BoothExperienceRequest
): Promise<BoothExperience> => {
  const response = await authManager.authenticatedFetch(`/api/booth-experiences/${experienceId}`, {
    method: 'PUT',
    body: JSON.stringify(experienceData),
  });
  return await response.json();
};

/**
 * 부스 체험 삭제 (부스 담당자용)
 */
export const deleteBoothExperience = async (experienceId: number): Promise<void> => {
  await authManager.authenticatedFetch(`/api/booth-experiences/${experienceId}`, {
    method: 'DELETE',
  });
};

/**
 * 특정 체험의 예약자 목록 조회 (부스 담당자용)
 */
export const getExperienceReservations = async (
  experienceId: number,
  filters?: ReservationFilters
): Promise<BoothExperienceReservation[]> => {
  const params = new URLSearchParams();
  if (filters?.statusCode) params.append('statusCode', filters.statusCode);
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters?.dateTo) params.append('dateTo', filters.dateTo);
  
  const queryString = params.toString();
  const url = `/api/booth-experiences/${experienceId}/reservations${queryString ? `?${queryString}` : ''}`;
  
  const response = await authManager.authenticatedFetch(url);
  return await response.json();
};

/**
 * 예약 상태 변경 (부스 담당자용)
 */
export const updateReservationStatus = async (
  reservationId: number,
  statusUpdate: BoothExperienceStatusUpdate
): Promise<BoothExperienceReservation> => {
  const response = await authManager.authenticatedFetch(`/api/booth-experiences/reservations/${reservationId}/status`, {
    method: 'PUT',
    body: JSON.stringify(statusUpdate),
  });
  return await response.json();
};

// ================================
// 부스 체험 이용 API (참여자용)
// ================================

/**
 * 예약 가능한 모든 부스 체험 목록 조회 (참여자용)
 */
export const getAvailableExperiences = async (
  filters?: BoothExperienceFilters
): Promise<BoothExperience[]> => {
  const params = new URLSearchParams();
  if (filters?.eventId) params.append('eventId', filters.eventId.toString());
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  if (filters?.boothName) params.append('boothName', filters.boothName);
  if (filters?.isAvailable !== undefined) params.append('isAvailable', filters.isAvailable.toString());
  if (filters?.categoryId) params.append('categoryId', filters.categoryId.toString());
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.sortDirection) params.append('sortDirection', filters.sortDirection);
  
  const queryString = params.toString();
  const url = `/api/booth-experiences/available${queryString ? `?${queryString}` : ''}`;
  
  const response = await authManager.authenticatedFetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

/**
 * 부스 체험 예약 신청 (참여자용)
 */
export const createReservation = async (
  experienceId: number,
  userId: number,
  reservationData: BoothExperienceReservationRequest
): Promise<BoothExperienceReservation> => {
  try {
    // 먼저 인증된 요청 시도
    const response = await authManager.authenticatedFetch(
      `/api/booth-experiences/${experienceId}/reservations?userId=${userId}`,
      {
        method: 'POST',
        body: JSON.stringify(reservationData),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Authenticated API Error Response:', errorData);
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }
    
    return await response.json();
  } catch (authError) {
    console.log('인증된 요청 실패, 일반 요청 시도:', authError);
    
    // 인증 실패 시 일반 fetch 시도 (HTTP 테스트와 동일하게)
    const response = await fetch(
      `/api/booth-experiences/${experienceId}/reservations?userId=${userId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Regular API Error Response:', errorData);
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }
    
    return await response.json();
  }
};

/**
 * 내 예약 목록 조회 (참여자용)
 */
export const getMyReservations = async (
  filters?: ReservationFilters
): Promise<BoothExperienceReservation[]> => {
  const params = new URLSearchParams();
  if (filters?.statusCode) params.append('statusCode', filters.statusCode);
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters?.dateTo) params.append('dateTo', filters.dateTo);
  if (filters?.experienceId) params.append('experienceId', filters.experienceId.toString());
  
  const queryString = params.toString();
  const url = `/api/booth-experiences/my-reservations?${queryString}`;
  
  const response = await authManager.authenticatedFetch(url);
  return await response.json();
};

/**
 * 예약 취소 (참여자용)
 */
export const cancelReservation = async (reservationId: number): Promise<void> => {
  const response = await authManager.authenticatedFetch(`/api/booth-experiences/reservations/${reservationId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

// ================================
// 공통 API
// ================================

/**
 * 대기열 현황 조회 (부스 담당자용)
 */
export const getQueueStatus = async (experienceId: number): Promise<QueueStatusResponse> => {
  const response = await authManager.authenticatedFetch(`/api/booth-experiences/${experienceId}/queue-status`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

/**
 * 특정 부스 체험 상세 정보 조회 (부스 담당자용)
 */
export const getExperienceDetail = async (experienceId: number): Promise<BoothExperience> => {
  const response = await authManager.authenticatedFetch(`/api/booth-experiences/${experienceId}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

// ================================
// 통계 및 분석 API
// ================================

/**
 * 부스 체험 통계 조회 (부스 담당자/관리자용)
 */
export const getExperienceStatistics = async (
  experienceId: number,
  dateFrom?: string,
  dateTo?: string
): Promise<ExperienceStatistics> => {
  const params = new URLSearchParams();
  if (dateFrom) params.append('dateFrom', dateFrom);
  if (dateTo) params.append('dateTo', dateTo);
  
  const queryString = params.toString();
  const url = `/api/booth-experiences/${experienceId}/statistics${queryString ? `?${queryString}` : ''}`;
  
  const response = await authManager.authenticatedFetch(url);
  return await response.json();
};

// ================================
// 실시간 업데이트를 위한 폴링 함수
// ================================

/**
 * 대기열 상태 실시간 업데이트
 */
export const pollQueueStatus = (
  experienceId: number,
  onUpdate: (status: QueueStatusResponse) => void,
  intervalMs: number = 5000
): (() => void) => {
  const poll = async () => {
    try {
      const status = await getQueueStatus(experienceId);
      onUpdate(status);
    } catch (error) {
      console.error('대기열 상태 조회 실패:', error);
    }
  };

  const intervalId = setInterval(poll, intervalMs);
  
  // 초기 로드
  poll();
  
  // 정리 함수 반환
  return () => clearInterval(intervalId);
};

/**
 * 내 예약 상태 실시간 업데이트
 */
export const pollReservationStatus = (
  reservationId: number,
  onUpdate: (reservation: BoothExperienceReservation) => void,
  intervalMs: number = 3000
): (() => void) => {
  const poll = async () => {
    try {
      const response = await fetch(`/api/booth-experiences/reservations/${reservationId}`);
      if (response.ok) {
        const reservation = await response.json();
        onUpdate(reservation);
      }
    } catch (error) {
      console.error('예약 상태 조회 실패:', error);
    }
  };

  const intervalId = setInterval(poll, intervalMs);
  
  // 초기 로드
  poll();
  
  // 정리 함수 반환
  return () => clearInterval(intervalId);
};

// ================================
// 유틸리티 함수들
// ================================

/**
 * 혼잡도에 따른 색상 반환
 */
export const getCongestionColor = (congestionRate: number): string => {
  if (congestionRate >= 90) return 'text-red-600';
  if (congestionRate >= 70) return 'text-orange-500';
  if (congestionRate >= 50) return 'text-yellow-500';
  return 'text-green-500';
};

/**
 * 혼잡도에 따른 텍스트 반환
 */
export const getCongestionText = (congestionRate: number): string => {
  if (congestionRate >= 90) return '매우 혼잡';
  if (congestionRate >= 70) return '혼잡';
  if (congestionRate >= 50) return '보통';
  return '여유';
};

/**
 * 예약 상태에 따른 색상 반환
 */
export const getStatusColor = (statusCode: string): string => {
  switch (statusCode) {
    case 'WAITING': return 'text-blue-600';
    case 'READY': return 'text-green-600';
    case 'IN_PROGRESS': return 'text-purple-600';
    case 'COMPLETED': return 'text-gray-600';
    case 'CANCELLED': return 'text-red-600';
    case 'NO_SHOW': return 'text-orange-600';
    default: return 'text-gray-500';
  }
};

/**
 * 예약 상태에 따른 배지 스타일 반환
 */
export const getStatusBadgeClass = (statusCode: string): string => {
  switch (statusCode) {
    case 'WAITING': return 'bg-blue-100 text-blue-800';
    case 'READY': return 'bg-green-100 text-green-800';
    case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
    case 'COMPLETED': return 'bg-gray-100 text-gray-800';
    case 'CANCELLED': return 'bg-red-100 text-red-800';
    case 'NO_SHOW': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-500';
  }
};

/**
 * 대기 시간 포맷팅
 */
export const formatWaitTime = (minutes?: number): string => {
  if (!minutes) return '대기 시간 미확정';
  
  if (minutes < 60) {
    return `약 ${minutes}분 대기`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `약 ${hours}시간 대기`;
  }
  
  return `약 ${hours}시간 ${remainingMinutes}분 대기`;
};

/**
 * 시간 문자열 포맷팅 (HH:mm:ss -> HH:mm)
 */
export const formatTime = (timeString: string): string => {
  return timeString.substring(0, 5);
};

// ================================
// 부스 관리 API (체험 등록용)
// ================================

/**
 * 권한별 관리 가능한 부스 목록 조회
 */
export const getManageableBooths = async (): Promise<Booth[]> => {
  const response = await authManager.authenticatedFetch('/api/booth-experiences/manageable-booths');
  return await response.json();
};

// ================================
// 예약자 관리 API
// ================================

/**
 * 예약자 관리용 부스 목록 조회
 */
export const getManageableBoothsForReservation = async (): Promise<Booth[]> => {
  const response = await authManager.authenticatedFetch('/api/booth-experiences/manageable-booths-for-reservation');
  return await response.json();
};

/**
 * 예약자 관리 목록 조회 (필터링 지원)
 */
export const getReservationsForManagement = async (
  filters: ReservationManagementFilters
): Promise<PagedResponse<ReservationManagementResponse>> => {
  const params = new URLSearchParams();
  
  // 필터 조건 추가
  if (filters.boothId) params.append('boothId', filters.boothId.toString());
  if (filters.reserverName) params.append('reserverName', filters.reserverName);
  if (filters.reserverPhone) params.append('reserverPhone', filters.reserverPhone);
  if (filters.experienceDate) params.append('experienceDate', filters.experienceDate);
  if (filters.statusCode) params.append('statusCode', filters.statusCode);
  
  // 페이지네이션
  params.append('page', (filters.page || 0).toString());
  params.append('size', (filters.size || 20).toString());
  params.append('sortBy', filters.sortBy || 'reservedAt');
  params.append('sortDirection', filters.sortDirection || 'asc');

  const response = await authManager.authenticatedFetch(
    `/api/booth-experiences/reservations/management?${params.toString()}`
  );
  return await response.json();
};

/**
 * 부스 체험 현황 요약 조회
 */
export const getExperienceSummary = async (experienceId: number): Promise<BoothExperienceSummary> => {
  const response = await authManager.authenticatedFetch(`/api/booth-experiences/${experienceId}/summary`);
  return await response.json();
};

/**
 * 예약 상태 변경 (관리자용)
 */
export const updateReservationStatusForManagement = async (
  reservationId: number,
  statusCode: string,
  notes?: string
): Promise<BoothExperienceReservation> => {
  const response = await authManager.authenticatedFetch(
    `/api/booth-experiences/reservations/${reservationId}/status`,
    {
      method: 'PUT',
      body: JSON.stringify({
        statusCode,
        notes: notes || `관리자에 의한 상태 변경: ${statusCode}`
      }),
    }
  );
  return await response.json();
};