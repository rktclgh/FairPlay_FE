// 시간별 상세 데이터 인터페이스
export interface HourlyDetailDataDto {
  hour: number;
  timeRange: string;
  reservations: number;
  revenue: number;
  percentage: number;
  trend: string;
  description: string;
}

export interface HourlyChartData {
  hour: string;
  bookings: number;
  revenue: number;
}

// 시간별 통계 요약 인터페이스
export interface HourlyStatsSummaryDto {
  totalReservations: number;
  totalRevenue: number;
  averageHourlyReservations: number;
  mostActiveHour: number;
  mostActiveHourDescription: string;
}
// 요일별 통계
export interface DayOfWeekSummaryDto {
   day: string;
   bookings: number;
   revenue: number;
   percentage: number;
}

// 월별 통계
export interface MonthlyTimePeriodDto {
   month: string;
   morning: number;
   afternoon: number;
   evening: number;
}

// 피크 시간 인터페이스
export interface PeakHourDto {
  hour: number;
  reservations: number;
  revenue: number;
  percentage: number;
}

// 피크 시간 요약 인터페이스
export interface PeakHoursSummaryDto {
  topHours: PeakHourDto[];
  peakPeriod: string;
  peakHourPercentage: number;
}

// 패턴 분석 인터페이스
export interface PatternAnalysisDto {
  morningPattern: string;    // 오전 패턴 (6-12시)
  afternoonPattern: string;  // 오후 패턴 (12-18시)
  eveningPattern: string;    // 저녁 패턴 (18-24시)
  nightPattern: string;      // 새벽 패턴 (0-6시)
  overallTrend: string;
  insights: string[];
}

// 시간별 분석 응답 인터페이스 (메인)
export interface HourlyAnalysisResponseDto {
  summary: HourlyStatsSummaryDto;
  peakHours: PeakHoursSummaryDto;
  hourlyDetails: HourlyDetailDataDto[];
  patternAnalysis: PatternAnalysisDto;
}