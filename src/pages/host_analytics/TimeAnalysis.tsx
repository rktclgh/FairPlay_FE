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
    ComposedChart,
    Cell
} from 'recharts';

// 시간대별 분석 페이지
export const TimeAnalysis: React.FC = () => {
    // 시간대별 예매 현황 데이터
    const hourlyData = [
        { hour: '00:00', bookings: 45, revenue: 1800000 },
        { hour: '01:00', bookings: 32, revenue: 1280000 },
        { hour: '02:00', bookings: 28, revenue: 1120000 },
        { hour: '03:00', bookings: 25, revenue: 1000000 },
        { hour: '04:00', bookings: 22, revenue: 880000 },
        { hour: '05:00', bookings: 35, revenue: 1400000 },
        { hour: '06:00', bookings: 58, revenue: 2320000 },
        { hour: '07:00', bookings: 89, revenue: 3560000 },
        { hour: '08:00', bookings: 156, revenue: 6240000 },
        { hour: '09:00', bookings: 234, revenue: 9360000 },
        { hour: '10:00', bookings: 312, revenue: 12480000 },
        { hour: '11:00', bookings: 389, revenue: 15560000 },
        { hour: '12:00', bookings: 456, revenue: 18240000 },
        { hour: '13:00', bookings: 523, revenue: 20920000 },
        { hour: '14:00', bookings: 567, revenue: 22680000 },
        { hour: '15:00', bookings: 589, revenue: 23560000 },
        { hour: '16:00', bookings: 534, revenue: 21360000 },
        { hour: '17:00', bookings: 478, revenue: 19120000 },
        { hour: '18:00', bookings: 423, revenue: 16920000 },
        { hour: '19:00', bookings: 389, revenue: 15560000 },
        { hour: '20:00', bookings: 345, revenue: 13800000 },
        { hour: '21:00', bookings: 298, revenue: 11920000 },
        { hour: '22:00', bookings: 234, revenue: 9360000 },
        { hour: '23:00', bookings: 167, revenue: 6680000 }
    ];

    // 요일별 분석 데이터
    const weeklyData = [
        { day: '월요일', bookings: 234, revenue: 9360000, avgTicket: 40000 },
        { day: '화요일', bookings: 289, revenue: 11560000, avgTicket: 40000 },
        { day: '수요일', bookings: 312, revenue: 12480000, avgTicket: 40000 },
        { day: '목요일', bookings: 345, revenue: 13800000, avgTicket: 40000 },
        { day: '금요일', bookings: 456, revenue: 18240000, avgTicket: 40000 },
        { day: '토요일', bookings: 567, revenue: 22680000, avgTicket: 40000 },
        { day: '일요일', bookings: 523, revenue: 20920000, avgTicket: 40000 }
    ];

    // 월별 시간대 패턴 데이터
    const monthlyPatternData = [
        { month: '1월', morning: 28, afternoon: 45, evening: 27 },
        { month: '2월', morning: 31, afternoon: 48, evening: 21 },
        { month: '3월', morning: 35, afternoon: 52, evening: 13 },
        { month: '4월', morning: 38, afternoon: 55, evening: 7 },
        { month: '5월', morning: 42, afternoon: 58, evening: 0 },
        { month: '6월', morning: 45, afternoon: 55, evening: 0 },
        { month: '7월', morning: 48, afternoon: 52, evening: 0 },
        { month: '8월', morning: 52, afternoon: 48, evening: 0 },
        { month: '9월', morning: 48, afternoon: 52, evening: 0 },
        { month: '10월', morning: 45, afternoon: 55, evening: 0 },
        { month: '11월', morning: 42, afternoon: 58, evening: 0 },
        { month: '12월', morning: 38, afternoon: 55, evening: 7 }
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
                    시간대별 분석
                </div>

                {/* 사이드바 */}
                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20">
                    {/* 통계 카드 섹션 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard title="피크 시간대" value="15:00" unit="" color="text-red-600" />
                        <StatCard title="평균 예매율" value="84.8" unit="%" trend="+2.1%" isPositive={true} color="text-blue-600" />
                        <StatCard title="최고 일매출" value={formatCurrency(23560000)} unit="원" trend="+5.2%" isPositive={true} color="text-green-600" />
                        <StatCard title="평균 티켓가" value="40,000" unit="원" trend="+1.8%" isPositive={true} color="text-purple-600" />
                    </div>

                    {/* 첫 번째 행: 시간대별 예매 현황 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">24시간 예매 현황</h2>
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
                                    <AreaChart data={monthlyPatternData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">시간대별 상세 분석</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* 오전 시간대 */}
                            <div className="bg-blue-50 rounded-lg p-4">
                                <h3 className="font-semibold text-blue-900 mb-3">🌅 오전 시간대 (06:00-12:00)</h3>
                                <div className="space-y-2 text-sm text-blue-800">
                                    <p><span className="font-medium">피크 시간:</span> 11:00 (389건)</p>
                                    <p><span className="font-medium">특징:</span> 출근 시간대와 연관</p>
                                    <p><span className="font-medium">전략:</span> 모바일 최적화, 빠른 예매 프로세스</p>
                                </div>
                            </div>

                            {/* 오후 시간대 */}
                            <div className="bg-green-50 rounded-lg p-4">
                                <h3 className="font-semibold text-green-900 mb-3">☀️ 오후 시간대 (12:00-18:00)</h3>
                                <div className="space-y-2 text-sm text-green-800">
                                    <p><span className="font-medium">피크 시간:</span> 15:00 (589건)</p>
                                    <p><span className="font-medium">특징:</span> 점심시간 후, 업무 마무리</p>
                                    <p><span className="font-medium">전략:</span> 할인 혜택, 푸시 알림</p>
                                </div>
                            </div>

                            {/* 저녁 시간대 */}
                            <div className="bg-orange-50 rounded-lg p-4">
                                <h3 className="font-semibold text-orange-900 mb-3">🌙 저녁 시간대 (18:00-24:00)</h3>
                                <div className="space-y-2 text-sm text-orange-800">
                                    <p><span className="font-medium">피크 시간:</span> 19:00 (389건)</p>
                                    <p><span className="font-medium">특징:</span> 퇴근 후, 여가 시간</p>
                                    <p><span className="font-medium">전략:</span> 소셜미디어 마케팅, 추천 시스템</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 분석 인사이트 */}
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
                    </div>
                </div>
            </div>
        </div>
    );
};
