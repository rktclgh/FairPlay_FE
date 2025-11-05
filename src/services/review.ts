import api from "../api/axios";
import type {
  ReviewSaveRequestDto,
  ReviewSaveResponseDto,
  ReviewForEventResponseDto,
  ReviewResponseDto,
  ReviewUpdateRequestDto,
  ReviewUpdateResponseDto,
  ReviewDeleteResponseDto,
  PossibleReviewResponseDto,
  ReactionRequestDto,
  ReactionResponseDto,
  Page,
  PageableRequest,
} from "./types/reviewType";

// 리뷰 저장 - HTTP-only 쿠키 기반 인증
export const saveReview = async (
  data: ReviewSaveRequestDto
): Promise<ReviewSaveResponseDto> => {
  console.log("🔍 saveReview 호출됨 (HTTP-only 쿠키 인증):", data);

  try {
    // HTTP-only 쿠키로 인증 - withCredentials로 자동 전송, axios interceptor가 401 처리
    const res = await api.post<ReviewSaveResponseDto>(`/api/reviews`, data);
    console.log("✅ saveReview 성공:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ saveReview 에러 발생:", error);
    console.error("❌ 에러 타입:", typeof error);
    console.error("❌ 에러 객체:", error);

    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { status?: number; data?: unknown; headers?: unknown };
      };
      console.error("❌ HTTP 상태:", axiosError.response?.status);
      console.error("❌ 응답 데이터:", axiosError.response?.data);
      console.error("❌ 응답 헤더:", axiosError.response?.headers);
    }

    throw error;
  }
};

// 리뷰 조회 - 행사 상세 페이지
export const getReviewsByEvent = async (
  eventId: number,
  params?: PageableRequest
): Promise<ReviewForEventResponseDto> => {
  const res = await api.get<ReviewForEventResponseDto>(
    `/api/reviews/${eventId}`,
    { params }
  );
  return res.data;
};

// 리뷰 조회 - 마이페이지
export const getReviewsByMember = async (
  page: number
): Promise<Page<ReviewResponseDto>> => {
  const res = await api.get<Page<ReviewResponseDto>>(
    `/api/reviews?page=${page}`
  );
  return res.data;
};

// 작성 가능한 행사 목록 조회 - 마이페이지
export const getPossibleSaveReview = async (
  page: number
): Promise<Page<PossibleReviewResponseDto>> => {
  const res = await api.get<Page<PossibleReviewResponseDto>>(
    `/api/reviews/mypage?page=${page}`
  );
  return res.data;
};

// 리뷰 수정
export const updateReview = async (
  reviewId: number,
  data: ReviewUpdateRequestDto
): Promise<ReviewUpdateResponseDto> => {
  const res = await api.patch<ReviewUpdateResponseDto>(
    `/api/reviews/${reviewId}`,
    data
  );
  return res.data;
};

// 리뷰 삭제
export const deleteReview = async (
  reviewId: number
): Promise<ReviewDeleteResponseDto> => {
  const res = await api.delete<ReviewDeleteResponseDto>(
    `/api/reviews/${reviewId}`
  );
  return res.data;
};

// 리뷰 리액션 업데이트
export const updateReaction = async (
  data: ReactionRequestDto
): Promise<ReactionResponseDto> => {
  const res = await api.post<ReactionResponseDto>(
    `/api/review-reactions`,
    data
  );
  return res.data;
};
