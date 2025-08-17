// 부스 체험 관련 타입 정의

export interface BoothExperience {
  experienceId: number;
  boothId: number;
  boothName: string;
  eventId: number;
  eventName: string;
  title: string;
  description: string;
  experienceDate: string; // LocalDate를 문자열로
  startTime: string; // LocalTime을 "HH:mm:ss" 형식으로
  endTime: string;
  durationMinutes: number;
  maxCapacity: number;
  currentParticipants: number;
  waitingCount: number;
  congestionRate: number; // 혼잡도 (%)
  allowWaiting: boolean;
  maxWaitingCount: number;
  allowDuplicateReservation: boolean;
  isReservationEnabled: boolean;
  isReservationAvailable: boolean;
  createdAt: string; // LocalDateTime을 ISO 문자열로
  updatedAt: string;
}

export interface BoothExperienceReservation {
  reservationId: number;
  experienceId: number;
  experienceTitle: string;
  boothId: number;
  boothName: string;
  eventId: number;
  eventName: string;
  userId: number;
  userName: string;
  statusCode: ExperienceStatusCode;
  statusName: string;
  queuePosition: number;
  reservedAt: string;
  readyAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  waitingMinutes?: number;
  experienceDurationMinutes?: number;
  notes?: string;
  isActive: boolean;
}

// 부스 체험 예약 요청 DTO
export interface BoothExperienceReservationRequest {
  notes?: string;
}

// 부스 체험 등록 요청 DTO
export interface BoothExperienceRequest {
  title: string;
  description: string;
  experienceDate: string; // "YYYY-MM-DD" 형식
  startTime: string; // "HH:mm:ss" 형식
  endTime: string;
  durationMinutes: number;
  maxCapacity: number;
  allowWaiting: boolean;
  maxWaitingCount: number;
  allowDuplicateReservation: boolean;
  isReservationEnabled: boolean;
}

// 부스 체험 상태 업데이트 DTO
export interface BoothExperienceStatusUpdate {
  statusCode: ExperienceStatusCode;
  notes?: string;
}

// 체험 상태 코드 열거형
export enum ExperienceStatusCode {
  WAITING = "WAITING",       // 대기중
  READY = "READY",          // 입장가능
  IN_PROGRESS = "IN_PROGRESS", // 체험중
  COMPLETED = "COMPLETED",   // 완료
  CANCELLED = "CANCELLED",   // 취소
  NO_SHOW = "NO_SHOW"       // 노쇼
}

// 대기열 상태 응답
export interface QueueStatusResponse {
  experienceId: number;
  experienceTitle: string;
  maxCapacity: number;
  currentParticipants: number;
  waitingCount: number;
  congestionRate: number;
  isReservationAvailable: boolean;
  estimatedWaitTime?: number; // 예상 대기 시간 (분)
  nextAvailableSlot?: string; // 다음 예약 가능 시간
}

// API 응답 래퍼
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

// 페이지네이션 응답
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
  first: boolean;
  last: boolean;
}

// 부스 체험 필터링 옵션
export interface BoothExperienceFilters {
  eventId?: number;
  startDate?: string; // "YYYY-MM-DD" 형식 (기간 시작일)
  endDate?: string; // "YYYY-MM-DD" 형식 (기간 종료일)
  boothName?: string;
  isAvailable?: boolean;
  categoryId?: number;
  sortBy?: 'createdAt' | 'congestionRate' | 'startTime';
  sortDirection?: 'asc' | 'desc';
}

// 예약 필터링 옵션
export interface ReservationFilters {
  statusCode?: ExperienceStatusCode;
  dateFrom?: string;
  dateTo?: string;
  userId?: number;
  experienceId?: number;
}

// 통계 데이터
export interface ExperienceStatistics {
  totalReservations: number;
  completedExperiences: number;
  cancelledReservations: number;
  averageWaitTime: number;
  averageExperienceTime: number;
  congestionByHour: Array<{
    hour: number;
    congestionRate: number;
  }>;
}

// 실시간 업데이트를 위한 WebSocket 메시지 타입
export interface ExperienceUpdateMessage {
  type: 'RESERVATION_CREATED' | 'STATUS_CHANGED' | 'QUEUE_UPDATED';
  experienceId: number;
  reservationId?: number;
  newStatus?: ExperienceStatusCode;
  queuePosition?: number;
  waitingCount?: number;
  currentParticipants?: number;
}