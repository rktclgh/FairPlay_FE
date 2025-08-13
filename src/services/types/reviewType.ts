// 리뷰 저장 요청 
export interface ReviewSaveRequestDto{
    reservationId: number,
    star: number,
    visible: boolean,
    comment: string
}

// 리뷰 저장 응답
export interface ReviewSaveResponseDto{
    reservationId: number,
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

export interface ReviewWithOwnerDto {
  review: ReviewDto;
  owner: boolean;
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
    event: EventDto,
    review: ReviewDto,
    owner: boolean
}

interface EventDto{
    title: string,
    buildingName: string,
    address: string,
    viewingScheduleInfo: ViewingScheduleInfo,
    eventScheduleInfo: EventScheduleInfo
}

interface ReviewDto{
    reviewId: number,
    star: number,
    reactions: number,
    comment: string,
    visible: boolean,
    createdAt: string
}

interface ViewingScheduleInfo{
    date: string, 
    dayOfWeek: string, 
    startTime: string; 
}

interface EventScheduleInfo{
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