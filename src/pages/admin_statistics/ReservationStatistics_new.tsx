import React, { useState, useEffect } from "react";
import { TopNav } from "../../components/TopNav";
import { AdminSideNav } from "../../components/AdminSideNav";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { adminStatisticsService, type ReservationStatisticsDto, type ReservationWeeklyStatisticsDto, type ReservationCategoryStatisticsDto } from "../../services/adminStatistics.service";

export const ReservationStatistics: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('week');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [loading, setLoading] = useState<boolean>(true);

    // 백엔드에서 받아올 통계 데이터
    const [statsData, setStatsData] = useState<ReservationStatisticsDto>({
        totalQuantity: 0,
        canceledCount: 0,
        totalAmount: 0,
        averagePrice: 0
    });

    // 백엔드에서 받아올 주간 예약 통계 데이터
    const [weeklyData, setWeeklyData] = useState<ReservationWeeklyStatisticsDto[]>([]);
    
    // 백엔드에서 받아올 카테고리별 예약 통계 데이터
    const [categoryData, setCategoryData] = useState<ReservationCategoryStatisticsDto[]>([]);

    // 샘플 데이터 (월별/분기별용)
    const [trendData] = useState({
        month: [
            { period: '1월', reservations: 120, amount: 4200000 },
            { period: '2월', reservations: 135, amount: 4725000 },
            { period: '3월', reservations: 142, amount: 4970000 },
            { period: '4월', reservations: 158, amount: 5530000 },
            { period: '5월', reservations: 167, amount: 5845000 },
            { period: '6월', reservations: 189, amount: 6615000 },
            { period: '7월', reservations: 156, amount: 5460000 },
            { period: '8월', reservations: 178, amount: 6230000 }
        ],
        quarter: [
            { period: '1분기', reservations: 397, amount: 13895000 },
            { period: '2분기', reservations: 514, amount: 17985000 },
            { period: '3분기', reservations: 334, amount: 11690000 }
        ]
    });

    const [eventRankings] = useState([
        { rank: 1, name: '2025 서울 국제 박람회', category: '박람회', reservations: 156, totalAmount: 7800000 },
        { rank: 2, name: '스타트업 창업 세미나', category: '강연/세미나', reservations: 89, totalAmount: 4450000 },
        { rank: 3, name: '서울 아트 페어', category: '전시/행사', reservations: 78, totalAmount: 3900000 },
        { rank: 4, name: 'K-POP 콘서트', category: '공연', reservations: 67, totalAmount: 3350000 },
        { rank: 5, name: '한국 전통 축제', category: '축제', reservations: 45, totalAmount: 2250000 },
        { rank: 6, name: 'IT 개발자 컨퍼런스', category: '강연/세미나', reservations: 42, totalAmount: 2100000 },
        { rank: 7, name: '패션 트렌드 쇼', category: '전시/행사', reservations: 38, totalAmount: 1900000 },
        { rank: 8, name: '클래식 음악회', category: '공연', reservations: 35, totalAmount: 1750000 }
    ]);

    const [filteredEvents, setFilteredEvents] = useState(eventRankings);

    // 예약 통계 데이터 로드
    const loadReservationStatistics = async () => {
        try {
            setLoading(true);
            
            // 기본 통계, 주간 데이터, 카테고리 데이터를 병렬로 로드
            const [statisticsData, weeklyStatisticsData, categoryStatisticsData] = await Promise.all([
                adminStatisticsService.getReservationStatistics(),
                adminStatisticsService.getWeeklyReservationStatistics(),
                adminStatisticsService.getReservationCategoryStatistics()
            ]);
            
            console.log('예약 통계 데이터:', statisticsData);
            console.log('주간 예약 통계 데이터:', weeklyStatisticsData);
            console.log('카테고리 예약 통계 데이터:', categoryStatisticsData);
            
            setStatsData(statisticsData);
            setWeeklyData(weeklyStatisticsData);
            setCategoryData(categoryStatisticsData);
        } catch (error) {
            console.error('예약 통계 데이터 로드 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    // 컴포넌트 마운트시 데이터 로드
    useEffect(() => {
        loadReservationStatistics();
    }, []);

    // 검색 및 필터링
    useEffect(() => {
        let filtered = eventRankings;

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(event => event.category === selectedCategory);
        }

        if (searchKeyword) {
            filtered = filtered.filter(event =>
                event.name.toLowerCase().includes(searchKeyword.toLowerCase())
            );
        }

        setFilteredEvents(filtered);
    }, [selectedCategory, searchKeyword, eventRankings]);

    // 금액 포맷팅
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ko-KR').format(amount);
    };

    // 백엔드 카테고리 데이터를 차트 형식으로 변환
    const transformCategoryDataForChart = () => {
        const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#0088fe', '#00c49f'];
        
        return categoryData.map((item, index) => ({
            name: item.category,
            value: item.totalQuantity,
            color: colors[index % colors.length]
        }));
    };

    // 백엔드 주간 데이터를 차트 형식으로 변환
    const transformWeeklyDataForChart = () => {
        return weeklyData.map((item, index) => ({
            period: `${index + 1}주차`,
            reservations: item.totalQuantity,
            date: item.date
        }));
    };

    // 차트 데이터 결정 (주별만 백엔드 데이터 사용, 나머지는 샘플 데이터)
    const getChartData = () => {
        if (selectedPeriod === 'week') {
            return transformWeeklyDataForChart();
        }
        return trendData[selectedPeriod as keyof typeof trendData];
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    예약 통계
                </div>

                {/* 사이드바 */}
                <AdminSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 로딩 표시 */}
                {loading && (
                    <div className="absolute left-64 top-[195px] w-[949px] flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <span className="ml-4 text-gray-600">데이터를 불러오는 중...</span>
                    </div>
                )}

                {/* 메인 콘텐츠 */}
                {!loading && (
                <div className="absolute left-64 top-[195px] w-[949px] pb-20 space-y-6">

                    {/* 주요 지표 카드들 */}
                    <div className="grid grid-cols-4 gap-4">
                        {/* 전체 예약 */}
                        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">전체 예약</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(statsData.totalQuantity)}건</p>
                                </div>
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* 예약 취소 */}
                        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">예약 취소</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(statsData.canceledCount)}건</p>
                                </div>
                                <div className="p-2 bg-red-100 rounded-full">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* 총 예약 금액 */}
                        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">총 예약 금액</p>
                                    <p className="text-2xl font-bold text-gray-900">₩{formatCurrency(statsData.totalAmount)}</p>
                                </div>
                                <div className="p-2 bg-green-100 rounded-full">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* 평균 예약 금액 */}
                        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">평균 예약 금액</p>
                                    <p className="text-2xl font-bold text-gray-900">₩{formatCurrency(statsData.averagePrice)}</p>
                                </div>
                                <div className="p-2 bg-purple-100 rounded-full">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 차트 섹션 */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* 예약 추이 차트 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">예약 추이</h3>
                                <select
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="week">주별</option>
                                </select>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                파란색 선: 주별 예약 건수를 나타냅니다 (실제 데이터)
                            </p>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={getChartData()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="period" />
                                    <YAxis yAxisId="left" label={{ value: '예약 수 (건)', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip formatter={(value, name) => {
                                        if (name === 'reservations') {
                                            return [`${value}건`, '예약 수'];
                                        }
                                        return [value, name];
                                    }} />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="reservations" stroke="#3b82f6" strokeWidth={2} name="예약 수 (건)" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* 카테고리별 예약 차트 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">카테고리별 예약</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                각 카테고리별 예약 건수의 비율을 원형 차트로 표시합니다 (실제 데이터)
                            </p>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={transformCategoryDataForChart()}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {transformCategoryDataForChart().map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value}건`, '예약 수']} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 행사별 예약 순위 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">행사별 예약 순위</h3>
                            <div className="flex items-center gap-4">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">전체 카테고리</option>
                                    <option value="박람회">박람회</option>
                                    <option value="강연/세미나">강연/세미나</option>
                                    <option value="전시/행사">전시/행사</option>
                                    <option value="공연">공연</option>
                                    <option value="축제">축제</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="행사명 검색..."
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">순위</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">행사명</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">예약 수</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총 금액</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredEvents.map((event) => (
                                        <tr key={event.rank} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${event.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                                                    event.rank === 2 ? 'bg-gray-100 text-gray-800' :
                                                        event.rank === 3 ? 'bg-orange-100 text-orange-800' :
                                                            'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {event.rank}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {event.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {event.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(event.reservations)}건
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                ₩{formatCurrency(event.totalAmount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
};

export default ReservationStatistics;
