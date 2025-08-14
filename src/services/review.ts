import api from "../api/axios";
import type {
    ReviewSaveRequestDto,
    ReviewSaveResponseDto,
    ReviewForEventResponseDto,
    ReviewWithOwnerDto,
    ReviewResponseDto,
    ReviewUpdateRequestDto,
    ReviewUpdateResponseDto,
    ReviewDeleteResponseDto,
    PossibleReviewResponseDto,
    Page,
    PageableRequest
} from "./types/reviewType";

// 리뷰 저장 
export const saveReview = async (data: ReviewSaveRequestDto): Promise<ReviewSaveResponseDto> => {
    const res = await api.post<ReviewSaveResponseDto>(`/api/reviews`,data);
    return res.data;
}

// 리뷰 조회 - 행사 상세 페이지
export const getReviewsByEvent = async (eventId: number, params?: PageableRequest): Promise<ReviewForEventResponseDto> => {
    const res = await api.get<ReviewForEventResponseDto>(`/api/reviews/${eventId}`, {params});
    return res.data;
}

// 리뷰 조회 - 마이페이지
export const getReviewsByMember = async (page: number): Promise<Page<ReviewResponseDto>> => {
    const res = await api.get<Page<ReviewResponseDto>>(`/api/reviews?page=${page}`);
    return res.data;
}

// 작성 가능한 행사 목록 조회 - 마이페이지
export const getPossibleSaveReview = async (page: number): Promise<Page<PossibleReviewResponseDto>> => {
    const res = await api.get<Page<PossibleReviewResponseDto>>(`/api/reviews/mypage?page=${page}`);
    return res.data;
}

// 리뷰 수정
export const updateReview = async (reviewId: number, data: ReviewUpdateRequestDto): Promise<ReviewUpdateResponseDto> => {
    const res = await api.patch<ReviewUpdateResponseDto>(`/api/reviews/${reviewId}`, data);
    return res.data;
}

// 리뷰 삭제
export const deleteReview = async (reviewId: number): Promise<ReviewDeleteResponseDto> => {
    const res = await api.delete<ReviewDeleteResponseDto>(`/api/reviews/${reviewId}`);
    return res.data;
}