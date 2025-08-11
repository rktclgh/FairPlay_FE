import api from '../api/axios';
import type {
    EventRequestDto,
    EventResponseDto,
    EventDetailRequestDto,
    EventDetailResponseDto,
    ExternalLinkRequestDto,
    EventSummaryResponseDto,
    Page
} from './types/eventType';



export const eventAPI = {

    /**
     * [CREATE] 행사 생성
     * @param {Object} eventData - EventRequestDto 형식의 JSON 데이터
     * @returns 생성된 EventResponseDto
     */
    createEvent: async (data: EventRequestDto): Promise<EventResponseDto> => {
        const res = await api.post('/api/events', data);
        return res.data;
    },

    /**
     * [CREATE] 행사 상세 등록
     * @param {number} eventId - 행사 ID
     * @param {Object} detailData - EventDetailRequestDto 형식의 JSON 데이터
     * @returns 생성된 행사 상세 정보
     */
    createEventDetail: async (eventId: number, data: EventDetailRequestDto): Promise<EventDetailResponseDto> => {
        const res = await api.post(`/api/events/${eventId}/details`, data);
        return res.data;
    },

    /**
     * [READ] 전체 행사 목록 조회 (관리자용)
     * @returns EventResponseDto[] 배열
     */
    getAllEvents: async (): Promise<EventResponseDto[]> => {
        const res = await api.get('/api/events/list');
        return res.data;
    },

    /**
     * [READ] 행사 검색 및 필터링 목록 조회
     * @param {Object} params - 필터 조건 (카테고리, 지역, 날짜 등)
     * @returns Page<EventResponseDto>
     */
    getEventList: async (params?: {
        keyword?: string;
        mainCategoryId?: number;
        subCategoryId?: number;
        regionName?: string;
        fromDate?: string; // "YYYY-MM-DD"
        toDate?: string;   // "YYYY-MM-DD"
        page?: number;
        size?: number;
    }): Promise<EventSummaryResponseDto> => {
        try {
            const res = await api.get('/api/events', { params });
            return res.data;
        } catch (error) {
            console.error('이벤트 목록 로드 실패:', error);
            // 기본값 반환하여 앱이 깨지지 않도록 함
            return {
                events: [],
                totalPages: 0,
                totalElements: 0,
                currentPage: 0,
                pageSize: params.size || 20
            };
        }
    },

    /**
     * [READ] 특정 행사 상세 정보 조회
     * @param {number} eventId - 행사 ID
     * @returns EventDetailResponseDto
     */
    getEventDetail: async (eventId: number): Promise<EventDetailResponseDto> => {
        const res = await api.get(`/api/events/${eventId}/details`);
        return res.data;
    },

    /**
     * [UPDATE] 행사 정보(제목/숨김여부 등) 수정
     * @param {number} eventId - 행사 ID
     * @param {Object} updatedData - 수정할 EventRequestDto 형식
     * @returns 수정된 EventResponseDto
     */
    updateEvent: async (eventId: number, data: EventRequestDto): Promise<EventResponseDto> => {
        const res = await api.patch(`/api/events/${eventId}`, data);
        return res.data;
    },

    /**
     * [UPDATE] 행사 상세 정보 수정
     * @param {number} eventId - 행사 ID
     * @param {Object} detailData - EventDetailRequestDto 형식
     * @returns 수정된 상세 정보
     */
    updateEventDetail: async (eventId: number, data: EventDetailRequestDto): Promise<EventDetailResponseDto> => {
        const res = await api.patch(`/api/events/${eventId}/details`, data);
        return res.data;
    },

    /**
     * [DELETE] 행사 삭제
     * @param {number} eventId - 삭제할 행사 ID
     * @returns 삭제 완료 메시지
     */
    deleteEvent: async (eventId: number): Promise<{ message: string }> => {
        const res = await api.delete(`/api/events/${eventId}`);
        return res.data;
    },
};