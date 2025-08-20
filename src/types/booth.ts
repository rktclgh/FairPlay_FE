// 부스 상세 정보 (백엔드 BoothDetailResponseDto에 맞춤)
export interface BoothDetailResponse {
    boothId: number;
    boothTitle: string;
    boothBannerUrl?: string;
    boothDescription: string;
    boothTypeName: string;
    location: string;
    startDate: string; // LocalDate -> string
    endDate: string;   // LocalDate -> string
    managerName: string;
    contactEmail: string;
    contactNumber: string;
    boothExternalLinks: BoothExternalLink[];
}

// 부스 요약 정보 (일반 사용자용)
export interface BoothSummary {
    boothId: number;
    boothTitle: string;
    boothBannerUrl?: string;
    location: string;
}

// 부스 요약 정보 (관리자용)
export interface BoothSummaryForManager {
    boothId: number;
    boothTitle: string;
    boothBannerUrl?: string;
    boothDescription: string;
    boothTypeName: string;
    location: string;
    startDate: string;
    endDate: string;
    managerName: string;
    contactEmail: string;
    contactNumber: string;
    isDeleted: boolean;
}

// 기존 Booth 인터페이스는 BoothDetailResponse로 대체
export interface Booth extends BoothDetailResponse {}

export interface BoothExternalLink {
    url: string;
    displayText: string;
}

// 기존 ExternalLink는 BoothExternalLink로 대체
export interface ExternalLink extends BoothExternalLink {}

export interface BoothUpdateRequest {
    boothTitle?: string;
    boothDescription?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    boothExternalLinks?: BoothExternalLink[];
    deletedFileIds?: number[];
    tempFiles?: any[];
}

export interface BoothType {
    id: number;
    name: string;
    size: string;
    price: number;
    maxApplicants: number;
}

// 부스 신청 상세 정보 (백엔드 BoothApplicationResponseDto에 맞춤)
export interface BoothApplication {
    boothApplicationId: number;
    boothTitle: string;
    boothDescription: string;
    boothEmail: string;
    managerName: string;
    contactEmail: string;
    contactNumber: string;
    boothTypeName: string;
    startDate: string; // LocalDate -> string
    endDate: string;   // LocalDate -> string
    boothExternalLinks: BoothExternalLink[];
    boothBannerUrl?: string;
    statusCode: string;
    paymentStatus: string;
    applyAt: string; // LocalDateTime -> string
    adminComment?: string;
}

// 부스 신청 목록용 (백엔드 BoothApplicationListDto에 맞춤)
export interface BoothApplicationList {
    boothApplicationId: number;
    boothTitle: string;
    boothTypeName: string;
    managerName: string;
    contactEmail: string;
    statusCode: string;
    statusName: string;
    paymentStatus: string;
    paymentStatusCode: string;
    applyAt: string;
}

// 부스 신청 요청 데이터
export interface BoothApplicationRequest {
    boothTitle: string;
    boothDescription: string;
    boothEmail: string;
    managerName: string;
    contactEmail: string;
    contactNumber: string;
    boothTypeId: number;
    startDate: string;
    endDate: string;
    boothExternalLinks?: BoothExternalLink[];
    boothBannerUrl?: string;
}

export interface BoothApplicationStatusUpdate {
    statusCode: 'APPROVED' | 'REJECTED';
    adminComment?: string;
}

export interface BoothPaymentStatusUpdate {
    paymentStatus: 'PAID' | 'CANCELLED' | 'PENDING';
}

// 부스 관리자 정보 관련
export interface BoothAdminRequest {
    name: string;
    email: string;
    phone: string;
}

export interface BoothAdminResponse {
    userId: number;
    name: string;
    email: string;
    phone: string;
}
