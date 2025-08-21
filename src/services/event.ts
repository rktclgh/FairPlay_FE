import api from '../api/axios';
import type {
    EventRequestDto,
    EventResponseDto,
    EventDetailRequestDto,
    EventDetailResponseDto,
    EventDetailModificationRequestDto,
    ExternalLinkRequestDto,
    EventSummaryResponseDto,
    EventApplyRequestDto,
    EventApplyResponseDto,
    Page, PageResponse, EventApplyListItem, EventApplyDetail
} from './types/eventType';

export interface HotPick {
  id: number;
  title: string;
  date: string;
  location: string;
  category: string;
  image: string;
}

export const eventAPI = {

   async getHotPicks({ size = 10 }: { size?: number } = {}): Promise<HotPick[]> {
    const tries = [
      ["/api/events/hot-picks", { size }],  // 새로운 예약 기반 핫픽 API
      ["/api/banners/hot-picks", { size }],
      ["/api/banner/hot-picks",  { size }],
    ] as const;

    const parse = (data: any): HotPick[] => {
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.items))   return data.items;
      if (Array.isArray(data?.content)) return data.content;
      return [];
    };

    for (const [url, params] of tries) {
      try {
        const { data } = await api.get(url, { params });
        return parse(data);
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 404 || status === 405) continue; // 엔드포인트 없을 때만 폴백
        console.warn("[HOT-PICKS] request failed:", url, status, err?.response?.data);
        break;
      }
    }
    return [];
  },

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
     * @param {Object} params
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
        includeHidden?: boolean;
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
     * [CREATE] 행사 상세 정보 수정 요청
     * @param {string} eventId - 행사 ID
     * @param {Object} modificationData - EventDetailModificationRequestDto 형식
     * @returns 생성된 수정 요청 정보
     */
    createEventModificationRequest: async (eventId: number, data: EventDetailModificationRequestDto): Promise<any> => {
        const res = await api.post(`/api/events/${eventId}/modification-request`, data);
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

    /**
     * [CREATE] 행사 등록 신청
     * @param {EventApplyRequestDto} data - 행사 등록 신청 데이터
     * @returns 행사 등록 신청 응답
     */
    submitEventApplication: async (data: EventApplyRequestDto): Promise<EventApplyResponseDto> => {
        const res = await api.post('/api/events/apply', data);
        return res.data;
    },

    /**
     * [READ] 행사 등록 신청 상태 확인
     * @param {string} eventEmail - 등록한 이메일
     * @returns 행사 등록 신청 정보
     */
    checkApplicationStatus: async (eventEmail: string): Promise<EventApplyResponseDto> => {
        const res = await api.get('/api/events/apply/check', {
            params: { eventEmail }
        });
        return res.data;
    },

    /** 행사 신청 목록 조회 (관리자) */
    getEventApplications: (params?: { status?: string; page?: number; size?: number }) =>
        api.get<PageResponse<EventApplyListItem>>("/api/events/applications", { params })
            .then(res => res.data),

    /** 행사 신청 상세 조회 */
    getEventApplicationDetail: (id: number) =>
        api.get<EventApplyDetail>(`/api/events/applications/${id}`).then(res => res.data),

    /** 행사 신청 상태 변경 (승인/반려) */
    updateEventApplicationStatus: (
        id: number,
        payload: { action: "approve" | "reject"; adminComment?: string }
    ) =>
        api.put(`/api/events/applications/${id}`, payload).then(res => res.data),


};