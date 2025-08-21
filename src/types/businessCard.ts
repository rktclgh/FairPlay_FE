// 전자명함 요청 타입
export interface BusinessCardRequest {
    name?: string;
    company?: string;
    position?: string;
    department?: string;
    phoneNumber?: string;
    email?: string;
    website?: string;
    address?: string;
    description?: string;
    linkedIn?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    profileImageUrl?: string;
}

// 전자명함 응답 타입
export interface BusinessCardResponse {
    cardId: number;
    userId: number;
    name?: string;
    company?: string;
    position?: string;
    department?: string;
    phoneNumber?: string;
    email?: string;
    website?: string;
    address?: string;
    description?: string;
    linkedIn?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    profileImageUrl?: string;
    createdAt: string;
    updatedAt: string;
}

// 수집한 명함 타입
export interface CollectedCard {
    id: number;
    cardOwnerId: number;
    businessCard: BusinessCardResponse;
    memo?: string;
    collectedAt: string;
}

// QR 코드 응답 타입
export interface QRCodeResponse {
    qrUrl: string;
}

// 명함 수집 요청 타입
export interface CollectCardRequest {
    memo?: string;
}

// 메모 수정 요청 타입
export interface UpdateMemoRequest {
    memo: string;
}

// 소셜 미디어 링크 타입
export interface SocialMediaLinks {
    linkedIn?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
}

// 전자명함 폼 데이터 타입
export interface BusinessCardFormData extends BusinessCardRequest {
    // 프론트엔드에서만 사용하는 추가 필드들
    isEditing?: boolean;
    hasChanges?: boolean;
}