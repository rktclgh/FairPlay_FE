import React, { useState, useEffect } from "react";
import { TopNav } from "../components/TopNav";
import { HostSideNav } from "../components/HostSideNav";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardAPI, EventDashboardStatsDto, SalesDashboardResponse, EventDetailInfo } from "../services/dashboard";
import { toast } from "react-toastify";

// 통계 카드 컴포넌트
const StatCard: React.FC<{ title: string; value: string; unit?: string }> = ({ title, value, unit }) => (
    <div className="bg-white rounded-lg shadow-md p-6 flex-1 min-w-[200px]">
        <div className="text-sm font-medium text-gray-500 mb-2">{title}</div>
        <div className="flex items-baseline">
            <div className="text-[15px] font-semibold text-gray-900">{value}</div>
            {unit && <span className="text-[15px] font-semibold text-gray-900 ml-1">{unit}</span>}
        </div>
    </div>
);

// 수익 카드 컴포넌트
const RevenueCard: React.FC<{ label: string; amount: string; isNegative?: boolean; isProfit?: boolean }> = ({
    label,
    amount,
    isNegative = false,
    isProfit = false
}) => (
    <div className="mb-4">
        <div className="text-sm font-medium text-gray-500 mb-1">{label}</div>
        <div className={`text-xl font-semibold ${isNegative ? 'text-red-500' : isProfit ? 'text-blue-500' : 'text-gray-900'}`}>
            ₩ {amount}
        </div>
    </div>
);

// 체크인 상태 카드 컴포넌트
const CheckinStatusCard: React.FC<{ label: string; count: number; bgColor: string; textColor: string }> = ({
    label,
    count,
    bgColor,
    textColor
}) => (
    <div className={`${bgColor} rounded-lg p-6 flex-1 min-w-[200px]`}>
        <div className={`text-xl font-semibold ${textColor} text-center mb-1`}>{count.toLocaleString()}</div>
        <div className="text-xs font-normal text-gray-500 text-center">{label}</div>
    </div>
);

// 문의 알림 카드 컴포넌트
const InquiryCard: React.FC<{ title: string; date: string }> = ({ title, date }) => (
    <div className="bg-gray-50 rounded-lg p-4 relative">
        <p className="font-medium text-gray-900 text-sm mb-2">{title}</p>
        <div className="text-xs font-normal text-gray-500">{date}</div>
        <div className="absolute top-5 right-4 w-2 h-2 bg-red-500 rounded-full" />
    </div>
);

// 실시간 예매 현황 그래프 컴포넌트
const BookingTrendChart: React.FC<{ 
    dashboardStats: EventDashboardStatsDto | null;
}> = ({ dashboardStats }) => {
    // 백엔드 데이터를 차트 형식으로 변환
    const data = dashboardStats?.dailyTrend?.map(item => ({
        time: new Date(item.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        bookings: item.reservations
    })) || [];

    const totalBookings = dashboardStats?.summary?.totalReservations || 0;
    const totalCheckins = dashboardStats?.summary?.totalCheckins || 0;
    const totalSeats = totalBookings + 100; // 임시로 총 좌석 수 계산 (실제로는 이벤트 정보에서 가져와야 함)
    const remainingSeats = totalSeats - totalBookings;

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">실시간 예매 현황</h3>
                <p className="text-sm text-gray-500">시간대별 예매 추이</p>
            </div>

            <div className="h-40 mb-6 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="time"
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
                            domain={[0, 1500]}
                            ticks={[0, 300, 600, 900, 1200, 1500]}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="bookings"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                            activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">예매 완료</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{totalBookings} 명</span>
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">잔여 좌석</span>
                    </div>
                    <span className="text-sm font-semibold text-red-500">{remainingSeats} 석</span>
                </div>
            </div>
        </div>
    );
};

