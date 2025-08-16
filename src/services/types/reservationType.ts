// 백엔드 ReservationAttendeeDto에 기반한 타입 정의
export interface ReservationAttendeeDto {
    reservationId: number;
    userName: string;
    userEmail: string;
    userPhone: string;
    eventName: string;
    scheduleName: string;
    ticketName: string;
    quantity: number;
    price: number;
    reservationStatus: string; // PENDING(대기), CONFIRMED(확정), CANCELLED(취소), REFUNDED(환불)
    createdAt: string; // ISO 8601 format
    updatedAt: string; // ISO 8601 format
    canceled: boolean;
    canceledAt: string | null; // ISO 8601 format or null
}

// 백엔드 상태 코드 정의 (DDL 기준)
export const RESERVATION_STATUS = {
    PENDING: 'PENDING',      // 대기
    CONFIRMED: 'CONFIRMED',  // 확정
    CANCELLED: 'CANCELLED',  // 취소
    REFUNDED: 'REFUNDED'     // 환불
} as const;

// 상태 코드 타입
export type ReservationStatusType = typeof RESERVATION_STATUS[keyof typeof RESERVATION_STATUS];

// 상태 코드 한글 매핑 (DDL의 name 필드 기준)
export const RESERVATION_STATUS_NAMES: Record<ReservationStatusType, string> = {
    [RESERVATION_STATUS.PENDING]: '대기',
    [RESERVATION_STATUS.CONFIRMED]: '확정',
    [RESERVATION_STATUS.CANCELLED]: '취소',
    [RESERVATION_STATUS.REFUNDED]: '환불'
};


// 필터 조건 (백엔드 API 파라미터에 맞춤)
export interface ReservationFilter {
    name?: string;                    // 예약자명 검색
    phone?: string;                   // 연락처 검색
    reservationNumber?: string;       // 예약번호 검색 (실제로는 reservationId 사용)
    reservationStatus?: ReservationStatusType; // 예약 상태 필터
    page?: number;                    // 페이지 번호 (0부터 시작)
    size?: number;                    // 페이지 크기
    sortBy?: string;                  // 정렬 필드
    sortDir?: 'asc' | 'desc';        // 정렬 방향
}

// 페이지네이션 응답 (Spring Data Page 구조)
export interface PageResponse<T> {
    content: T[];           // 실제 데이터 배열
    totalElements: number;  // 전체 요소 수
    totalPages: number;     // 전체 페이지 수
    size: number;          // 페이지 크기
    number: number;        // 현재 페이지 번호 (0부터 시작)
    numberOfElements: number; // 현재 페이지의 요소 수
    first: boolean;        // 첫 페이지 여부
    last: boolean;         // 마지막 페이지 여부
    empty: boolean;        // 빈 페이지 여부
}

// API 응답 타입
export type ReservationListResponse = PageResponse<ReservationAttendeeDto>;

// UI에서 사용할 예약 데이터 (백엔드 데이터 + UI 전용 필드)
export interface ReservationUIData extends ReservationAttendeeDto {
    // UI에서 필요한 추가 필드들
    reservationNumber: string;        // "RES-{reservationId}" 형태
    reservationDate: string;          // 포맷된 예약 날짜
    paymentStatusColor: string;       // 결제 상태 배경색
    paymentStatusTextColor: string;   // 결제 상태 텍스트색
    checkinStatus: string;            // 입장 상태 (예약 상태 기반)
    checkinStatusColor: string;       // 입장 상태 배경색
}

// 상태별 스타일 매핑
export const RESERVATION_STATUS_STYLES: Record<ReservationStatusType, {
    bgColor: string;
    textColor: string;
}> = {
    [RESERVATION_STATUS.PENDING]: {
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800'
    },
    [RESERVATION_STATUS.CONFIRMED]: {
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800'
    },
    [RESERVATION_STATUS.CANCELLED]: {
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800'
    },
    [RESERVATION_STATUS.REFUNDED]: {
        bgColor: 'bg-red-100',
        textColor: 'text-red-800'
    }
};


// 입장 상태 매핑 (예약 상태 기반)
export const getCheckinStatus = (reservationStatus: ReservationStatusType): {
    status: string;
    bgColor: string;
} => {
    switch (reservationStatus) {
        case RESERVATION_STATUS.CONFIRMED:
            return { status: '입장완료', bgColor: 'bg-green-100' };
        case RESERVATION_STATUS.CANCELLED:
        case RESERVATION_STATUS.REFUNDED:
            return { status: '취소', bgColor: 'bg-red-100' };
        case RESERVATION_STATUS.PENDING:
        default:
            return { status: '미입장', bgColor: 'bg-gray-100' };
    }
};