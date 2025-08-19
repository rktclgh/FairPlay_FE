// 결제 검색 조건
export interface PaymentSearchCriteria {
  paymentTypes?: string[]; // RESERVATION, BOOTH, AD
  paymentStatuses?: string[]; // PENDING, COMPLETED, CANCELLED, REFUNDED
  startDate?: Date;
  endDate?: Date;
  eventName?: string;
  buyerName?: string;
  minAmount?: number;
  maxAmount?: number;
  page: number;
  size: number;
  sort: string;
  direction: 'asc' | 'desc';
}

// 결제 관리자 DTO
export interface PaymentAdminDto {
  paymentId: number;
  merchantUid: string;
  impUid?: string;
  
  // 행사 정보
  eventId?: number;
  eventName?: string;
  
  // 결제 대상 정보
  paymentTargetType: string; // RESERVATION, BOOTH, AD
  paymentTargetName: string; // 예약, 부스, 광고
  targetId?: number;
  
  // 구매자 정보
  userId: number;
  buyerName: string;
  buyerEmail: string;
  
  // 결제 정보
  quantity: number;
  price: number;
  amount: number;
  refundedAmount: number;
  
  // 결제 상태
  paymentStatusCode: string;
  paymentStatusName: string;
  paymentTypeCode: string;
  paymentTypeName: string;
  
  // 결제 일시
  requestedAt?: string;
  paidAt?: string;
  refundedAt?: string;
  
  // PG 정보
  pgProvider?: string;
}

// 페이지네이션 정보
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// 결제 통계
export interface PaymentStatistics {
  paymentCounts: {
    total: number;
    completed: number;
    cancelled: number;
  };
  paymentAmounts: {
    totalAmount: number;
    refundedAmount: number;
    netAmount: number;
  };
  paymentTypes: {
    typeStatistics: PaymentTypeStatistic[];
  };
}

// 결제 타입별 통계
export interface PaymentTypeStatistic {
  type: string;
  typeName: string;
  count: number;
  amount: number;
}

// API 응답 래퍼
export interface ApiResponse<T> {
  payments: T[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// 환불 요청
export interface RefundRequest {
  paymentId: number;
  refundAmount: number;
  reason: string;
}

// 환불 응답
export interface RefundResponse {
  refundId: number;
  paymentId: number;
  refundAmount: number;
  reason: string;
  status: string;
  processedAt: string;
}

// 결제 상태 코드
export type PaymentStatusCode = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';

// 결제 대상 타입
export type PaymentTargetType = 'RESERVATION' | 'BOOTH' | 'AD';

// 정렬 필드
export type PaymentSortField = 'paymentId' | 'paidAt' | 'amount' | 'eventName' | 'buyerName' | 'paymentStatus';

// 결제 필터 옵션
export interface PaymentFilterOptions {
  paymentTypes: Array<{
    value: PaymentTargetType;
    label: string;
  }>;
  paymentStatuses: Array<{
    value: PaymentStatusCode;
    label: string;
  }>;
}

// 결제 관리 훅 상태
export interface PaymentManagementState {
  payments: PaymentAdminDto[];
  statistics: PaymentStatistics | null;
  searchCriteria: PaymentSearchCriteria;
  pagination: PaginationInfo;
  loading: boolean;
  error: string | null;
}

// Excel 다운로드 옵션
export interface ExcelDownloadOptions {
  filename?: string;
  sheetName?: string;
  includeStatistics?: boolean;
}