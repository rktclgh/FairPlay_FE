import React, { useEffect, useMemo, useState } from 'react';
import { TopNav } from '../../components/TopNav';
import { AdminSideNav } from '../../components/AdminSideNav';

type Kpi = {
    title: string;
    value: string;
    sub?: string;
    trend?: 'up' | 'down' | 'stable';
    percentage?: string;
};

type PlatformMetric = {
    label: string;
    current: number;
    previous: number;
    unit: string;
};

const formatNumber = (n: number) => n.toLocaleString();

export const AdminDashboard: React.FC = () => {
    const [totalEvents, setTotalEvents] = useState<number>(0);
    const [totalUsers, setTotalUsers] = useState<number>(0);
    const [totalReservations, setTotalReservations] = useState<number>(0);
    const [totalRevenue, setTotalRevenue] = useState<number>(0);
    const [activeUsers, setActiveUsers] = useState<number>(0);
    const [conversionRate, setConversionRate] = useState<number>(0);
    const [avgEventRating, setAvgEventRating] = useState<number>(0);
    const [supportTickets, setSupportTickets] = useState<number>(0);
    const [trendRange, setTrendRange] = useState<'WEEK' | 'MONTH'>('WEEK');

    // TODO: 실제 API 연동 시 교체
    useEffect(() => {
        // 임시 값. 실제로는 관리자 통계 API에서 가져옵니다.
        setTotalEvents(128);
        setTotalUsers(58234);
        setTotalReservations(213456);
        setTotalRevenue(987654321);
        setActiveUsers(45222);
        setConversionRate(3.8);
        setAvgEventRating(4.6);
        setSupportTickets(156);
    }, []);

    const kpis: Kpi[] = useMemo(() => ([
        {
            title: '총 행사 수',
            value: formatNumber(totalEvents),
            trend: 'up',
            percentage: '+12%'
        },
        {
            title: '총 사용자 수',
            value: formatNumber(totalUsers),
            trend: 'up',
            percentage: '+8%'
        },
        {
            title: '총 예약 수',
            value: formatNumber(totalReservations),
            trend: 'up',
            percentage: '+15%'
        },
        {
            title: '총 매출',
            value: `${formatNumber(totalRevenue)}원`,
            trend: 'up',
            percentage: '+23%'
        },
    ]), [totalEvents, totalUsers, totalReservations, totalRevenue]);

    const platformMetrics: PlatformMetric[] = useMemo(() => ([
        { label: '활성 사용자', current: activeUsers, previous: 41890, unit: '명' },
        { label: '전환율', current: conversionRate, previous: 3.2, unit: '%' },
        { label: '평균 행사 평점', current: avgEventRating, previous: 4.4, unit: '점' },
        { label: '지원 티켓', current: supportTickets, previous: 189, unit: '건' },
    ]), [activeUsers, conversionRate, avgEventRating, supportTickets]);

    // 플랫폼 성과 차트 데이터
    const performanceData = useMemo(() => {
        const data = trendRange === 'WEEK'
            ? [
                { period: '월', users: 45222, events: 128, revenue: 987654321 },
                { period: '화', users: 44890, events: 125, revenue: 965432100 },
                { period: '수', users: 44560, events: 122, revenue: 943210987 },
                { period: '목', users: 44230, events: 119, revenue: 920987654 },
                { period: '금', users: 43900, events: 116, revenue: 898765432 },
                { period: '토', users: 43570, events: 113, revenue: 876543210 },
                { period: '일', users: 43240, events: 110, revenue: 854320987 }
            ]
            : [
                { period: '1월', users: 43240, events: 110, revenue: 854320987 },
                { period: '2월', users: 44560, events: 115, revenue: 876543210 },
                { period: '3월', users: 45880, events: 120, revenue: 898765432 },
                { period: '4월', users: 47200, events: 125, revenue: 920987654 },
                { period: '5월', users: 48520, events: 130, revenue: 943210987 },
                { period: '6월', users: 49840, events: 135, revenue: 965432100 },
                { period: '7월', users: 51160, events: 140, revenue: 987654321 },
                { period: '8월', users: 52480, events: 145, revenue: 1009876543 },
                { period: '9월', users: 53800, events: 150, revenue: 1032098765 },
                { period: '10월', users: 55120, events: 155, revenue: 1054320987 },
                { period: '11월', users: 56440, events: 160, revenue: 1076543209 },
                { period: '12월', users: 57760, events: 165, revenue: 1098765432 }
            ];
        return data;
    }, [trendRange]);

    const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up':
                return <span className="text-green-500 text-sm">↗</span>;
            case 'down':
                return <span className="text-red-500 text-sm">↘</span>;
            default:
                return <span className="text-gray-500 text-sm">→</span>;
        }
    };

    const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up':
                return 'text-green-600';
            case 'down':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    플랫폼 KPI
                </div>

                {/* 사이드바 */}
                <AdminSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20">

                    {/* 핵심 KPI 카드 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {kpis.map((kpi) => (
                            <div key={kpi.title} className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-sm font-medium text-gray-500">{kpi.title}</div>
                                    {getTrendIcon(kpi.trend!)}
                                </div>
                                <div className="text-[15px] font-semibold text-gray-900 mb-1">{kpi.value}</div>
                                <div className={`text-xs font-medium ${getTrendColor(kpi.trend!)}`}>
                                    {kpi.percentage} vs 이전 기간
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 첫 번째 행: 플랫폼 성과 + 사용자 참여도 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* 플랫폼 성과 트렌드 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-900">플랫폼 성과 트렌드</h2>
                                <select
                                    value={trendRange}
                                    onChange={(e) => setTrendRange(e.target.value as 'WEEK' | 'MONTH')}
                                    className="border rounded-md px-3 py-1 text-sm bg-white"
                                >
                                    <option value="WEEK">주간</option>
                                    <option value="MONTH">월간</option>
                                </select>
                            </div>

                            {/* 간단한 성과 지표 */}
                            <div className="space-y-4">
                                {performanceData.slice(-4).map((data, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700">{data.period}</span>
                                        <div className="flex items-center space-x-6 text-sm">
                                            <span className="text-gray-600">사용자: {data.users.toLocaleString()}</span>
                                            <span className="text-gray-600">행사: {data.events}</span>
                                            <span className="text-gray-600">매출: {data.revenue.toLocaleString()}원</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 사용자 참여도 분석 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">사용자 참여도 분석</h2>

                            <div className="space-y-6">
                                {platformMetrics.map((metric, idx) => {
                                    const change = ((metric.current - metric.previous) / metric.previous * 100).toFixed(1);
                                    const isPositive = metric.current > metric.previous;

                                    return (
                                        <div key={idx} className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-600">{metric.label}</span>
                                                <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                                    {isPositive ? '+' : ''}{change}%
                                                </span>
                                            </div>
                                            <div className="flex items-baseline space-x-2">
                                                <div className="text-xl font-bold text-gray-900">{metric.current}</div>
                                                <span className="text-sm text-gray-500">{metric.unit}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                                                    style={{ width: `${Math.min((metric.current / (metric.previous * 1.5)) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* 두 번째 행: 플랫폼 건강도 + 최근 관리자 활동 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* 플랫폼 건강도 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">플랫폼 건강도</h2>

                            <div className="space-y-6">
                                {/* 사용자 활성도 */}
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-600 mb-2">
                                        {Math.round((activeUsers / totalUsers) * 100)}%
                                    </div>
                                    <div className="text-sm text-gray-500">사용자 활성도</div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {activeUsers.toLocaleString()} / {totalUsers.toLocaleString()} 명
                                    </div>
                                </div>

                                {/* 전환율 */}
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600 mb-2">
                                        {conversionRate}%
                                    </div>
                                    <div className="text-sm text-gray-500">예약 전환율</div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        방문자 대비 예약 완료율
                                    </div>
                                </div>

                                {/* 행사 만족도 */}
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600 mb-2">
                                        {avgEventRating}/5.0
                                    </div>
                                    <div className="text-sm text-gray-500">평균 행사 만족도</div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        사용자 리뷰 기반
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 최근 관리자 활동 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-semibold text-gray-900">최근 관리자 활동</h2>
                                <button className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors">
                                    전체 활동 보기
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-gray-50 rounded-lg p-4 relative">
                                    <p className="font-medium text-gray-900 text-sm mb-2">행사 등록 승인 처리 - user1@example.com</p>
                                    <div className="text-xs font-normal text-gray-500">2024.12.10 14:30</div>
                                    <div className="absolute top-5 right-4 w-2 h-2 bg-green-500 rounded-full" />
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 relative">
                                    <p className="font-medium text-gray-900 text-sm mb-2">계정 권한 설정 변경 - admin@fairplay.com</p>
                                    <div className="text-xs font-normal text-gray-500">2024.12.09 16:15</div>
                                    <div className="absolute top-5 right-4 w-2 h-2 bg-blue-500 rounded-full" />
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 relative">
                                    <p className="font-medium text-gray-900 text-sm mb-2">VIP 배너 광고 등록 - marketing@event.com</p>
                                    <div className="text-xs font-normal text-gray-500">2024.12.08 11:20</div>
                                    <div className="absolute top-5 right-4 w-2 h-2 bg-yellow-500 rounded-full" />
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 relative">
                                    <p className="font-medium text-gray-900 text-sm mb-2">정산 처리 완료 - finance@fairplay.com</p>
                                    <div className="text-xs font-normal text-gray-500">2024.12.07 09:45</div>
                                    <div className="absolute top-5 right-4 w-2 h-2 bg-green-500 rounded-full" />
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 relative">
                                    <p className="font-medium text-gray-900 text-sm mb-2">시스템 설정 변경 - tech@fairplay.com</p>
                                    <div className="text-xs font-normal text-gray-500">2024.12.06 15:30</div>
                                    <div className="absolute top-5 right-4 w-2 h-2 bg-purple-500 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;


