import type { Fetcher } from "react-router-dom";
import api from "../api/axios";
import type { get } from "http";

export interface PopularTop5Item {
  eventTitle: string;
  count: number;
}
export interface PageableResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface EventCompareDto{
  eventName : string;
  status : number;
  userCount : number;
  reservationCount : number;
  totalRevenue : number;
  averageTicketPrice : number;
  cancelRate : number;
  startDate : string;
  endDate : string;
  modifyDate : string;
}

export interface Top3EventCompareDto {
  top3Events: EventCompareDto[];
  userCount: number;
  reservationCount: number;
  totalRevenue: number;
}

export interface TotalSalesStatistics {
  totalRevenue: number;
  totalPayments: number;
}

export interface DailySalesDto{
  date : string;
  reservationAmount : number;
  boothAmount : number;
  adAmount : number;
  boothApplication : number;
  bannerApplication : number;
  totalAmount : number;
  totalCount : number;
  // 백엔드에서 다른 필드명을 사용할 수 있는 경우를 위한 optional 필드들
  booth_amount? : number;
  ad_amount? : number;
  advertisement_amount? : number;
  booth_application_amount? : number;
  banner_amount? : number;
}

export interface AllSalesDto{
  eventName :string;
  startDate : string;
  endDate : string;
  totalAmount : number;
  totalFee : number;
  totalRevenue : number;
}

export interface ReservationStatisticsDto{
  totalQuantity : number;
  canceledCount : number;
  totalAmount : number;
  averagePrice : number;
}
export interface ReservationWeeklyStatisticsDto {
  date : string;
  totalQuantity : number;
}
export interface ReservationCategoryStatisticsDto {
  category : string;
  totalQuantity : number;
}

export interface ReservationEventStatisticsDto{
  eventName : string;
  category : string;
  reservationCount : number;
  totalAmount : number;
}

export interface PopularEventStatisticsDto{
  averageViewCount : number;
  averageReservationCount : number;
  averageWishlistCount : number;
}

export interface EventCategoryStatisticsDto{
  categoryName: string;
  totalViewCount: number;
  totalEventCount: number;
  totalWishlistCount: number;
}
export interface Top5EventStatisticsDto{
  eventName :string;
  cnt : number;
}

export interface Top3EventCompareDto {
  top3Events: EventCompareDto[];
  userCount: number;
  reservationCount: number;
  totalRevenue: number;
}

