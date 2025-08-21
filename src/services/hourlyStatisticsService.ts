// src/services/hourlyStatisticsService.ts
import api from '../api/axios';
import { HourlyAnalysisResponseDto, DayOfWeekSummaryDto, MonthlyTimePeriodDto } from './types/hourlyStatsType';

export class HourlyStatisticsService {

  /**
   * 시간별 통계 조회 (기간별)
   * @param eventId 이벤트 ID
   * @param startDate 시작 날짜 (YYYY-MM-DD)
   * @param endDate 종료 날짜 (YYYY-MM-DD)
   */
  static async getHourlyStatistics(
    eventId: number,
    startDate: string,
    endDate: string
  ): Promise<HourlyAnalysisResponseDto> {
    try {
      const response = await api.get(`/api/stats/hourly/${eventId}`, {
        params: {
          start: startDate,
          end: endDate
        }
      });
      return response.data;
    } catch (error) {
      console.error('시간별 통계 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 월별 시간대 통계 조회
   * @param eventId 이벤트 ID
   * @param startDate 시작 날짜 (YYYY-MM-DD)
   * @param endDate 종료 날짜 (YYYY-MM-DD)
   */
  static async getMonthlyTimePeriodSummary(
    eventId: number,
    startDate: string,
    endDate: string
  ): Promise<MonthlyTimePeriodDto[]> {
    try {
      const response = await api.get(`/api/stats/monthly/${eventId}/time-period`, {
        params: {
          start: startDate,
          end: endDate
        }
      });
      return response.data;
    } catch (error) {
      console.error('월별 시간대 통계 조회 실패:', error);
      return [];
    }
  }

  /**
   * 시간별 통계 조회 (단일 날짜)
   * @param eventId 이벤트 ID
   * @param date 조회 날짜 (YYYY-MM-DD)
   */
  static async getHourlyStatisticsByDate(
    eventId: number,
    date: string
  ): Promise<HourlyAnalysisResponseDto> {
    try {
      const response = await api.get(`/api/stats/hourly/${eventId}/date`, {
        params: {
          date: date
        }
      });
      return response.data;
    } catch (error) {
      console.error('단일 날짜 시간별 통계 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 오늘 시간별 통계 조회
   * @param eventId 이벤트 ID
   */
  static async getTodayHourlyStatistics(
    eventId: number
  ): Promise<HourlyAnalysisResponseDto> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
    return this.getHourlyStatisticsByDate(eventId, today);
  }

  /**
   * 이번 주 시간별 통계 조회
   * @param eventId 이벤트 ID
   */
  static async getThisWeekHourlyStatistics(
    eventId: number
  ): Promise<HourlyAnalysisResponseDto> {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // 일요일

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // 토요일

    const startDate = startOfWeek.toISOString().split('T')[0];
    const endDate = endOfWeek.toISOString().split('T')[0];

    return this.getHourlyStatistics(eventId, startDate, endDate);
  }

  /**
   * 요일별 통계 조회
   * @param eventId 이벤트 ID
   * @param startDate 시작 날짜 (YYYY-MM-DD)
   * @param endDate 종료 날짜 (YYYY-MM-DD)
   */
  static async getDayOfWeekSummary(
    eventId: number,
    startDate: string,
    endDate: string
  ): Promise<DayOfWeekSummaryDto[]> {
    try {
      const response = await api.get(
        `/api/stats/daily/${eventId}/day-of-week`,
        {
          params: {
            start: startDate,
            end: endDate, // 마지막 요소 뒤에도 쉼표 OK
          },
        } // <- 여기서 객체와 함수 괄호가 제대로 닫혔는지
      );
      return response.data;
    } catch (error) {
      console.error('요일별 통계 조회 실패:', error);
      throw error;
    }
  }

static async getDayOfWeekStatsSummary(
    eventId: number,
    startDate: string,
    endDate: string
  ): Promise<DayOfWeekSummaryDto[]> {
    try {
      const response = await api.get(`/api/stats/daily/${eventId}/day-of-week`, {
        params: {
          start: startDate,
          end: endDate
        }
      });
      return response.data;
    } catch (error) {
      console.error('요일별 통계 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 이번 주 요일별 통계 조회
   * @param eventId 이벤트 ID
   */
  static async getThisWeekDayOfWeekSummary(
    eventId: number
  ): Promise<DayOfWeekSummaryDto[]> {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // 일요일

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // 토요일

    const startDate = startOfWeek.toISOString().split('T')[0];
    const endDate = endOfWeek.toISOString().split('T')[0];

    return this.getDayOfWeekSummary(eventId, startDate, endDate);
  }

  /**
   * 이번 년도 월별 시간대 통계 조회
   * @param eventId 이벤트 ID
   */
  static async getThisYearMonthlyTimePeriodSummary(
    eventId: number
  ): Promise<MonthlyTimePeriodDto[]> {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const endOfYear = new Date(today.getFullYear(), 11, 31);

    const startDate = startOfYear.toISOString().split('T')[0];
    const endDate = endOfYear.toISOString().split('T')[0];

    return this.getMonthlyTimePeriodSummary(eventId, startDate, endDate);
  }

  /**
   * 지난 12개월 월별 시간대 통계 조회
   * @param eventId 이벤트 ID
   */
  static async getLast12MonthsTimePeriodSummary(
    eventId: number
  ): Promise<MonthlyTimePeriodDto[]> {
    const today = new Date();
    const twelveMonthsAgo = new Date(today);
    twelveMonthsAgo.setMonth(today.getMonth() - 12);

    const startDate = twelveMonthsAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    return this.getMonthlyTimePeriodSummary(eventId, startDate, endDate);
  }

  /**
   * 커스텀 기간 월별 시간대 통계 조회 (Date 객체로)
   * @param eventId 이벤트 ID
   * @param startDate 시작 날짜 Date 객체
   * @param endDate 종료 날짜 Date 객체
   */
  static async getMonthlyTimePeriodSummaryByDateRange(
    eventId: number,
    startDate: Date,
    endDate: Date
  ): Promise<MonthlyTimePeriodDto[]> {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    return this.getMonthlyTimePeriodSummary(eventId, start, end);
  }

  /**
   * 이번 달 시간별 통계 조회
   * @param eventId 이벤트 ID
   */
  static async getThisMonthHourlyStatistics(
    eventId: number
  ): Promise<HourlyAnalysisResponseDto> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const startDate = startOfMonth.toISOString().split('T')[0];
    const endDate = endOfMonth.toISOString().split('T')[0];

    return this.getHourlyStatistics(eventId, startDate, endDate);
  }

  /**
   * 이번 달 요일별 통계 조회
   * @param eventId 이벤트 ID
   */
  static async getThisMonthDayOfWeekSummary(
    eventId: number
  ): Promise<DayOfWeekSummaryDto[]> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const startDate = startOfMonth.toISOString().split('T')[0];
    const endDate = endOfMonth.toISOString().split('T')[0];

    return this.getDayOfWeekSummary(eventId, startDate, endDate);
  }

  /**
   * 커스텀 기간 시간별 통계 조회 (Date 객체로)
   * @param eventId 이벤트 ID
   * @param startDate 시작 날짜 Date 객체
   * @param endDate 종료 날짜 Date 객체
   */
  static async getHourlyStatisticsByDateRange(
    eventId: number,
    startDate: Date,
    endDate: Date
  ): Promise<HourlyAnalysisResponseDto> {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    return this.getHourlyStatistics(eventId, start, end);
  }

  /**
   * 커스텀 기간 요일별 통계 조회 (Date 객체로)
   * @param eventId 이벤트 ID
   * @param startDate 시작 날짜 Date 객체
   * @param endDate 종료 날짜 Date 객체
   */
  static async getDayOfWeekSummaryByDateRange(
    eventId: number,
    startDate: Date,
    endDate: Date
  ): Promise<DayOfWeekSummaryDto[]> {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    return this.getDayOfWeekSummary(eventId, start, end);
  }

  /**
   * 지난 7일간 요일별 통계 조회
   * @param eventId 이벤트 ID
   */
  static async getLast7DaysDayOfWeekSummary(
    eventId: number
  ): Promise<DayOfWeekSummaryDto[]> {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const startDate = sevenDaysAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    return this.getDayOfWeekSummary(eventId, startDate, endDate);
  }

  /**
   * 지난 30일간 요일별 통계 조회
   * @param eventId 이벤트 ID
   */
  static async getLast30DaysDayOfWeekSummary(
    eventId: number
  ): Promise<DayOfWeekSummaryDto[]> {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const startDate = thirtyDaysAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    return this.getDayOfWeekSummary(eventId, startDate, endDate);
  }
}

export default HourlyStatisticsService;