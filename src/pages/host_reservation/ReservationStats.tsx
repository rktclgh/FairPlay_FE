import React, { useState, useEffect } from "react";
import { HostSideNav } from "../../components/HostSideNav";
import { TopNav } from "../../components/TopNav";
import { HiChevronDown } from 'react-icons/hi';
import { dashboardAPI, EventDashboardStatsDto,ReservationDailyTrendDto,ReservationSummaryDto } from "../../services/dashboard";
import type { EventDetailResponseDto } from "../../services/types/eventType";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from "react-toastify";
import dayjs from 'dayjs';

export const ReservationStats = () => {
    const [selectedPeriod, setSelectedPeriod] = React.useState('일별');
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const [dashboardStats, setDashboardStats] = useState<EventDashboardStatsDto | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<EventDetailResponseDto | null>(null);
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
                            const dashStats = await dashboardAPI.getEventDashboardStats(myEvent.eventId, startDate, endDate);
                            console.log('예약 통계 데이터:', dashStats);
                            setDashboardStats(dashStats);
                        } catch (dashError: any) {
                            console.error('예약 통계 조회 실패:', dashError);
                            toast.error('예약 통계를 불러올 수 없습니다.');
                        }


                    } else {
                        console.log('등록된 이벤트가 없습니다.');
                        toast.info('등록된 이벤트가 없습니다.');
                    }
                } catch (error: any) {
                    console.error('통계 데이터 로드 실패:', error);
                    console.error('오류 상세:', error.response?.data || error.message);
                    setHasError(true); // Set error state

                    // 401 오류인 경우 로그인 페이지로 리다이렉트
                    if (error.response?.status === 401) {
                        toast.error('로그인이 필요합니다.');
                        // window.location.href = '/login'; // 필요시 주석 해제
                    } else {
                        toast.error(`통계 데이터를 불러오는데 실패했습니다: ${error.response?.data?.message || error.message}`);
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
                        const [dashStats] = await Promise.all([
                            dashboardAPI.getEventDashboardStats(selectedEvent.eventId, startDate, endDate),

                        ]);

                        setDashboardStats(dashStats);

                    } catch (error: any) {
                        console.error('통계 데이터 로드 실패:', error);
                        console.error('오류 상세:', error.response?.data || error.message);
                        toast.error(`통계 데이터를 불러오는데 실패했습니다: ${error.response?.data?.message || error.message}`);
                    }
                };

                loadEventStats();
            }
        }, [selectedEvent]);

    const totalReservations = dashboardStats?.summary?.totalReservations || 0;
    const checkedIn = dashboardStats?.summary?.totalCheckins || 0;
    const cancellations = dashboardStats?.summary?.totalCancellations || 0;
    const noShows =  dashboardStats?.summary?.totalNoShows || 0;

    // 최근 7일 데이터 (7일간, 오른쪽이 당일)
    const weeklyData =  dashboardStats?.dailyTrend?.map(d => ({
                         date: dayjs(d.date).format("MM/DD"), // 보기 좋게 "08/04"
                         reservations: d.reservations             // key 이름 변경
                       })) || [];




    const convertDailyToMonthly = (dailyTrend: ReservationDailyTrendDto[]): ReservationDailyTrendDto[] => {
      // 1. 월별로 그룹핑하고 합계 계산
      const monthlyMap = dailyTrend.reduce((acc, item) => {

        const month = dayjs(item.date).format('MM월');
        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month] += item.reservations;

        return acc;
      }, {} as Record<string, number>);

      // 2. 배열로 변환하고 월 순서대로 정렬
        const monthlyArray = Object.entries(monthlyMap).map(
          ([month, reservations]) => ({
            date: month,
            reservations,
          })
        );

      // 3. 월 순서대로 정렬 (01월, 02월, ... 12월)
      return monthlyArray.sort((a, b) => {
        const monthA = parseInt(a.date.replace('월', ''));
        const monthB = parseInt(b.date.replace('월', ''));
        return monthA - monthB;
      });
    };
    // 월별 데이터 (6개월간, 오른쪽이 이번달)
    const monthlyData = convertDailyToMonthly(dashboardStats?.dailyTrend || []);


    // 성별 분포 데이터
    const genderData = [
        { name: '남성', value: 60, color: '#3B82F6' },
        { name: '여성', value: 40, color: '#EC4899' }
    ];

    // 연령대 분포 데이터
    const ageData = [
        { name: '10대', value: 8, color: '#F59E0B' },
        { name: '20대', value: 35, color: '#10B981' },
        { name: '30대', value: 30, color: '#3B82F6' },
        { name: '40대', value: 20, color: '#8B5CF6' },
        { name: '50대 이상', value: 7, color: '#EF4444' }
    ];

    // 데이터 매핑
    const dataMap = {
        '일별': weeklyData,
        '월별': monthlyData
    };

    const currentData = dataMap[selectedPeriod as keyof typeof dataMap] || weeklyData;

    const handlePeriodChange = (period: string) => {
        setSelectedPeriod(period);
        setIsDropdownOpen(false);
    };

    // 통계 카드 데이터
    const statsCards = [
        {
            title: "총 예약 수",
            value: "12,543",
            change: "+12.5%",
            isPositive: true,
            subtitle: "지난 달 대비"
        },
        {
            title: "결제 완료",
            value: "11,234",
            change: "+8.3%",
            isPositive: true,
            subtitle: "지난 달 대비"
        },
        {
            title: "취소/환불",
            value: "1,309",
            change: "-4.2%",
            isPositive: false,
            subtitle: "지난 달 대비"
        },
        {
            title: "입장 완료",
            value: "9,876",
            change: "+15.7%",
            isPositive: true,
            subtitle: "지난 달 대비"
        }
    ];

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] h-auto relative min-h-screen">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    예약 통계
                </div>

                {/* 사이드바 */}
                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20">

                    {/* 통계 카드 */}
                    <div className="grid grid-cols-4 gap-6 mb-8">
                      {/* 전체 예약 */}
                      <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">전체 예약</h3>
                        <div className="flex items-baseline justify-between">
                          <p className="text-2xl font-bold text-gray-900">{totalReservations}</p>
                          {/* <span className={`text-sm font-medium ${dashboardStats?.summary?.totalReservationsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {dashboardStats?.summary?.totalReservationsChange >= 0 ? '+' : ''}{dashboardStats?.summary?.totalReservationsChange}%
                          </span>  */}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">누적 예약 수</p>
                      </div>

                      {/* 체크인 */}
                      <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">체크인</h3>
                        <div className="flex items-baseline justify-between">
                          <p className="text-2xl font-bold text-gray-900">{checkedIn}</p>
                          {/* <span className={`text-sm font-medium ${dashboardStats?.summary?.totalReservationsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {dashboardStats?.summary?.totalReservationsChange >= 0 ? '+' : ''}{dashboardStats?.summary?.totalReservationsChange}%
                          </span> */}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">실제 행사 참석 수</p>
                      </div>

                      {/* 취소 */}
                      <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">취소</h3>
                        <div className="flex items-baseline justify-between">
                          <p className="text-2xl font-bold text-gray-900">{cancellations}</p>
                          {/* <span className={`text-sm font-medium ${dashboardStats?.summary?.totalReservationsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {dashboardStats?.summary?.totalReservationsChange >= 0 ? '+' : ''}{dashboardStats?.summary?.totalReservationsChange}%
                                                    </span> */}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">예약 취소 수</p>
                      </div>

                      {/* 노쇼 */}
                      <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">노쇼</h3>
                        <div className="flex items-baseline justify-between">
                          <p className="text-2xl font-bold text-gray-900">{noShows}</p>
                          {/* <span className={`text-sm font-medium ${dashboardStats?.summary?.totalReservationsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {dashboardStats?.summary?.totalReservationsChange >= 0 ? '+' : ''}{dashboardStats?.summary?.totalReservationsChange}%
                                                    </span> */}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">예약 후 미참석</p>
                      </div>
                    </div>

                    {/* 예약 추이 차트 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">예약 추이</h3>

                            {/* 기간 선택 드롭다운 */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
                                >
                                    <span className="text-sm text-gray-700">{selectedPeriod}</span>
                                    <HiChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                        {['일별', '월별'].map((period) => (
                                            <button
                                                key={period}
                                                onClick={() => handlePeriodChange(period)}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                            >
                                                {period}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={currentData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#666"
                                        fontSize={12}
                                    />
                                    <YAxis
                                        stroke="#666"
                                        fontSize={12}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                        labelStyle={{ color: '#374151' }}
                                        itemStyle={{ color: '#3B82F6' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="reservations"
                                        stroke="#3B82F6"
                                        strokeWidth={3}
                                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5 }}
                                        activeDot={{ r: 7, stroke: '#3B82F6', strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 사용자 분석 */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* 성별 분포 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">성별 분포</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={genderData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {genderData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => [`${value}%`, '비율']}
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-6 mt-4">
                                {genderData.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: item.color }}
                                        ></div>
                                        <span className="text-sm text-gray-600">{item.name} ({item.value}%)</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 연령대 분포 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">연령대 분포</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={ageData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {ageData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => [`${value}%`, '비율']}
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                {ageData.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: item.color }}
                                        ></div>
                                        <span className="text-sm text-gray-600">{item.name} ({item.value}%)</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
