import api from "../api/axios";
import type { EventVersion, EventVersionComparison } from "./types/eventVersionType";
import type { EventDetailResponseDto } from "./types/eventType";
import type { Page } from "./types/pageType";

export const eventVersionAPI = {
    getEventVersions: async (eventId: number, pageable: { page: number; size: number }): Promise<Page<EventVersion>> => {
        const { page, size } = pageable;
        const response = await api.get(`/api/events/${eventId}/versions`, {
            params: {
                page,
                size,
                sort: 'versionNumber,desc'
            }
        });
        return response.data;
    },

    getEventVersion: async (eventId: number, versionNumber: number): Promise<EventDetailResponseDto> => {
        const response = await api.get(`/api/events/${eventId}/versions/${versionNumber}`);
        return response.data;
    },

    compareVersions: async (eventId: number, version1: number, version2: number): Promise<EventVersionComparison> => {
        const response = await api.get(`/api/events/${eventId}/versions/compare`, {
            params: {
                version1,
                version2
            }
        });
        return response.data;
    },
    
    createVersionRestoreRequest: async (eventId: number, versionNumber: number): Promise<any> => {
        const response = await api.post(`/api/events/${eventId}/versions/${versionNumber}/restore-request`);
        return response.data;
    }
};
