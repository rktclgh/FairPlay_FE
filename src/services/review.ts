import api from "../api/axios";
import type {
    ReviewSaveRequestDto,
    ReviewSaveResponseDto,
    ReviewResponseDto,
    ReviewUpdateRequestDto,
    ReviewUpdateResponseDto,
    ReviewDeleteResponseDto,
    PageableRequest,
    Page
} from "./types/reviewType";

// 리뷰 저장 
export const saveReview = async (data: ReviewSaveRequestDto): Promise<ReviewSaveResponseDto> => {
    const res = await api.post<ReviewSaveResponseDto>(`/api/reviews`,data);
    return res.data;
}

// 리뷰 조회 - 행사 상세 페이지
export const getReviewsByEvent = async (eventId: number, params?: PageableRequest): Promise<Page<ReviewResponseDto>> => {
    const res = await api.get<Page<ReviewResponseDto>>(`/api/reviews/${eventId}`, {params});
    return res.data;
}

// 리뷰 조회 - 마이페이지
export const getReviewsByMember = async (params?: PageableRequest): Promise<Page<ReviewResponseDto>> => {
    const res = await api.get<Page<ReviewResponseDto>>(`/api/reviews`, {params});
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