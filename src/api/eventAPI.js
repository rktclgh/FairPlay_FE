import axios from 'axios';

/**
 * [CREATE] 행사 생성
 * @param {Object} eventData - EventRequestDto 형식의 JSON 데이터
 * @returns 생성된 EventResponseDto
 */
export const createEvent = async (eventData) => {
    try {
        const response = await axios.post('/api/events', eventData);
        return response.data;
    } catch (error) {
        console.error('행사 생성 실패:', error);
        throw error.response?.data || error;
    }
};


/**
 * [CREATE] 행사 상세 등록
 * @param {number} eventId - 행사 ID
 * @param {Object} detailData - EventDetailRequestDto 형식의 JSON 데이터
 * @returns 생성된 행사 상세 정보
 */
export const createEventDetail = async (eventId, detailData) => {
    try {
       const response = await axios.post(`/api/events/${eventId}/details`, detailData);
        return response.data;
    } catch (error) {
        console.error('행사 상세 등록 실패:', error);
        throw error.response?.data || error;
    }
};


/**
 * [READ] 전체 행사 목록 조회 (관리자용)
 * @returns EventResponseDto[] 배열
 */
export const getAllEvents = async () => {
    try {
        const response = await axios.get('/api/events/list');
        return response.data;
    } catch (error) {
        console.error('행사 목록 조회 실패:', error);
        throw error.response?.data || error;
    }
};


/**
 * [READ] 행사 검색 및 페이지별 목록 조회
 * @param {Object} params - 검색어/페이지 정보 (예: { keyword, page, size })
 * @returns Page<EventResponseDto>
 */
export const getEventList = async (params = {}) => {
    try {
        const response = await axios.get('/api/events');
        return response.data;
    } catch (error) {
        console.error('행사 목록 검색 실패:', error);
        throw error.response?.data || error;
    }
};


/**
 * [READ] 특정 행사 상세 정보 조회
 * @param {number} eventId - 행사 ID
 * @returns EventDetailResponseDto
 */
export const getEventDetail = async (eventId) => {
    try {
        const response = await axios.get(`/api/events/${eventId}/details`);
        return response.data;
    } catch (error) {
        console.error('행사 상세 조회 실패:', error);
        throw error.response?.data || error;
    }
};


/**
 * [UPDATE] 행사 정보(제목/숨김여부 등) 수정
 * @param {number} eventId - 행사 ID
 * @param {Object} updatedData - 수정할 EventRequestDto 형식
 * @returns 수정된 EventResponseDto
 */
export const updateEvent = async (eventId, updatedData) => {
    try {
        const response = await axios.patch(`/api/events/${eventId}`, updatedData);
        return response.data;
    } catch (error) {
        console.error('행사 수정 실패:', error);
        throw error.response?.data || error;
    }
};


/**
 * [UPDATE] 행사 상세 정보 수정
 * @param {number} eventId - 행사 ID
 * @param {Object} detailData - EventDetailRequestDto 형식
 * @returns 수정된 상세 정보
 */
export const updateEventDetail = async (eventId, detailData) => {
    try {
        const response = await axios.patch(`/api/events/${eventId}/details`, detailData);

        return response.data;
    } catch (error) {
        console.error('행사 상세 수정 실패:', error);
        throw error.response?.data || error;
    }
};


/**
 * [DELETE] 행사 삭제
 * @param {number} eventId - 삭제할 행사 ID
 * @returns 삭제 완료 메시지
 */
export const deleteEvent = async (eventId) => {
    try {
        const response = await axios.delete(`/api/events/${eventId}`);
        return response.data;
    } catch (error) {
        console.error('행사 삭제 실패:', error);
        throw error.response?.data || error;
    }
};