export const adminStatisticsService = {
  // 성별별 TOP5: /api/admin/statistics/popular/gender/{gender}
  async getTop5ByMale( ): Promise<PopularTop5Item[]> {
    const res = await api.get<PopularTop5Item[]>(
      `/api/event-popularity/male`
    );
    return res.data || [];
  },

  async getTop5ByFemale( ): Promise<PopularTop5Item[]> {
    const res = await api.get<PopularTop5Item[]>(
      `/api/event-popularity/female`
    );
    return res.data || [];
  },

  // 세대별 TOP5: /api/admin/statistics/popular/age/{ageGroup} (예: 10, 20, 30 ...)
  async getTop5ByAge(ageGroup: number): Promise<PopularTop5Item[]> {
    const res = await api.get<PopularTop5Item[]>(
      `/api/event-popularity/age/${ageGroup}`
    );
    return res.data || [];
  },
  async getEventComparison(
    page: number = 0,
    size: number = 5,
    status?: number,
    sort?: string
  ): Promise<PageableResponse<EventCompareDto>>{
    const params: Record<string, string | number> = {
      page,
      size
    };
    
    if (status !== undefined) {
      params.status = status;
    }
    
    if (sort) {
      params.sort = sort;
    }

    const res = await api.get<PageableResponse<EventCompareDto>>(
      `/api/event-compare/list`,
      { params }
    );
    return res.data || {
      content: [],
      totalElements: 0,
      totalPages: 0,
      pageable: {
        pageNumber: 0,
        pageSize: 10,
        sort: { empty: true, sorted: false, unsorted: true },
        offset: 0,
        unpaged: false,
        paged: true
      },
      last: true,
      size: 10,
      number: 0,
      sort: { empty: true, sorted: false, unsorted: true },
      first: true,
      numberOfElements: 0,
      empty: true
    };
  },

async getEventCompare(): Promise<DailySalesDto> {
    const res = await api.get<DailySalesDto>(
      `api/sales-statistics/compare`
    );
    return res.data || {
      date: "",
      reservationAmount: 0,
      boothAmount: 0,
      adAmount: 0,
      etcAmount: 0,
      totalAmount: 0,
      totalCount: 0
    };
  },

  async getTotalSalesStatistics(): Promise<TotalSalesStatistics> {
    const res = await api.get<TotalSalesStatistics>(
      `/api/sales-statistics/total`
    );
    return res.data || { totalRevenue: 0, totalPayments: 0, averageSales: 0 };
  },
  async getDailySales(startDate?: string | null, endDate?: string | null): Promise<DailySalesDto[]> {
    let url = `/api/sales-statistics/daily-sales`;
    const params: string[] = [];
    
    if (startDate) {
      params.push(`startDate=${startDate}`);
    }
    if (endDate) {
      params.push(`endDate=${endDate}`);
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    const res = await api.get<DailySalesDto[]>(url);
    return res.data || [];
  },

  async getAllSales(
    page: number = 0,
    size: number = 5,
    sort?: string
  ): Promise<PageableResponse<AllSalesDto>> {
    const params: Record<string, string | number> = {
      page,
      size
    };
    
    if (sort) {
      params.sort = sort;
    }

    const res = await api.get<PageableResponse<AllSalesDto>>(
      `/api/sales-statistics/all-sales`,
      { params }
    );
    return res.data || { content: [], totalElements: 0, totalPages: 0, pageable: { pageNumber: 0, pageSize: 10, sort: { empty: true, sorted: false, unsorted: true }, offset: 0, unpaged: false, paged: true }, last: true, size: 10, number: 0, sort: { empty: true, sorted: false, unsorted: true }, first: true, numberOfElements: 0, empty: true };
  },

  // 일별 매출 데이터 Excel 내보내기
  async exportSettlements(
    startDate?: string,
    endDate?: string
  ): Promise<Blob> {
    const params: Record<string, string> = {};
    
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const res = await api.get(`/api/sales-statistics/export/daily-sales`, {
      params,
      responseType: 'blob' // Excel 파일 다운로드를 위한 blob 타입
    });
    
    return res.data;
  },

  async getReservationStatistics():Promise<ReservationStatisticsDto> {
    const res = await api.get<ReservationStatisticsDto>(
      `/api/reservation-statistics/get-statistics`
    );
    return res.data || {
      totalQuantity: 0,
      canceledCount: 0,
      totalAmount: 0,
      averagePrice: 0
    };
  },

  async getWeeklyReservationStatistics():Promise<ReservationWeeklyStatisticsDto[]> {
    const res = await api.get<ReservationWeeklyStatisticsDto[]>(
      `/api/reservation-statistics/get-weekly-statistics`
    );
    return res.data || [{
      date: "",
      totalQuantity: 0
    }];
  },

  async getPopularCategoryEvents(
    page: number = 0,
    size: number = 5,
    sort?: string
  ): Promise<PageableResponse<EventCategoryStatisticsDto>>{
    const params: Record<string, string | number> = {
      page,
      size
    };
    
    if (sort) {
      params.sort = sort;
    }

    const res = await api.get<PageableResponse<EventCategoryStatisticsDto>>(
      `/api/popular-events/get-category-statistics`,
      { params }
    );
    return res.data || {
      content: [],
      totalElements: 0,
      totalPages: 0,
      pageable: {
        pageNumber: 0,
        pageSize: 5,
        sort: { empty: true, sorted: false, unsorted: true },
        offset: 0,
        unpaged: false,
        paged: true
      },
      last: true,
      size: 5,
      number: 0,
      sort: { empty: true, sorted: false, unsorted: true },
      first: true,
      numberOfElements: 0,
      empty: true
    };
  },

  async getPopularEvents():Promise<PopularEventStatisticsDto>{
    const res = await api.get<PopularEventStatisticsDto>(
      `/api/popular-events/get-popular-statistics`
    );
    return res.data || {
      averageViewCount: 0,
      averageReservationCount: 0,
      averageWishlistCount: 0
    };
  },

  async getTop5Events(code: number):Promise<Top5EventStatisticsDto[]>{
    const res = await api.get<Top5EventStatisticsDto[]>(
      `/api/popular-events/get-top5/${code}`
    );
    return res.data || [{
      eventName: "",
      cnt: 0

    }];
  },

  async getReservationCategoryStatistics():Promise<ReservationCategoryStatisticsDto[]> {
    const res = await api.get<ReservationCategoryStatisticsDto[]>(
      `/api/reservation-statistics/get-category-statistics`
    );
    return res.data || [{
      category: "",
      totalQuantity: 0
    }];
  },

  async getEventStatisticsPaged(
    categoryId?: number,
    page: number = 0,
    size: number = 5
  ): Promise<PageableResponse<ReservationEventStatisticsDto>> {
    const params: Record<string, string | number> = {
      page,
      size
    };
    
    if (categoryId !== undefined) {
      params.category = categoryId;
    }

    const res = await api.get<PageableResponse<ReservationEventStatisticsDto>>(
      `/api/reservation-statistics/get-event-statistics-paged`,
      { params }
    );
    return res.data || {
      content: [],
      totalElements: 0,
      totalPages: 0,
      pageable: {
        pageNumber: 0,
        pageSize: 5,
        sort: { empty: true, sorted: false, unsorted: true },
        offset: 0,
        unpaged: false,
        paged: true
      },
      last: true,
      size: 5,
      number: 0,
      sort: { empty: true, sorted: false, unsorted: true },
      first: true,
      numberOfElements: 0,
      empty: true
    };
  },

};
