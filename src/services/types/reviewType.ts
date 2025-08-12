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

export interface PageOfReviews {
  page: number;
  totalPages: number;
  totalElements: number;
  reviews: ReviewResponseDto[];
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

interface ViewingScheduleInfo{
    date: string, 
    dayOfWeek: string, 
    startTime: string; 
}

interface EventScheduleInfo{
    startDate: string,
    endDate: string
}

interface ReviewDto{
    reviewId: number,
    star: number,
    reactions: number,
    comment: string,
    visible: boolean,
    createdAt: Date
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

export interface PageableRequest {
  page?: number;        // 페이지 번호 (0부터 시작하는 경우가 많음)
  size?: number;        // 한 페이지당 데이터 개수
  sort?: string;        // 정렬 기준, 예: 'createdAt,desc'
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // 현재 페이지 (0부터 시작)
  sort?: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  empty?: boolean;
}