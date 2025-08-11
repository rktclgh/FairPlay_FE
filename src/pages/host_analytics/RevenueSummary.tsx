import React from "react";
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

// 매출 요약 페이지
export const RevenueSummary: React.FC = () => {
    // 카테고리별 매출 데이터
    const categoryRevenueData = [
        { name: '박람회', revenue: 12500000, fill: '#3B82F6' },
        { name: '공연', revenue: 18900000, fill: '#EF4444' },
        { name: '강연/세미나', revenue: 8700000, fill: '#10B981' },
        { name: '축제', revenue: 15600000, fill: '#F59E0B' },
        { name: '기타', revenue: 4200000, fill: '#8B5CF6' }
    ];

    // 월별 매출 트렌드 데이터
    const monthlyRevenueData = [
        { month: '1월', revenue: 12500000, profit: 8750000 },
        { month: '2월', revenue: 13800000, profit: 9660000 },
        { month: '3월', revenue: 15200000, profit: 10640000 },
        { month: '4월', revenue: 16700000, profit: 11690000 },
        { month: '5월', revenue: 18900000, profit: 13230000 },
        { month: '6월', revenue: 20100000, profit: 14070000 },
        { month: '7월', revenue: 21800000, profit: 15260000 },
        { month: '8월', revenue: 23400000, profit: 16380000 },
        { month: '9월', revenue: 24500000, profit: 17150000 },
        { month: '10월', revenue: 25600000, profit: 17920000 },
        { month: '11월', revenue: 26700000, profit: 18690000 },
        { month: '12월', revenue: 27800000, profit: 19460000 }
    ];

    // 일별 매출 데이터
    const dailyRevenueData = [
        { date: '12/01', revenue: 850000, profit: 595000 },
        { date: '12/02', revenue: 920000, profit: 644000 },
        { date: '12/03', revenue: 980000, profit: 686000 },
        { date: '12/04', revenue: 1050000, profit: 735000 },
        { date: '12/05', revenue: 1120000, profit: 784000 },
        { date: '12/06', revenue: 1180000, profit: 826000 },
        { date: '12/07', revenue: 1250000, profit: 875000 },
        { date: '12/08', revenue: 1320000, profit: 924000 },
        { date: '12/09', revenue: 1380000, profit: 966000 },
        { date: '12/10', revenue: 1450000, profit: 1015000 }
    ];

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
                        <StatCard title="총 매출" value={formatCurrency(27800000)} unit="원" trend="+8.2%" isPositive={true} color="text-blue-600" />
                        <StatCard title="총 수익" value={formatCurrency(19460000)} unit="원" trend="+7.8%" isPositive={true} color="text-green-600" />
                        <StatCard title="수익률" value="70.0" unit="%" trend="+0.3%" isPositive={true} color="text-purple-600" />
                        <StatCard title="평균 일매출" value={formatCurrency(925000)} unit="원" trend="+5.1%" isPositive={true} color="text-orange-600" />
                    </div>

                    {/* 첫 번째 행: 카테고리별 매출 + 월별 매출 트렌드 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* 카테고리별 매출 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">카테고리별 매출</h2>
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
                                            dataKey="revenue" 
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
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">수익률 분석</h2>
                            <div className="space-y-6">
                                {/* 전체 수익률 */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-600">전체 수익률</span>
                                        <span className="text-lg font-bold text-green-600">70.0%</span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-200 rounded-full">
                                        <div className="h-3 bg-green-500 rounded-full" style={{ width: '70%' }}></div>
                                    </div>
                                </div>

                                {/* 카테고리별 수익률 */}
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm text-gray-600">공연</span>
                                            <span className="text-sm font-medium text-gray-900">75.2%</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 rounded-full">
                                            <div className="h-2 bg-red-500 rounded-full" style={{ width: '75.2%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm text-gray-600">축제</span>
                                            <span className="text-sm font-medium text-gray-900">72.8%</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 rounded-full">
                                            <div className="h-2 bg-orange-500 rounded-full" style={{ width: '72.8%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm text-gray-600">박람회</span>
                                            <span className="text-sm font-medium text-gray-900">68.5%</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 rounded-full">
                                            <div className="h-2 bg-blue-500 rounded-full" style={{ width: '68.5%' }}></div>
                                        </div>
                                    </div>
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
