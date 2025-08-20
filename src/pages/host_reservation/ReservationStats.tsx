import React from "react";
import { HostSideNav } from "../../components/HostSideNav";
import { TopNav } from "../../components/TopNav";
import { HiChevronDown } from 'react-icons/hi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const ReservationStats = () => {
    const [selectedPeriod, setSelectedPeriod] = React.useState('최근 7일');
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

    // 최근 7일 데이터 (7일간, 오른쪽이 당일)
    const weeklyData = [
        { date: '08/04', bookings: 145 },
        { date: '08/05', bookings: 167 },
        { date: '08/06', bookings: 134 },
        { date: '08/07', bookings: 189 },
        { date: '08/08', bookings: 156 },
        { date: '08/09', bookings: 123 },
        { date: '08/10', bookings: 121 },
    ];

    // 월별 데이터 (6개월간, 오른쪽이 이번달)
    const monthlyData = [
        { date: '03월', bookings: 2834 },
        { date: '04월', bookings: 3456 },
        { date: '05월', bookings: 2987 },
        { date: '06월', bookings: 4123 },
        { date: '07월', bookings: 3890 },
        { date: '08월', bookings: 4567 },
    ];

    // 년별 데이터 (최근 3년간)
    const yearlyData = [
        { date: '2022', bookings: 28456 },
        { date: '2023', bookings: 34789 },
        { date: '2024', bookings: 41234 },
    ];

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
        '최근 7일': weeklyData,
        '최근 30일': monthlyData,
        '최근 1년': yearlyData
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
                        {statsCards.map((card, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">{card.title}</h3>
                                <div className="flex items-baseline justify-between">
                                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                                    <span className={`text-sm font-medium ${card.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                        {card.change}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                            </div>
                        ))}
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
                                        {['최근 7일', '최근 30일', '최근 1년'].map((period) => (
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
                                        dataKey="bookings"
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
