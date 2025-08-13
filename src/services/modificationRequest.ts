import api from '../api/axios';

// 수정 요청 관련 타입 정의
export interface ModificationRequestListItem {
    requestId: number;
    eventId: number;
    eventTitle: string;
    eventCode?: string;
    requestedBy: number;
    statusCode: string;
    statusName: string;
    createdAt: string;
    processedAt?: string;
    adminComment?: string;
}

export interface ModificationRequestDetail {
    requestId: number;
    eventId: number;
    eventTitle: string;
    eventCode?: string;
    requestedBy: number;
    statusCode: string;
    statusName: string;
    processedBy?: number;
    processedAt?: string;
    adminComment?: string;
    createdAt: string;
    updatedAt: string;
    originalData: any;
    modifiedData: any;
}

export interface ModificationApprovalRequest {
    action: 'approve' | 'reject';
    adminComment?: string;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

// 관리자 수정 요청 목록 조회
export const getModificationRequests = async (params?: {
    status?: string;
    eventId?: number;
    requestedBy?: number;
    page?: number;
    size?: number;
}): Promise<PageResponse<ModificationRequestListItem>> => {
    const response = await api.get('/api/events/modification-requests', { params });
    return response.data;
};

// 수정 요청 상세 조회
export const getModificationRequestDetail = async (requestId: number): Promise<ModificationRequestDetail> => {
    const response = await api.get(`/api/events/modification-requests/${requestId}`);
    return response.data;
};

// 수정 요청 승인/반려
export const processModificationRequest = async (
    requestId: number, 
    data: ModificationApprovalRequest
): Promise<string> => {
    const response = await api.put(`/api/events/modification-requests/${requestId}`, data);
    return response.data;
};

export const modificationRequestAPI = {
    getModificationRequests,
    getModificationRequestDetail,
    processModificationRequest
};