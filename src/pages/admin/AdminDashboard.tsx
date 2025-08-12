import React, { useEffect, useMemo, useState } from 'react';
import { TopNav } from '../../components/TopNav';
import { AdminSideNav } from '../../components/AdminSideNav';

type Kpi = {
    title: string;
    value: string;
    sub?: string;
};

const formatNumber = (n: number) => n.toLocaleString();

export const AdminDashboard: React.FC = () => {
    const [totalEvents, setTotalEvents] = useState<number>(0);
    const [totalUsers, setTotalUsers] = useState<number>(0);
    const [totalReservations, setTotalReservations] = useState<number>(0);
    const [totalRevenue, setTotalRevenue] = useState<number>(0);
    const [trendRange, setTrendRange] = useState<'WEEK' | 'MONTH'>('WEEK');

    // TODO: 실제 API 연동 시 교체
    useEffect(() => {
        // 임시 값. 실제로는 관리자 통계 API에서 가져옵니다.
        setTotalEvents(128);
        setTotalUsers(58234);
        setTotalReservations(213456);
        setTotalRevenue(987654321);
    }, []);

    const kpis: Kpi[] = useMemo(() => ([
        { title: '총 행사 수', value: formatNumber(totalEvents) },
        { title: '총 사용자 수', value: formatNumber(totalUsers) },
        { title: '총 예약 수', value: formatNumber(totalReservations) },
        { title: '총 매출', value: `${formatNumber(totalRevenue)}원` },
    ]), [totalEvents, totalUsers, totalReservations, totalRevenue]);

    // 간단한 SVG 라인 차트 데이터 (더미)
    const chartData = useMemo(() => {
        const points = trendRange === 'WEEK'
            ? [30, 45, 40, 60, 55, 70, 80]
            : [50, 65, 60, 80, 75, 95, 110, 105, 120, 115, 140, 150];
        const max = Math.max(...points) * 1.2;
        const width = 640;
        const height = 220;
        const step = width / (points.length - 1);
        const d = points.map((p, i) => `${i * step},${height - (p / max) * height}`).join(' ');
        return { width, height, points, d };
    }, [trendRange]);

    return (
        <div className="min-h-screen bg-white">
            <TopNav />
            <div className="flex w-full justify-center">
                <div className="flex w-[1256px] gap-6 mt-6">
                    <AdminSideNav className="shrink-0" />

                    <main className="flex-1">
                        <h1 className="text-2xl font-bold mb-6">플랫폼 KPI</h1>

                        {/* KPI 카드 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {kpis.map((kpi) => (
                                <div key={kpi.title} className="border rounded-xl p-4 bg-white shadow-sm">
                                    <div className="text-sm text-gray-500 mb-1">{kpi.title}</div>
                                    <div className="text-2xl font-bold">{kpi.value}</div>
                                    {kpi.sub && <div className="text-xs text-gray-400 mt-1">{kpi.sub}</div>}
                                </div>
                            ))}
                        </div>

                        {/* 플랫폼 트렌드 */}
                        <section className="mb-8">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-xl font-semibold">플랫폼 트렌드</h2>
                                <select
                                    value={trendRange}
                                    onChange={(e) => setTrendRange(e.target.value as 'WEEK' | 'MONTH')}
                                    className="border rounded-md px-2 py-1 text-sm bg-white"
                                >
                                    <option value="WEEK">주간</option>
                                    <option value="MONTH">월간</option>
                                </select>
                            </div>
                            <div className="border rounded-xl p-4 bg-white shadow-sm">
                                <svg width={chartData.width} height={chartData.height} className="w-full h-[220px]">
                                    <polyline
                                        fill="none"
                                        stroke="#111"
                                        strokeWidth="2"
                                        points={chartData.d}
                                    />
                                </svg>
                            </div>
                        </section>

                        {/* 최근 관리자 활동 */}
                        <section>
                            <h2 className="text-xl font-semibold mb-3">최근 관리자 활동</h2>
                            <div className="border rounded-xl bg-white shadow-sm divide-y">
                                {[1, 2, 3, 4, 5].map((idx) => (
                                    <div key={idx} className="p-4 text-sm flex items-center justify-between">
                                        <span className="text-gray-800">[예시] 행사 등록 승인 처리 - user{idx}@example.com</span>
                                        <span className="text-gray-400">{new Date(Date.now() - idx * 3600_000).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;


