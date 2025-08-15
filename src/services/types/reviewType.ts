// 리뷰 저장 요청 
export interface ReviewSaveRequestDto{
    reservationId: number,
    star: number,
    visible: boolean,
    comment: string
}

// 리뷰 저장 응답
export interface ReviewSaveResponseDto{
    reviewId: number,
    nickname: string,
    star: number,
    visible: boolean,
    comment: string,
    createdAt: Date
}

// 행사 상세페이지 리뷰 조회
export interface ReviewForEventResponseDto{
    eventId: number,
    reviews: Page<ReviewWithOwnerDto> | null
}

// 리뷰 + 로그인사용자=작성자 일치여부
export interface ReviewWithOwnerDto {
    review: ReviewDto;
    owner: boolean;
    liked: boolean
}

// 마이페이지 리뷰 가능한 행사 목록 조회
export interface PossibleReviewResponseDto {
    reservationId: number,
    event: EventDto,
    ticketContent: string,
    hasReview: boolean
}

// 마이페이지 리뷰 조회
export interface ReviewResponseDto{
    event: EventDto,
    review: ReviewDto,
    owner: boolean
}

// 리뷰 업데이트 요청
export interface ReviewUpdateRequestDto{
    star: number,
    comment: string,
    visible: boolean
}

// 리뷰 업데이트 응답
export interface ReviewUpdateResponseDto{
    reviewId: number,
    star: number,
    comment: string,
    visible: boolean
}

// 리뷰 삭제
export interface ReviewDeleteResponseDto{
    reviewId: number,
    message: string
}

export interface ReviewResponseDto{
    reservationId: number,
    event: EventDto,
    review: ReviewDto,
    owner: boolean
}


// 이벤트 정보
export interface EventDto{
    title: string, // 행사 제목
    buildingName: string, // 행사 장소
    address: string, // 행사 주소
    thumbnail: string, // 썸네일 URL 
    viewingScheduleInfo: ViewingScheduleInfo, // 관람 스케줄
    eventScheduleInfo: EventScheduleInfo // 이벤트 시작, 끝 날짜
}

// 리뷰 
export interface ReviewDto{
    reviewId: number,
    userId: number | null,
    nickname: string,
    star: number,
    reactions: number,
    comment: string,
    visible: boolean,
    createdAt: string
}

// 관람 정보
export interface ViewingScheduleInfo{
    date: string, 
    dayOfWeek: string, 
    startTime: string; 
}

// 리뷰 좋아요 요청
export interface ReactionRequestDto{
    reviewId: number
}

// 리뷰 좋아요 응답
export interface ReactionResponseDto{
    reviewId: number,
    count: number
}

// 행사 스케줄 정보
export interface EventScheduleInfo{
    startDate: string,
    endDate: string
}

/* 페이징 관련 타입 */
export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    unsorted: boolean;
    sorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

export interface PageableRequest{
    page: number,
    size: number,
    sort: string
}