import React, { useState, useEffect ,useMemo} from "react";
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar,
    AreaChart,
    Area,
    ComposedChart,
    Cell
} from 'recharts';
import type {HourlyDetailDataDto,
    HourlyStatsSummaryDto,
    PeakHourDto,
    PeakHoursSummaryDto,
    PatternAnalysisDto,
    HourlyAnalysisResponseDto,
    HourlyChartData,
    DayOfWeekSummaryDto,
    MonthlyTimePeriodDto
} from "../../services/types/hourlyStatsType";
import { HourlyStatisticsService } from "../../services/hourlyStatisticsService";
import { toast } from "react-toastify";
import dayjs from 'dayjs';
import { dashboardAPI } from "../../services/dashboard";
import type { EventDetailResponseDto } from "../../services/types/eventType";

// 시간대별 분석 페이지
export const TimeAnalysis: React.FC = () => {

    const [weeklyData, setWeeklyData] = useState<DayOfWeekSummaryDto[]>([]);
    const [hourlyStats, setHourlyStats] = useState<HourlyAnalysisResponseDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [monthlyData, setMonthlyData] = useState<MonthlyTimePeriodDto[]>([]);


    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

     useEffect(() => {
                const loadDashboardData = async () => {
                    try {
                        setLoading(true);

                        console.log('사용자 이벤트 목록 조회 시작...');

                        // 사용자 담당 이벤트와 상세 정보 조회
                        const myEvent = await dashboardAPI.getMyEventWithDetails();
                        console.log('조회된 담당 이벤트:', myEvent);

                        if (myEvent) {

                            console.log('담당 이벤트 설정 완료:', myEvent);

                            // 선택된 이벤트의 통계 데이터 로드
                            console.log('통계 데이터 로드 시작...', {
                                eventId: myEvent.eventId,
                                startDate,
                                endDate
                            });


                             try {
                                const weekData = await HourlyStatisticsService.getDayOfWeekStatsSummary(myEvent.eventId,startDate,endDate);
                                setWeeklyData(weekData);
                                console.log("요일별 데이터 : ", weekData);
                            } catch (err) {
                                setHasError(err instanceof Error ? err.message : '요일 별 데이터 로드 중 오류가 발생했습니다.');
                               }


                              try {
                                 const monthData = await HourlyStatisticsService.getLast12MonthsTimePeriodSummary(myEvent.eventId);
                                 console.log("✅ getLast12MonthsTimePeriodSummary 결과:", monthData);
                                 setMonthlyData(monthData);
                                 console.log("월별 데이터:", monthData);
                               } catch (err) {
                                 console.error("❌ 월별 데이터 불러오기 실패:", err);
                               }

                            try {
                                 const hourlyData = await HourlyStatisticsService.getHourlyStatistics(myEvent.eventId, startDate, endDate);
                                 console.log('시간대별 통계 데이터:', hourlyData);
                                 setHourlyStats(hourlyData);
                            } catch (salesError: any) {
                                 console.error('시간대별 조회 실패:', salesError);
                                 toast.error('시간대별를 불러올 수 없습니다.');
                                                        }

                        } else {
                            console.log('등록된 이벤트가 없습니다.');
                            toast.info('등록된 이벤트가 없습니다.');
                        }
                    } catch (error: any) {
                        console.error('대시보드 데이터 로드 실패:', error);
                        console.error('오류 상세:', error.response?.data || error.message);
                        setHasError(true); // Set error state

                        // 401 오류인 경우 로그인 페이지로 리다이렉트
                        if (error.response?.status === 401) {
                            toast.error('로그인이 필요합니다.');
                            // window.location.href = '/login'; // 필요시 주석 해제
                        } else {
                            toast.error(`대시보드 데이터를 불러오는데 실패했습니다: ${error.response?.data?.message || error.message}`);
                        }
                    } finally {
                        setLoading(false);
                    }
                };

                loadDashboardData();
            }, []);

    const transformHourlyData = (hourlyStats: HourlyAnalysisResponseDto | null): HourlyChartData[] => {
      if (!hourlyStats || !hourlyStats.hourlyDetails) {
        return [];
      }

      return hourlyStats.hourlyDetails.map(detail => ({
        hour: formatHour(detail.hour),
        bookings: detail.reservations,
        revenue: detail.revenue || 0 // null인 경우 0으로 처리
      }));
    };

    // 시간 포맷팅 함수 (0 -> "00:00", 13 -> "13:00")
    const formatHour = (hour: number): string => {
      return `${hour.toString().padStart(2, '0')}:00`;
    };

     // 변환된 데이터
       const hourlyData = useMemo(() => {
         return transformHourlyData(hourlyStats);
       }, [hourlyStats]);

   console.log('홀리 데이터.',hourlyData);




    const {
      totalReservations = 0,
      totalRevenue = 0,
      averageHourlyReservations = 0,
      mostActiveHour = 0
    } = hourlyStats?.summary || {};

    // 통계 카드 컴포넌트
    const StatCard: React.FC<{ title: string; value: string; unit?: string; trend?: string; isPositive?: boolean; color?: string }> = ({ 
        title, 
        value, 
        unit, 
        trend, 
        isPositive,
        color = "text-gray-900"
    }) => (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-2">{title}</div>
            <div className="flex items-baseline mb-2">
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                {unit && <span className={`text-lg font-semibold ${color} ml-1`}>{unit}</span>}
            </div>
            {trend && (
                <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '↗' : '↘'} {trend}
                </div>
            )}
        </div>
    );

    // 금액 포맷팅 함수
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ko-KR').format(amount);
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    시간대별 평균 분석
                </div>

                {/* 사이드바 */}
                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20">
                    {/* 통계 카드 섹션 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard title="총 예매 건수 " value={totalReservations} unit="건" color="text-red-600" />
                        <StatCard title="총 매출액" value={formatCurrency(totalRevenue)} unit="원" trend="" isPositive={true} color="text-green-600" />
                        <StatCard title="평균 시간당 예매 " value={averageHourlyReservations.toFixed(2)} unit="건" trend="" isPositive={true} color="text-blue-600" />
                        <StatCard title="가장 활발한 시간대 " value={mostActiveHour} unit="시" trend="" isPositive={true} color="text-purple-600" />
                    </div>

                    {/* 첫 번째 행: 시간대별 예매 현황 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">최근 한달 24시간 평균 예매 현황</h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={hourlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis 
                                        dataKey="hour" 
                                        stroke="#6b7280" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false}
                                        interval={2}
                                    />
                                    <YAxis 
                                        yAxisId="left"
                                        stroke="#6b7280" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false}
                                        label={{ value: '예매 건수', angle: -90, position: 'insideLeft' }}
                                    />
                                    <YAxis 
                                        yAxisId="right"
                                        orientation="right"
                                        stroke="#6b7280" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false}
                                        tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                                        label={{ value: '매출 (원)', angle: 90, position: 'insideRight' }}
                                    />
                                    <Tooltip 
                                        formatter={(value, name) => [
                                            name === 'bookings' ? `${value}건` : `${formatCurrency(value as number)}원`,
                                            name === 'bookings' ? '예매 건수' : '매출'
                                        ]}
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                    <Bar yAxisId="left" dataKey="bookings" fill="#3B82F6" radius={[2, 2, 0, 0]} opacity={0.7} />
                                    <Line 
                                        yAxisId="right"
                                        type="monotone" 
                                        dataKey="revenue" 
                                        stroke="#EF4444" 
                                        strokeWidth={3}
                                        dot={{ fill: '#EF4444', strokeWidth: 2, r: 3 }}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 두 번째 행: 요일별 분석 + 월별 패턴 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* 요일별 분석 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">요일별 분석</h2>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={weeklyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis 
                                            dataKey="day" 
                                            stroke="#6b7280" 
                                            fontSize={12} 
                                            tickLine={false} 
                                            axisLine={false} 
                                        />
                                        <YAxis 
                                            stroke="#6b7280" 
                                            fontSize={12} 
                                            tickLine={false} 
                                            axisLine={false}
                                            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                                        />
                                        <Tooltip 
                                            formatter={(value, name) => [
                                                name === 'bookings' ? `${value}건` : `${formatCurrency(value as number)}원`,
                                                name === 'bookings' ? '예매 건수' : '매출'
                                            ]}
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                        <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 text-sm text-gray-600">
                                <p className="font-medium mb-2">📊 요일별 특징:</p>
                                <ul className="space-y-1">
                                    <li>• 금요일: 가장 높은 예매율 (456건)</li>
                                    <li>• 토요일: 최고 매출 (22.7M원)</li>
                                    <li>• 월요일: 가장 낮은 예매율 (234건)</li>
                                </ul>
                            </div>
                        </div>

                        {/* 월별 시간대 패턴 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">월별 시간대 패턴</h2>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis 
                                            dataKey="month" 
                                            stroke="#6b7280" 
                                            fontSize={12} 
                                            tickLine={false} 
                                            axisLine={false} 
                                        />
                                        <YAxis 
                                            stroke="#6b7280" 
                                            fontSize={12} 
                                            tickLine={false} 
                                            axisLine={false}
                                            domain={[0, 100]}
                                            ticks={[0, 25, 50, 75, 100]}
                                        />
                                        <Tooltip 
                                            formatter={(value) => [`${value}%`, '비율']}
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="morning" 
                                            stackId="1"
                                            stroke="#3B82F6" 
                                            fill="#3B82F6" 
                                            fillOpacity={0.6}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="afternoon" 
                                            stackId="1"
                                            stroke="#10B981" 
                                            fill="#10B981" 
                                            fillOpacity={0.6}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="evening" 
                                            stackId="1"
                                            stroke="#F59E0B" 
                                            fill="#F59E0B" 
                                            fillOpacity={0.6}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <span>오전 (06:00-12:00)</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        <span>오후 (12:00-18:00)</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                        <span>저녁 (18:00-24:00)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 세 번째 행: 시간대별 인사이트 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">시간대별 상세 분석 🎯 : {hourlyStats?.patternAnalysis?.insights}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* 새벽 시간대 */}
                             <div className="bg-green-50 rounded-lg p-4">
                                <h3 className="font-semibold text-blue-900 mb-3"> {hourlyStats?.patternAnalysis?.nightPattern || '🌃 새벽 시간대 (12:00-18:00)'}</h3>
                                <div className="space-y-2 text-sm text-blue-800">

                                     <p><span className="font-medium">특징:</span> 점심시간 후, 업무 마무리</p>
                                     <p><span className="font-medium">전략:</span> 할인 혜택, 푸시 알림</p>
                                </div>
                             </div>


                            {/* 오전 시간대 */}
                            <div className="bg-blue-50 rounded-lg p-4">
                                <h3 className="font-semibold text-green-900 mb-3">{hourlyStats?.patternAnalysis?.morningPattern ||'🌅 오전 시간대 (06:00-12:00)'}</h3>
                                <div className="space-y-2 text-sm text-green-800">

                                    <p><span className="font-medium">특징:</span> 출근 시간대와 연관</p>
                                    <p><span className="font-medium">전략:</span> 모바일 최적화, 빠른 예매 프로세스</p>
                                </div>
                            </div>

                            {/* 오후 시간대 */}
                            <div className="bg-green-50 rounded-lg p-4">
                                <h3 className="font-semibold text-red-900 mb-3">{hourlyStats?.patternAnalysis?.afternoonPattern || '☀️ 오후 시간대 (12:00-18:00)'}</h3>
                                <div className="space-y-2 text-sm text-red-800">

                                    <p><span className="font-medium">특징:</span> 점심시간 후, 업무 마무리</p>
                                    <p><span className="font-medium">전략:</span> 할인 혜택, 푸시 알림</p>
                                </div>
                            </div>

                            {/* 저녁 시간대 */}
                            <div className="bg-orange-50 rounded-lg p-4">
                                <h3 className="font-semibold text-orange-900 mb-3">{hourlyStats?.patternAnalysis?.eveningPattern || '🌙 저녁 시간대 (18:00-24:00)'}</h3>
                                <div className="space-y-2 text-sm text-orange-800">

                                    <p><span className="font-medium">특징:</span> 퇴근 후, 여가 시간</p>
                                    <p><span className="font-medium">전략:</span> 소셜미디어 마케팅, 추천 시스템</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 분석 인사이트
                    <div className="bg-purple-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-purple-900 mb-4">⏰ 시간대별 분석 인사이트</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
                            <div>
                                <p className="font-medium mb-2">🎯 주요 발견사항:</p>
                                <ul className="space-y-1">
                                    <li>• 오후 3시가 가장 활발한 예매 시간대</li>
                                    <li>• 금요일과 토요일이 주말 예매의 핵심</li>
                                    <li>• 계절에 따른 시간대별 패턴 변화</li>
                                </ul>
                            </div>
                            <div>
                                <p className="font-medium mb-2">💡 마케팅 전략:</p>
                                <ul className="space-y-1">
                                    <li>• 피크 시간대 집중 마케팅</li>
                                    <li>• 시간대별 맞춤 혜택 제공</li>
                                    <li>• 요일별 차별화된 프로모션</li>
                                </ul>
                            </div>
                        </div>
                    </div>*/}
                </div>
            </div>
        </div>
    );
};
