import api from './axios';
import type {
    Booth,
    BoothSummary,
    BoothDetailResponse,
    BoothSummaryForManager,
    BoothApplication,
    BoothApplicationList,
    BoothApplicationStatusUpdate,
    BoothPaymentStatusUpdate,
    BoothType,
    BoothUpdateRequest,
    BoothAdminRequest,
    BoothAdminResponse,
    BoothUserRecentlyWaitingCount
} from '../types/booth';

// ==================== Booth APIs ====================

export const getBooths = (eventId: number): Promise<BoothSummary[]> => {
    return api.get(`/api/events/${eventId}/booths`).then(res => res.data);
};

export const getAllBoothsForHost = (eventId: number): Promise<BoothSummaryForManager[]> => {
    return api.get(`/api/events/${eventId}/booths/host`).then(res => res.data);
};

export const getBoothDetails = (eventId: number, boothId: number): Promise<BoothDetailResponse> => {
    return api.get(`/api/events/${eventId}/booths/${boothId}`).then(res => res.data);
};

export const updateBooth = (eventId: number, boothId: number, data: BoothUpdateRequest): Promise<BoothDetailResponse> => {
    return api.patch(`/api/events/${eventId}/booths/${boothId}`, data).then(res => res.data);
};

export const deleteBooth = (eventId: number, boothId: number): Promise<string> => {
    return api.delete(`/api/events/${eventId}/booths/${boothId}`).then(res => res.data);
};

export const updateBoothAdminInfo = (eventId: number, boothId: number, data: BoothAdminRequest): Promise<BoothAdminResponse> => {
    return api.patch(`/api/events/${eventId}/booths/${boothId}/manager`, data).then(res => res.data);
};

export const getUserRecentlyEventWaitingCount = async (eventId: number): Promise<BoothUserRecentlyWaitingCount> => {
    const accessToken = localStorage.getItem("accessToken");
    const res = await api.get<BoothUserRecentlyWaitingCount>(`/user/${eventId}/waiting-count`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    return res.data;
}

// ==================== Booth Type APIs ====================

export const getBoothTypes = (eventId: number): Promise<BoothType[]> => {
    return api.get(`/api/events/${eventId}/booths/types`).then(res => res.data);
};

export const createBoothType = (eventId: number, data: BoothType): Promise<BoothType> => {
    return api.post(`/api/events/${eventId}/booths/types`, data).then(res => res.data);
};

export const updateBoothType = (eventId: number, boothTypeId: number, data: BoothType): Promise<BoothType> => {
    return api.patch(`/api/events/${eventId}/booths/types/${boothTypeId}`, data).then(res => res.data);
};

export const deleteBoothType = (eventId: number, boothTypeId: number): Promise<void> => {
    return api.delete(`/api/events/${eventId}/booths/types/${boothTypeId}`).then(res => res.data);
};

// ==================== Booth Application APIs ====================

export const applyForBooth = (eventId: number, data: any): Promise<BoothApplication> => {
    return api.post(`/api/events/${eventId}/booths/apply`, data).then(res => res.data);
};

export const getBoothApplications = (eventId: number): Promise<BoothApplicationList[]> => {
    return api.get(`/api/events/${eventId}/booths/apply`).then(res => res.data);
};

export const getBoothApplicationDetails = (eventId: number, applicationId: number): Promise<BoothApplication> => {
    return api.get(`/api/events/${eventId}/booths/apply/${applicationId}`).then(res => res.data);
};

export const updateApplicationStatus = (eventId: number, applicationId: number, data: BoothApplicationStatusUpdate): Promise<void> => {
    return api.put(`/api/events/${eventId}/booths/apply/${applicationId}/status`, data).then(res => res.data);
};

export const updatePaymentStatus = (eventId: number, applicationId: number, data: BoothPaymentStatusUpdate): Promise<void> => {
    return api.put(`/api/events/${eventId}/booths/apply/${applicationId}/payment-status`, data).then(res => res.data);
};

export const cancelApplication = (eventId: number, applicationId: number): Promise<void> => {
    return api.put(`/api/events/${eventId}/booths/apply/${applicationId}/cancel`).then(res => res.data);
};
