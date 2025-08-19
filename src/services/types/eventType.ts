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
    message?: string;
    eventId: number;
    eventCode: string;
    hidden: boolean;
    version: number;
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
    latitude: number;
    longitude: number;
    startDate: string;
    endDate: string;
    thumbnailUrl: string;
    region: string;
    eventStatusCode?: string; // 행사 상태 코드 추가
}

export interface EventSummaryResponseDto {
    message?: string;
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

// EventDetailModificationRequestDto: 행사 상세 수정 요청
export interface EventDetailModificationRequestDto {
    titleKr?: string;
    titleEng?: string;
    address?: string;
    placeName?: string;
    latitude?: number;
    longitude?: number;
    placeUrl?: string;
    locationId?: number;
    locationDetail?: string;
    hostName?: string;
    hostCompany?: string;
    contactInfo?: string;
    bio?: string;
    content?: string;
    policy?: string;
    officialUrl?: string;
    eventTime?: number;  // 백엔드에서 Integer로 받음 (분 단위)
    thumbnailUrl?: string;
    bannerUrl?: string;
    startDate?: string;
    endDate?: string;
    mainCategoryId?: number;
    subCategoryId?: number;
    regionCodeId?: number;
    externalLinks?: ExternalLinkRequestDto[];
    reentryAllowed?: boolean;
    checkInAllowed?: boolean;
    checkOutAllowed?: boolean;
    age?: boolean;
    businessNumber?: string;    // 사업자 등록번호
    verified?: boolean;         // 사업자 등록번호 검증 여부
    managerName?: string;       // 담당자명
    managerPhone?: string;      // 담당자 연락처
    managerEmail?: string;      // 담당자 이메일
    tempFiles?: FileUploadDto[];
    deletedFileIds?: number[];  // 삭제할 파일 ID 목록
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
    message?: string;
    eventId: number;

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
    placeName: string;
    latitude: number;
    longitude: number;
    placeUrl: string;
    locationDetail: string;
    region: string;

    startDate: string;
    endDate: string;

    thumbnailUrl: string;

    hostName: string;
    hostCompany?: string;
    contactInfo: string;
    officialUrl: string;

    managerName?: string;
    managerPhone?: string;
    managerEmail?: string;
    managerBusinessNumber?: string;

    bio: string;
    content: string;
    policy: string;
    eventTime: number;

    checkInAllowed: boolean;
    checkOutAllowed: boolean;
    reentryAllowed: boolean;
    age?: boolean;

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

// 행사 등록 신청 관련 타입
export interface FileUploadDto {
    s3Key: string;
    originalFileName: string;
    fileType: string;
    fileSize: number;
    usage: string; // "application_file", "banner", "thumbnail" 등
}

export interface EventApplyRequestDto {
    eventEmail: string;
    businessNumber: string;
    businessName: string;
    businessDate: string; // YYYY-MM-DD 형식으로 백엔드 LocalDate와 매칭
    verified: boolean;
    managerName: string;
    email: string;
    contactNumber: string;
    titleKr: string;
    titleEng: string;
    
    // 파일 업로드 정보
    tempFiles: FileUploadDto[];
    
    // EventDetail과 비슷한 정보들
    locationId?: number | null;
    locationDetail?: string;
    
    // 새로운 장소 정보 (카카오맵에서 받은 데이터)
    address?: string;
    placeName?: string;
    latitude?: number;
    longitude?: number;
    placeUrl?: string;
    
    startDate: string; // YYYY-MM-DD 형식으로 백엔드 LocalDate와 매칭
    endDate: string; // YYYY-MM-DD 형식으로 백엔드 LocalDate와 매칭
    mainCategoryId?: number | null;
    subCategoryId?: number | null;
    
    // 이미지 파일들은 tempFiles에서 처리
    bannerUrl?: string;
    thumbnailUrl?: string;
}

export interface EventApplyResponseDto {
    id: number;
    eventEmail: string;
    businessNumber: string;
    businessName?: string;
    businessDate?: string;
    verified?: boolean;
    managerName: string;
    email: string;
    contactNumber: string;
    titleKr: string;
    titleEng: string;
    status: string;
    locationId?: number;
    locationDetail?: string;
    startDate: string;
    endDate: string;
    mainCategoryId?: number;
    subCategoryId?: number;
    bannerUrl?: string;
    thumbnailUrl?: string;
    createdAt: string;
    updatedAt?: string;
}

// 목록 조회용 아이템
export interface EventApplyListItem {
    eventApplyId: number;
    applyAt: string;        // 신청일 (yyyy-MM-dd or yyyy.MM.dd)
    titleKr: string;
    startDate: string;
    endDate: string;
    managerName: string;
    contactNumber: string;
    statusCode: "PENDING" | "APPROVED" | "REJECTED";
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number; // 현재 페이지 index (0-based)
}

export interface EventApplyDetail {
    eventApplyId: number;
    statusCode: "PENDING" | "APPROVED" | "REJECTED";
    statusName: "대기" | "승인" | "거부";
    eventEmail: string;
    businessNumber: string;
    businessName: string;
    businessDate: string;
    verified: boolean;
    managerName: string;
    email: string;
    contactNumber: string;
    titleKr: string;
    titleEng: string;
    fileUrl: string;
    appliedAt: string;
    adminComment: string;
    statusUpdatedAt: string;
    locationId: number;
    address: string;
    locationName: string;
    locationDetail?: string;
    startDate: string;
    endDate: string;
    mainCategoryName: string;
    subCategoryName: string;
    bannerUrl: string;
    thumbnailUrl: string;
    updatedAt: string;
}

// Event Version Management Types
export interface TicketSnapshotDto {
    name: string;
    price: number;
    stock: number;
}

export interface ExternalLinkSnapshot {
    url: string;
    displayText: string;
}

export interface EventSnapshotDto {
    eventCode: string;
    titleKr: string;
    titleEng: string;
    hidden: boolean;
    managerId?: number;
    eventStatusCodeId?: number;
    locationId?: number;
    locationDetail?: string;
    hostName?: string;
    hostCompany?: string;
    contactInfo?: string;
    bio?: string;
    content?: string;
    policy?: string;
    officialUrl?: string;
    eventTime?: number;
    thumbnailUrl?: string;
    bannerUrl?: string;
    startDate?: string;
    endDate?: string;
    reentryAllowed?: boolean;
    checkInAllowed?: boolean;
    checkOutAllowed?: boolean;
    age?: boolean;
    mainCategoryId?: number;
    subCategoryId?: number;
    regionCodeId?: number;
    tickets: TicketSnapshotDto[];
    externalLinks: ExternalLinkSnapshot[];
}

export interface EventVersionResponseDto {
    versionId: number;
    eventId: number;
    versionNumber: number;
    snapshot: EventSnapshotDto;
    updatedBy: number;
    updatedAt: string;
}

export interface EventVersionListDto {
    versionId: number;
    versionNumber: number;
    titleKr: string;
    titleEng: string;
    updatedAt: string;
    updatedBy: number;
    modificationStatus?: string;
}

export interface EventVersionComparisonDto {
    eventId: number;
    version1: number;
    version2: number;
    snapshot1: EventSnapshotDto;
    snapshot2: EventSnapshotDto;
    fieldDifferences: Record<string, {
        displayName: string;
        oldValue: any;
        newValue: any;
        changeType: 'added' | 'removed' | 'modified';
    }>;
}