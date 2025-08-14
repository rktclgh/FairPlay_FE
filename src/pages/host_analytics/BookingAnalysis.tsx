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
    PieChart,
    Pie,
    Cell
} from 'recharts';

// 예매율 분석 페이지
export const BookingAnalysis: React.FC = () => {
    // 카테고리별 예매율 데이터
    const categoryData = [
        { name: '박람회', value: 85, fill: '#3B82F6' },
        { name: '공연', value: 92, fill: '#EF4444' },
        { name: '강연/세미나', value: 78, fill: '#10B981' },
        { name: '축제', value: 88, fill: '#F59E0B' },
        { name: '기타', value: 65, fill: '#8B5CF6' }
    ];

    // 시간대별 예매율 데이터
    const timeData = [
        { time: '09:00', rate: 45 },
        { time: '10:00', rate: 62 },
        { time: '11:00', rate: 78 },
        { time: '12:00', rate: 85 },
        { time: '13:00', rate: 91 },
        { time: '14:00', rate: 88 },
        { time: '15:00', rate: 95 },
        { time: '16:00', rate: 92 },
        { time: '17:00', rate: 87 },
        { time: '18:00', rate: 82 }
    ];

    // 일별 예매율 트렌드 데이터
    const dailyTrendData = [
        { date: '12/01', rate: 65 },
        { date: '12/02', rate: 72 },
        { date: '12/03', rate: 78 },
        { date: '12/04', rate: 85 },
        { date: '12/05', rate: 91 },
        { date: '12/06', rate: 88 },
        { date: '12/07', rate: 94 },
        { date: '12/08', rate: 96 },
        { date: '12/09', rate: 89 },
        { date: '12/10', rate: 92 }
    ];

    // 통계 카드 컴포넌트
    const StatCard: React.FC<{ title: string; value: string; unit?: string; trend?: string; isPositive?: boolean }> = ({ 
        title, 
        value, 
        unit, 
        trend, 
        isPositive 
    }) => (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-2">{title}</div>
            <div className="flex items-baseline mb-2">
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                {unit && <span className="text-lg font-semibold text-gray-900 ml-1">{unit}</span>}
            </div>
            {trend && (
                <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '↗' : '↘'} {trend}
                </div>
            )}
        </div>
    );

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    예매율 분석
                </div>

                {/* 사이드바 */}
                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20">
                    {/* 통계 카드 섹션 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard title="전체 예매율" value="87.2" unit="%" trend="+2.1%" isPositive={true} />
                        <StatCard title="평균 예매율" value="84.8" unit="%" trend="+1.5%" isPositive={true} />
                        <StatCard title="최고 예매율" value="96.0" unit="%" trend="+3.2%" isPositive={true} />
                        <StatCard title="최저 예매율" value="65.0" unit="%" trend="-1.8%" isPositive={false} />
                    </div>

                    {/* 첫 번째 행: 카테고리별 예매율 + 시간대별 예매율 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* 카테고리별 예매율 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">카테고리별 예매율</h2>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [`${value}%`, '예매율']} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                {categoryData.map((item, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                                        <span className="text-sm text-gray-600">{item.name}: {item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 시간대별 예매율 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">시간대별 예매율</h2>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={timeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                                            domain={[0, 100]}
                                            ticks={[0, 25, 50, 75, 100]}
                                        />
                                        <Tooltip 
                                            formatter={(value) => [`${value}%`, '예매율']}
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                        <Bar dataKey="rate" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* 두 번째 행: 일별 예매율 트렌드 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">일별 예매율 트렌드</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dailyTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                                        domain={[0, 100]}
                                        ticks={[0, 25, 50, 75, 100]}
                                    />
                                    <Tooltip 
                                        formatter={(value) => [`${value}%`, '예매율']}
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="rate" 
                                        stroke="#3B82F6" 
                                        strokeWidth={3}
                                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 분석 인사이트 */}
                    <div className="bg-blue-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4">📊 예매율 분석 인사이트</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                            <div>
                                <p className="font-medium mb-2">🎯 주요 발견사항:</p>
                                <ul className="space-y-1">
                                    <li>• 공연 카테고리가 가장 높은 예매율 (92%)</li>
                                    <li>• 오후 2-3시대에 예매율이 최고점 (95%)</li>
                                    <li>• 주말을 전후로 예매율이 급상승하는 경향</li>
                                </ul>
                            </div>
                            <div>
                                <p className="font-medium mb-2">💡 개선 제안:</p>
                                <ul className="space-y-1">
                                    <li>• 강연/세미나 카테고리 마케팅 강화</li>
                                    <li>• 오전 시간대 할인 혜택 제공</li>
                                    <li>• 주말 예매율 활용한 프로모션</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
