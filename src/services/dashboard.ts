import api from '../api/axios';
import { EventDetailResponseDto } from './types/eventType';

// 대시보드 통계 관련 타입 정의
export interface ReservationSummaryDto {
    totalReservations: number;
    totalCheckins: number;
    totalCancellations: number;
    totalNoShows: number;
}

export interface ReservationDailyTrendDto {
    date: string;
    reservations: number;
}

export interface TicketRatioDto {
    ticketName: string;
    count: number;
    percentage: number;
}

export interface SessionStatsDto {
    sessionDate: string;
    sessionTime: string;
    reservations: number;
    checkins: number;
}

export interface EventDashboardStatsDto {
    summary: ReservationSummaryDto;
    dailyTrend: ReservationDailyTrendDto[];
    ticketRatio: TicketRatioDto[];
    sessionStats: SessionStatsDto[];
}

// 매출 통계 관련 타입 정의
export interface SalesSummarySection {
    totalSales: number;
    totalReservations: number;
    paid: PaymentStatusInfo;
    cancelled: PaymentStatusInfo;
    refunded: PaymentStatusInfo;
}

export interface PaymentStatusInfo {
    count: number;
    amount: number;
}

export interface StatusBreakdownItem {
    label: string;
    percentage: number;
    amount: number;
}

export interface SessionSalesItem {
    dateTime: string;
    ticketName: string;
    unitPrice: number;
    quantity: number;
    salesAmount: number;
    status: string;
}

export interface SalesDashboardResponse {
    summary: SalesSummarySection;
    statusBreakdown: StatusBreakdownItem[];
    sessionSales: SessionSalesItem[];
}

// 이벤트 기본 정보 타입 (백엔드 EventResponseDto에 맞게 수정)
export interface EventBasicInfo {
    eventId: number;
    managerId?: number;
    eventCode: string;
    hidden: boolean;
    version: number;
    message?: string;
}

export const dashboardAPI = {
    /**
     * 현재 사용자의 권한 정보 조회
     */
    getCurrentUserRole: async (): Promise<{ roleCode: string; userId: number; isAdmin: boolean; isEventManager: boolean; isBoothManager: boolean }> => {
        const response = await api.get('/api/events/user/role');
        return response.data;
    },

    /**
     * 사용자의 담당 이벤트 조회 (한 계정당 하나)
     */
    getMyEvent: async (): Promise<EventBasicInfo> => {
        console.log('getMyEvent API 호출 시작');
        const token = localStorage.getItem('accessToken');
        console.log('토큰 확인:', token ? '토큰 있음' : '토큰 없음');
        
        const response = await api.get('/api/events/my-event');
        console.log('담당 이벤트 응답:', response.data);
        return response.data;
    },

    /**
     * 사용자의 담당 이벤트와 상세 정보를 함께 조회
     */
    getMyEventWithDetails: async (): Promise<EventDetailResponseDto | null> => {
        console.log('getMyEventWithDetails API 호출 시작');
        
        try {
            // 담당 이벤트 조회
            const event = await dashboardAPI.getMyEvent();
            console.log('조회된 담당 이벤트:', event);
            
            // 이벤트 상세 정보 조회
            try {
                const detail = await dashboardAPI.getEventDetail(event.eventId);
                return {
                    ...detail,
                    eventId: event.eventId,
                    managerId: event.managerId,
                };
            } catch (detailError) {
                console.error(`이벤트 ${event.eventId} 상세 정보 조회 실패:`, detailError);
                // 상세 정보를 가져올 수 없는 경우 null 반환 또는 기본값 처리
                return null;
            }
        } catch (error) {
            console.error('담당 이벤트 조회 실패:', error);
            return null;
        }
    },

    /**
     * 특정 이벤트의 예약 통계 조회
     */
    getEventDashboardStats: async (
        eventId: number, 
        startDate: string, 
        endDate: string
    ): Promise<EventDashboardStatsDto> => {
        console.log('예약 통계 API 호출:', { eventId, startDate, endDate });
        const response = await api.get(`/api/stats/reservations/${eventId}`, {
            params: {
                start: startDate,
                end: endDate
            }
        });
        console.log('예약 통계 응답:', response.data);
        return response.data;
    },

    /**
     * 특정 이벤트의 매출 통계 조회
     */
    getSalesStatistics: async (
        eventId: number, 
        startDate: string, 
        endDate: string
    ): Promise<SalesDashboardResponse> => {
        console.log('매출 통계 API 호출:', { eventId, startDate, endDate });
        const response = await api.get(`/api/stats/sales/${eventId}`, {
            params: {
                start: startDate,
                end: endDate
            }
        });
        console.log('매출 통계 응답:', response.data);
        return response.data;
    },

    /**
     * 이벤트 상세 정보 조회
     */
    getEventDetail: async (eventId: number): Promise<EventDetailResponseDto> => {
        const response = await api.get(`/api/events/${eventId}/details`);
        return response.data;
    }
};