export const HostDashboard = () => {
    const [selectedEvent, setSelectedEvent] = useState<EventDetailInfo | null>(null);
    const [dashboardStats, setDashboardStats] = useState<EventDashboardStatsDto | null>(null);
    const [salesStats, setSalesStats] = useState<SalesDashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // 날짜 범위 설정 (최근 30일)
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

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
                        const dashStats = await dashboardAPI.getEventDashboardStats(myEvent.eventId, startDate, endDate);
                        console.log('예약 통계 데이터:', dashStats);
                        setDashboardStats(dashStats);
                    } catch (dashError: any) {
                        console.error('예약 통계 조회 실패:', dashError);
                        toast.error('예약 통계를 불러올 수 없습니다.');
                    }
                    
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
                    const [dashStats, salesData] = await Promise.all([
                        dashboardAPI.getEventDashboardStats(selectedEvent.eventId, startDate, endDate),
                        dashboardAPI.getSalesStatistics(selectedEvent.eventId, startDate, endDate)
                    ]);
                    
                    setDashboardStats(dashStats);
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

    // 계산된 값들
    const totalReservations = dashboardStats?.summary?.totalReservations || 0;
    const checkedIn = dashboardStats?.summary?.totalCheckins || 0;
    const notCheckedIn = totalReservations - checkedIn;
    const checkinRate = totalReservations > 0 ? Math.round((checkedIn / totalReservations) * 100) : 0;

    if (loading) {
        return (
            <div className="bg-white flex flex-row justify-center w-full">
                <div className="bg-white w-[1256px] min-h-screen relative">
                    <TopNav />
                    <HostSideNav className="!absolute !left-0 !top-[117px]" />
                    <div className="absolute left-64 top-[195px] w-[949px] flex items-center justify-center h-96">
                        <div className="text-lg text-gray-500">데이터를 불러오는 중...</div>
                    </div>
                </div>
            </div>
        );
    } else if (hasError) { // Display error message if an error occurred
        return (
            <div className="bg-white flex flex-row justify-center w-full">
                <div className="bg-white w-[1256px] min-h-screen relative">
                    <TopNav />
                    <HostSideNav className="!absolute !left-0 !top-[117px]" />
                    <div className="absolute left-64 top-[195px] w-[949px] flex items-center justify-center h-96">
                        <div className="text-lg text-red-500">대시보드 데이터를 불러오는데 실패했습니다.</div>
                    </div>
                </div>
            </div>
        );
    } else if (!selectedEvent) { // Display "no event" message if no event is selected
        return (
            <div className="bg-white flex flex-row justify-center w-full">
                <div className="bg-white w-[1256px] min-h-screen relative">
                    <TopNav />
                    <HostSideNav className="!absolute !left-0 !top-[117px]" />
                    <div className="absolute left-64 top-[195px] w-[949px] flex items-center justify-center h-96">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                            <div className="flex items-center">
                                <div className="text-yellow-600 mr-3">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-yellow-800">담당 행사가 없습니다</h3>
                                    <p className="text-sm text-yellow-700 mt-1">관리자에게 행사 배정을 요청해주세요.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    대시보드
                </div>

                {/* 사이드바 */}
                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20">

                    {/* 통계 카드 섹션 - 담당 행사가 있는 경우에만 표시 */}
                    {selectedEvent && (
                    <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard 
                            title="행사명" 
                            value={selectedEvent?.titleKr || '행사 없음'} 
                        />
                        <StatCard 
                            title="행사 일정" 
                            value={selectedEvent ? 
                                `${new Date(selectedEvent.startDate).toLocaleDateString('ko-KR', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\./g, '.').replace(/\s/g, '')} ~ ${new Date(selectedEvent.endDate).toLocaleDateString('ko-KR', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\./g, '.').replace(/\s/g, '')}` : 
                                '-'
                            } 
                        />
                        <StatCard 
                            title="장소" 
                            value={selectedEvent?.placeName || selectedEvent?.address || '장소 정보 없음'} 
                        />
                        <StatCard 
                            title="총 예약자 수" 
                            value={totalReservations.toLocaleString()} 
                            unit="명" 
                        />
                    </div>

                    {/* 첫 번째 행: 실시간 예매 현황 + 매출 요약 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* 실시간 예매 현황 */}
                        <BookingTrendChart dashboardStats={dashboardStats} />

                        {/* 매출 요약 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">매출 요약</h2>
                            <RevenueCard 
                                label="총 매출" 
                                amount={salesStats?.summary?.totalSales?.toLocaleString() || '0'} 
                            />
                            <RevenueCard 
                                label="취소 금액" 
                                amount={salesStats?.summary?.cancelled?.amount?.toLocaleString() || '0'} 
                                isNegative 
                            />
                            <RevenueCard 
                                label="환불 금액" 
                                amount={salesStats?.summary?.refunded?.amount?.toLocaleString() || '0'} 
                                isNegative 
                            />
                            <div className="border-t pt-4">
                                <RevenueCard 
                                    label="순수익" 
                                    amount={(() => {
                                        const total = salesStats?.summary?.totalSales || 0;
                                        const cancelled = salesStats?.summary?.cancelled?.amount || 0;
                                        const refunded = salesStats?.summary?.refunded?.amount || 0;
                                        return (total - cancelled - refunded).toLocaleString();
                                    })()} 
                                    isProfit 
                                />
                            </div>
                        </div>
                    </div>

                    {/* 두 번째 행: 실시간 체크인 현황 + 최근 문의/신고 알림 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* 실시간 체크인 현황 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">실시간 체크인 현황</h2>

                            {/* 체크인 완료율 */}
                            <div className="text-center mb-6">
                                <div className="text-4xl font-bold text-blue-500 mb-2">{checkinRate}%</div>
                                <div className="text-sm font-normal text-gray-500">체크인 완료율</div>
                            </div>

                            {/* 체크인 상세 현황 */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                                    <span>체크인 완료</span>
                                    <span>{checkedIn.toLocaleString()} / {totalReservations.toLocaleString()} 명</span>
                                </div>

                                {/* 진행률 바 */}
                                <div className="w-full h-2.5 bg-gray-100 rounded-full">
                                    <div
                                        className="h-2.5 bg-emerald-500 rounded-full"
                                        style={{ width: `${checkinRate}%` }}
                                    />
                                </div>
                            </div>

                            {/* 체크인 상태 카드 */}
                            <div className="grid grid-cols-1 gap-3">
                                <div className="bg-green-50 rounded-lg p-4 flex justify-between items-center">
                                    <span className="text-sm text-gray-600">체크인 완료</span>
                                    <span className="text-xl font-semibold text-emerald-500">{checkedIn.toLocaleString()}</span>
                                </div>
                                <div className="bg-red-50 rounded-lg p-4 flex justify-between items-center">
                                    <span className="text-sm text-gray-600">미체크인</span>
                                    <span className="text-xl font-semibold text-red-500">{notCheckedIn.toLocaleString()}</span>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                                    <span className="text-sm text-gray-600">취소</span>
                                    <span className="text-xl font-semibold text-gray-500">{(dashboardStats?.summary?.totalCancellations || 0).toLocaleString()}</span>
                                </div>
                                <div className="bg-orange-50 rounded-lg p-4 flex justify-between items-center">
                                    <span className="text-sm text-gray-600">노쇼</span>
                                    <span className="text-xl font-semibold text-orange-500">{(dashboardStats?.summary?.totalNoShows || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* 최근 문의/신고 알림 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-semibold text-gray-900">최근 문의 / 신고 알림</h2>
                                <button className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors">
                                    전체 문의 보기
                                </button>
                            </div>

                            <div className="space-y-4">
                                <InquiryCard title="환불 문의 - 개인 사정으로 참석 불가" date="2024.12.10" />
                                <InquiryCard title="좌석 변경 요청 - VIP석으로 업그레이드" date="2024.12.09" />
                                <InquiryCard title="단체 할인 문의 - 20명 이상 예약" date="2024.12.08" />
                                <InquiryCard title="주차장 이용 관련 문의" date="2024.12.07" />
                                <InquiryCard title="식사 제공 여부 문의" date="2024.12.06" />
                            </div>
                        </div>
                    </div>
                    </>
                    )}
                </div>
            </div>
        </div>
    );
};
