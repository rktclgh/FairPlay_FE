import api from './axios';

export interface Creator {
    id: number;
    name: string;
    email: string;
    profileImage?: string;
    role: string;
    bio: string;
    responsibilities?: string[];
    github?: string;
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
    displayOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreatorRequest {
    name: string;
    email: string;
    profileImageUrl?: string;
    role: string;
    bio: string;
    responsibilities?: string[];
    githubUrl?: string;
    linkedinUrl?: string;
    instagramUrl?: string;
    twitterUrl?: string;
    websiteUrl?: string;
    displayOrder: number;
    isActive?: boolean;
}

// ==================== Public Creator APIs ====================

/**
 * 활성화된 제작자 목록 조회 (일반 사용자용)
 */
export const getActiveCreators = (): Promise<Creator[]> => {
    return api.get('/api/creators').then(res => res.data);
};

/**
 * 특정 제작자 조회
 */
export const getCreatorById = (id: number): Promise<Creator> => {
    return api.get(`/api/creators/${id}`).then(res => res.data);
};

// ==================== Admin Creator APIs ====================

/**
 * 모든 제작자 조회 (관리자용 - 비활성화 포함)
 * @requires MASTER_ADMIN role
 */
export const getAllCreators = (): Promise<Creator[]> => {
    return api.get('/api/creators/admin/all').then(res => res.data);
};

/**
 * 제작자 생성
 * @requires MASTER_ADMIN role
 */
export const createCreator = (data: CreatorRequest): Promise<Creator> => {
    return api.post('/api/creators', data).then(res => res.data);
};

/**
 * 제작자 수정
 * @requires MASTER_ADMIN role
 */
export const updateCreator = (id: number, data: CreatorRequest): Promise<Creator> => {
    return api.put(`/api/creators/${id}`, data).then(res => res.data);
};

/**
 * 제작자 삭제
 * @requires MASTER_ADMIN role
 */
export const deleteCreator = (id: number): Promise<void> => {
    return api.delete(`/api/creators/${id}`).then(res => res.data);
};
