// EventRequestDto: 행사 기본 정보 생성
export interface EventRequestDto {
    email: string;
    titleKr: string;
    titleEng: string;
    hidden?: boolean;
}

// EventRequestDto: 행사 기본 정보 수정
export interface EventUpdateRequestDto {
    titleKr?: string;
    titleEng?: string;
    hidden?: boolean;
}

// EventResponseDto: 행사 상태 업데이트 후 정보
export interface EventResponseDto {
    message: string;
    eventId: number;
    eventCode: string;
    hidden: boolean;
    version: number
}

// EventSummaryDto: 행사 목록용 요약 정보
export interface EventSummaryDto {
    id: number;
    eventCode: string;
    hidden: boolean;
    title: string;
    minPrice: number;
    mainCategory: string;
    location: string;
    startDate: string;
    endDate: string;
    thumbnailUrl: string;
    region: string;
}

export interface EventSummaryResponseDto {
    message: string;
    events: EventSummaryDto[];
    pageable: any; // 필요시 타입 지정
    totalElements: number;
    totalPages: number;
}

// EventDetailRequestDto: 행사 상세 등록 요청
export interface EventDetailRequestDto {
    titleKr?: string;
    titleEng?: string;
    address?: string;
    placeName?: string;
    latitude?: number;
    longitude?: number;
    placeUrl?: string;
    locationDetail?: string;
    hostName?: string;
    contactInfo?: string;
    bio?: string;
    content: string;
    policy: string;
    officialUrl?: string;
    eventTime?: number;
    thumbnailUrl?: string;
    startDate: string;
    endDate: string;
    mainCategoryId: number;
    subCategoryId: number;
    checkOutAllowed?: boolean;
    reentryAllowed?: boolean;
    regionCodeId?: number;
    externalLinks?: ExternalLinkRequestDto[];
}

// EventDetailRequestDto: 행사 상세 수정 요청
export interface EventDetailUpdateRequestDto {
    titleKr?: string;
    titleEng?: string;
    address?: string;
    placeName?: string;
    latitude?: number;
    longitude?: number;
    placeUrl?: string;
    locationDetail?: string;
    hostName?: string;
    contactInfo?: string;
    bio?: string;
    content?: string;
    policy?: string;
    officialUrl?: string;
    eventTime?: number;
    thumbnailUrl?: string;
    startDate?: string;
    endDate?: string;
    mainCategoryId?: number;
    subCategoryId?: number;
    checkOutAllowed?: boolean;
    reentryAllowed?: boolean;
    regionCodeId?: number;
    externalLinks?: ExternalLinkRequestDto[];
}

// ExternalLinkRequestDto: 외부 링크 등록 요청
export interface ExternalLinkRequestDto {
    url: string;
    displayText: string;
}

// ExternalLinkResponseDto
export interface ExternalLinkResponseDto {
    url: string;
    displayText: string;
}

// EventDetailResponseDto
export interface EventDetailResponseDto {
    message: string;

    // 관리자 전용
    managerId?: number;
    eventCode?: string;
    createdAt?: string;
    updatedAt?: string;
    version?: number;

    // 공통
    titleKr: string;
    titleEng: string;

    hidden: boolean;
    eventStatusCode: string;

    mainCategory: string;
    subCategory: string

    address: string;
    placename: string;
    latitude: number;
    longitude: number;
    placeUrl: string;
    locationDetail: string;
    region: string;

    startDate: string;
    endDate: string;

    thumbnailUrl: string;

    hostName: string;
    contactInfo: string;
    officialUrl: string;

    bio: string;
    content: string;
    policy: string;
    eventTime: number;

    checkOutAllowed: boolean;
    reentryAllowed: boolean;

    externalLinks: ExternalLinkResponseDto[];
}

// 공통 페이지네이션 응답
export interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number; // 현재 페이지 번호
    size: number;   // 페이지당 항목 수
}
