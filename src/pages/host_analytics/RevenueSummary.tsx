import React, { useState, useEffect } from "react";
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
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { dashboardAPI, SalesDashboardResponse, PaymentStatusInfo,SessionSalesItem,SalesSummarySection, SalesDailyTrend,StatusBreakdownItem  } from "../../services/dashboard";
import type { EventDetailResponseDto } from "../../services/types/eventType";
import { toast } from "react-toastify";
import dayjs from 'dayjs';

// 매출 요약 페이지
export const RevenueSummary: React.FC = () => {

     const [selectedEvent, setSelectedEvent] = useState<EventDetailResponseDto | null>(null);
     const [salesStats, setSalesStats] = useState<SalesDashboardResponse | null>(null);
     const [loading, setLoading] = useState(true);
     const [hasError, setHasError] = useState(false);


    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // 데이터 로드
        useEffect(() => {
            const loadDashboardData = async () => {
                try {
                    setLoading(true);

                    console.log('사용자 이벤트 목록 조회 시작...');

                    // 사용자 담당 이벤트와 상세 정보 조회
                    const myEvent = await dashboardAPI.getMyEventWithDetails();
                    console.log('조회된 담당 이벤트:', myEvent);

                    if (myEvent) {
                        setSelectedEvent(myEvent);
                        console.log('담당 이벤트 설정 완료:', myEvent);

                        // 선택된 이벤트의 통계 데이터 로드
                        console.log('통계 데이터 로드 시작...', {
                            eventId: myEvent.eventId,
                            startDate,
                            endDate
                        });

                        try {
                            const salesData = await dashboardAPI.getSalesStatistics(myEvent.eventId, startDate, endDate);
                            console.log('매출 통계 데이터:', salesData);
                            setSalesStats(salesData);
                        } catch (salesError: any) {
                            console.error('매출 통계 조회 실패:', salesError);
                            toast.error('매출 통계를 불러올 수 없습니다.');
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

        // 이벤트 변경 시 통계 데이터 다시 로드
        useEffect(() => {
            if (selectedEvent) {
                const loadEventStats = async () => {
                    try {
                        const [salesData] = await Promise.all([

                            dashboardAPI.getSalesStatistics(selectedEvent.eventId, startDate, endDate)
                        ]);


                        setSalesStats(salesData);
                    } catch (error: any) {
                        console.error('통계 데이터 로드 실패:', error);
                        console.error('오류 상세:', error.response?.data || error.message);
                        toast.error(`통계 데이터를 불러오는데 실패했습니다: ${error.response?.data?.message || error.message}`);
                    }
                };

                loadEventStats();
            }
        }, [selectedEvent]);
    // 상단 요약 데이터
    const totalSales = salesStats?.summary?.totalSales || 0;
    const totalReservations = salesStats?.summary?.totalReservations || 0;
    const paid = salesStats?.summary?.paid?.count || 0;
    const cancellations = salesStats?.summary?.cancelled?.count || 0;
    const refunded =  salesStats?.summary?.refunded?.amount || 0;


   // 색상 코드
    const colorPalette = [
      '#3B82F6', // 파랑
      '#EF4444', // 빨강
      '#10B981', // 초록
      '#F59E0B', // 주황
      '#8B5CF6', // 보라
      '#EC4899', // 핑크
      '#6366F1', // 남색
      '#F97316', // 밝은 주황
      '#22D3EE', // 청록
      '#EAB308', // 노랑
      '#A3E635', // 연두
      '#F43F5E'  // 진한 핑크
    ];

    const getTicketRevenueData = (sessionSales: SessionSalesItem[]) => {
      // 1) 티켓별 합산
      const grouped: Record<string, number> = {};
      sessionSales.forEach(item => {
        grouped[item.ticketName] = (grouped[item.ticketName] || 0) + item.salesAmount;
      });

      // 2) 티켓별 데이터 배열로 변환하며 랜덤 색상 할당
      return Object.keys(grouped).map(name => {
          const colorIndex =
              Array.from(name).reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % colorPalette.length;
          const color = colorPalette[colorIndex];
          return {
              name,
              revenue: grouped[name],
              fill: color
          };
      });

}
    // 카테고리별 매출 데이터
   const categoryRevenueData = salesStats?.sessionSales ? getTicketRevenueData(salesStats.sessionSales) : [];

   const convertDailyToMonthly = (salesDailyTrend: SalesDailyTrend[]): { date: string; amount: number }[] => {
     // 1. 월별로 그룹핑하고 합계 계산
     const monthlyMap = salesDailyTrend.reduce((acc, item) => {
       const month = dayjs(item.date).format('MM월');
       if (!acc[month]) {
         acc[month] = 0;
       }
       acc[month] += item.amount;
       return acc;
     }, {} as Record<string, number>);

     // 2. 배열로 변환
     const monthlyArray = Object.entries(monthlyMap).map(([month, amount]) => ({
       date: month,
       amount,
     }));

     // 3. 월 순서대로 정렬
     return monthlyArray.sort((a, b) => {
       const monthA = parseInt(a.date.replace('월', ''));
       const monthB = parseInt(b.date.replace('월', ''));
       return monthA - monthB;
     });
   };

    // 월별 매출 트렌드 데이터
    const monthlyRevenueData = convertDailyToMonthly(salesStats?.salesDailyTrend|| []);



    // 일별 매출 데이터
    const dailyRevenueData = salesStats?.salesDailyTrend?.map(d => ({
        date: dayjs(d.date).format("MM/DD"),
          revenue: d.amount,
          count: d.count
          })) || [];

    const statusData = salesStats?.statusBreakdown || [];


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
                    매출 요약
                </div>

                {/* 사이드바 */}
                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20">
                    {/* 통계 카드 섹션 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard title="총 매출" value={formatCurrency(totalSales)} unit="원" trend="" isPositive={true} color="text-blue-600" />
                        <StatCard title="매출 건수" value={formatCurrency(totalReservations)} unit="건" trend="" isPositive={true} color="text-green-600" />
                        <StatCard title="결제 취소" value={formatCurrency(cancellations)} unit="건" trend="" isPositive={true} color="text-orange-600" />
                        <StatCard title="환불 금액" value={formatCurrency(refunded)} unit="원" trend="" isPositive={true} color="text-red-600" />
                    </div>

                    {/* 첫 번째 행: 카테고리별 매출 + 월별 매출 트렌드 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* 카테고리별 매출 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">티켓유형별 매출</h2>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryRevenueData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="revenue"
                                        >
                                            {categoryRevenueData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            formatter={(value) => [`${formatCurrency(value as number)}원`, '매출']}
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-1 gap-2 mt-4">
                                {categoryRevenueData.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                                            <span className="text-sm text-gray-600">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">{formatCurrency(item.revenue)}원</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 월별 매출 트렌드 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">월별 매출 트렌드</h2>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={monthlyRevenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis 
                                            dataKey="date"
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
                                            formatter={(value) => [`${formatCurrency(value as number)}원`, '매출']}
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="amount"
                                            stackId="1"
                                            stroke="#3B82F6" 
                                            fill="#3B82F6" 
                                            fillOpacity={0.6}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* 두 번째 행: 일별 매출 + 수익률 분석 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* 일별 매출 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">일별 매출 현황</h2>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dailyRevenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis 
                                            dataKey="date" 
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
                                            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                                        />
                                        <Tooltip 
                                            formatter={(value) => [`${formatCurrency(value as number)}원`, '매출']}
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                        <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* 수익률 분석 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">결제율 분석</h2>
                            <div className="space-y-6">
                                {/* 전체 수익률 */}
                                {/* <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-600">전체 수익률</span>
                                        <span className="text-lg font-bold text-green-600">70.0%</span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-200 rounded-full">
                                        <div className="h-3 bg-green-500 rounded-full" style={{ width: '70%' }}></div>
                                    </div>
                                </div> */}

                                {/* 카테고리별 수익률 */}
                                <div className="space-y-4">
                                  {statusData.map((item, index) => (
                                    <div key={index}>
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-gray-600">{item.label}</span>
                                        <span className="text-sm font-medium text-gray-900">{item.percentage}%</span>

                                      </div>
                                      <div className="w-full h-2 bg-gray-200 rounded-full">
                                        <div
                                          className={`h-2 rounded-full ${
                                            item.label === "결제 완료"
                                              ? "bg-green-500"
                                              : item.label === "결제 취소"
                                              ? "bg-red-500"
                                              : "bg-blue-500"
                                          }`}
                                          style={{ width: `${item.percentage}%` }}
                                        ></div>
                                        <span className="text-sm text-gray-600">{item.amount}원</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 매출 분석 인사이트 */}
                    <div className="bg-green-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-green-900 mb-4">💰 매출 분석 인사이트</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
                            <div>
                                <p className="font-medium mb-2">📈 주요 성과:</p>
                                <ul className="space-y-1">
                                    <li>• 연간 매출 278M원 달성 (목표 대비 108%)</li>
                                    <li>• 공연 카테고리 매출 1위 (18.9M원)</li>
                                    <li>• 12월 매출 최고점 (27.8M원)</li>
                                </ul>
                            </div>
                            <div>
                                <p className="font-medium mb-2">🎯 개선 방향:</p>
                                <ul className="space-y-1">
                                    <li>• 강연/세미나 카테고리 수익률 향상</li>
                                    <li>• 부스 임대 수익 확대</li>
                                    <li>• VIP 티켓 판매 비중 증가</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
