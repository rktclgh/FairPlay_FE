import React from "react";
import { HostSideNav } from "../../components/HostSideNav";
import { TopNav } from "../../components/TopNav";
import { HiChevronDown } from 'react-icons/hi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const ReservationStats = () => {
    const [selectedPeriod, setSelectedPeriod] = React.useState('주간');
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

    // 주간 데이터 (7일간, 오른쪽이 당일)
    const weeklyData = [
        { date: '08/04', bookings: 145 },
        { date: '08/05', bookings: 167 },
        { date: '08/06', bookings: 134 },
        { date: '08/07', bookings: 189 },
        { date: '08/08', bookings: 156 },
        { date: '08/09', bookings: 123 },
        { date: '08/10', bookings: 121 },
    ];

    // 월간 데이터 (5주간, 맨 끝이 08/10)
    const monthlyData = [
        { date: '07/06', bookings: 120 },
        { date: '07/13', bookings: 135 },
        { date: '07/20', bookings: 142 },
        { date: '07/27', bookings: 158 },
        { date: '08/10', bookings: 1035 }, // 08/04~08/10까지의 총 예약 수
    ];

    // 데이터 자동 계산 함수
    const calculatePeriodData = (period: string) => {
        let aggregatedData = [];
        let totalBookings = 0;

        if (period === '주간') {
            aggregatedData = weeklyData;
            totalBookings = weeklyData.reduce((sum, item) => sum + item.bookings, 0);
        } else if (period === '월간') {
            aggregatedData = monthlyData;
            totalBookings = monthlyData.reduce((sum, item) => sum + item.bookings, 0);
        }

        return { aggregatedData, totalBookings };
    };

    // 티켓 데이터 계산 함수
    const calculateTicketData = (totalBookings: number) => {
        const vipCount = Math.round(totalBookings * 0.15);
        const sCount = Math.round(totalBookings * 0.30);
        const rCount = totalBookings - vipCount - sCount;

        return [
            { name: 'VIP석', value: vipCount, percentage: 15, color: '#d97706' },
            { name: 'S석', value: sCount, percentage: 30, color: '#3730a3' },
            { name: 'R석', value: rCount, percentage: 55, color: '#065f46' },
        ];
    };

    // 통계 계산 함수
    const calculateStats = (totalBookings: number) => {
        const checkins = Math.round(totalBookings * 0.95);
        const cancellations = Math.round(totalBookings * 0.03);
        const noShows = Math.round(totalBookings * 0.02);

        return {
            totalBookings,
            checkins,
            cancellations,
            noShows,
            checkinRate: 95.0,
            cancellationRate: 3.0,
            noShowRate: 2.0,
            weekOverWeek: Math.round(Math.random() * 20) + 5
        };
    };

    // 기간별 데이터
    const periodData = {
        '주간': (() => {
            const { aggregatedData, totalBookings } = calculatePeriodData('주간');
            return {
                bookingData: aggregatedData,
                ticketData: calculateTicketData(totalBookings),
                stats: calculateStats(totalBookings)
            };
        })(),
        '월간': (() => {
            const { aggregatedData, totalBookings } = calculatePeriodData('월간');
            return {
                bookingData: aggregatedData,
                ticketData: calculateTicketData(totalBookings),
                stats: calculateStats(totalBookings)
            };
        })()
    };

    const currentData = periodData[selectedPeriod];
    const { bookingData, ticketData, stats } = currentData;

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] h-[1503px] relative">
                <TopNav className="!absolute !left-0 !top-0" />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    예약 통계 요약
                </div>

                {/* 사이드바 */}
                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px]">
                    {/* 기간 선택 드롭다운 */}
                    <div className="flex justify-end mb-6">
                        <div className="relative">
                            <div
                                className="w-[108px] h-[39px] bg-white rounded-md border border-solid border-gray-300 cursor-pointer flex items-center justify-between px-4"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-gray-700 text-sm leading-[21px] tracking-[0] whitespace-nowrap">
                                    {selectedPeriod}
                                </div>
                                <HiChevronDown className={`w-[11px] h-[7px] text-gray-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </div>

                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 mt-1 w-[108px] bg-white border border-gray-300 rounded-md shadow-lg z-10">
                                    {['주간', '월간'].map((period) => (
                                        <div
                                            key={period}
                                            className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 ${selectedPeriod === period ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                                                }`}
                                            onClick={() => {
                                                setSelectedPeriod(period);
                                                setIsDropdownOpen(false);
                                            }}
                                        >
                                            {period}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 통계 카드들 */}
                    <div className="grid grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="[font-family:'Roboto-Medium',Helvetica] font-medium text-gray-500 text-sm leading-[21px] tracking-[0] mb-3">
                                전체 예약 수
                            </div>
                            <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-900 text-[32px] leading-[48px] tracking-[0] mb-3">
                                {stats.totalBookings}
                            </div>
                            <div className="[font-family:'Roboto-Medium',Helvetica] font-medium text-emerald-500 text-xs tracking-[0] leading-[18px]">
                                +{stats.weekOverWeek}% 전주 대비
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="[font-family:'Roboto-Medium',Helvetica] font-medium text-gray-500 text-sm leading-[21px] tracking-[0] mb-3">
                                체크인 완료 수
                            </div>
                            <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-900 text-[32px] leading-[48px] tracking-[0] mb-3">
                                {stats.checkins}
                            </div>
                            <div className="[font-family:'Roboto-Medium',Helvetica] font-medium text-emerald-500 text-xs leading-[18px] tracking-[0]">
                                {stats.checkinRate}% 체크인율
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="[font-family:'Roboto-Medium',Helvetica] font-medium text-gray-500 text-sm leading-[21px] tracking-[0] mb-3">
                                예약 취소 수
                            </div>
                            <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-900 text-[32px] leading-[48px] tracking-[0] mb-3">
                                {stats.cancellations}
                            </div>
                            <div className="[font-family:'Roboto-Medium',Helvetica] font-medium text-red-500 text-xs leading-[18px] tracking-[0]">
                                {stats.cancellationRate}% 취소율
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="[font-family:'Roboto-Medium',Helvetica] font-medium text-gray-500 text-sm leading-[21px] tracking-[0] mb-3">
                                노쇼 추정 수
                            </div>
                            <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-900 text-[32px] leading-[48px] tracking-[0] mb-3">
                                {stats.noShows}
                            </div>
                            <div className="[font-family:'Roboto-Medium',Helvetica] font-medium text-amber-500 text-xs leading-[18px] tracking-[0]">
                                {stats.noShowRate}% 노쇼율
                            </div>
                        </div>
                    </div>

                    {/* 차트 섹션 */}
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        {/* 날짜별 예약 현황 차트 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-gray-900 text-lg leading-[27px] tracking-[0] mb-6">
                                날짜별 예약 현황
                            </h3>

                            <div className="h-[280px] flex justify-center">
                                <ResponsiveContainer width="95%" height="100%">
                                    <LineChart data={bookingData} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
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
                                            domain={[0, 'dataMax + 50']}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                            formatter={(value) => [`${value}건`, '예약 수']}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="bookings"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* 티켓명별 예약 비율 원형 차트 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-gray-900 text-lg leading-[27px] tracking-[0] mb-6">
                                티켓명별 예약 비율
                            </h3>

                            <div className="flex flex-col items-center">
                                {/* 원형 차트 */}
                                <div className="relative w-[180px] h-[180px] mb-6">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={ticketData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={2}
                                                dataKey="value"
                                            >
                                                {ticketData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                                }}
                                                formatter={(value, name) => [`${value}건`, name]}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>

                                    {/* 중앙 텍스트 */}
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                        <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-900 text-2xl leading-9">
                                            {stats.totalBookings}
                                        </div>
                                        <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-gray-500 text-xs leading-[18px]">
                                            총 예약
                                        </div>
                                    </div>
                                </div>

                                {/* 범례 */}
                                <div className="w-full space-y-3">
                                    {ticketData.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div
                                                    className="w-3 h-3 rounded-full mr-3"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                                <span className="[font-family:'Roboto-Regular',Helvetica] font-normal text-gray-700 text-sm">
                                                    {item.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="[font-family:'Roboto-Medium',Helvetica] font-medium text-gray-900 text-sm">
                                                    {item.value}건
                                                </span>
                                                <span className="[font-family:'Roboto-Regular',Helvetica] font-normal text-gray-500 text-xs">
                                                    {item.percentage}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 회차별 예약 통계 테이블 */}
                    <div className="bg-white rounded-lg shadow-md">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-gray-900 text-lg leading-[27px] tracking-[0]">
                                회차별 예약 통계
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-4 py-3 text-left [font-family:'Roboto-SemiBold',Helvetica] font-semibold text-gray-700 text-sm">
                                            회차 날짜/시간
                                        </th>
                                        <th className="px-4 py-3 text-left [font-family:'Roboto-SemiBold',Helvetica] font-semibold text-gray-700 text-sm">
                                            좌석 등급
                                        </th>
                                        <th className="px-4 py-3 text-left [font-family:'Roboto-SemiBold',Helvetica] font-semibold text-gray-700 text-sm">
                                            예약 수
                                        </th>
                                        <th className="px-4 py-3 text-left [font-family:'Roboto-SemiBold',Helvetica] font-semibold text-gray-700 text-sm">
                                            체크인 수
                                        </th>
                                        <th className="px-4 py-3 text-left [font-family:'Roboto-SemiBold',Helvetica] font-semibold text-gray-700 text-sm">
                                            취소 수
                                        </th>
                                        <th className="px-4 py-3 text-left [font-family:'Roboto-SemiBold',Helvetica] font-semibold text-gray-700 text-sm">
                                            노쇼 추정 수
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-200">
                                        <td className="px-4 py-4 [font-family:'Roboto-Regular',Helvetica] font-normal text-gray-900 text-sm">
                                            2024.12.10 14:30
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-xl text-xs font-medium">
                                                VIP석
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 [font-family:'Roboto-Medium',Helvetica] font-medium text-gray-900 text-sm">
                                            45
                                        </td>
                                        <td className="px-4 py-4 [font-family:'Roboto-Regular',Helvetica] font-normal text-gray-900 text-sm">
                                            42
                                        </td>
                                        <td className="px-4 py-4 [font-family:'Roboto-Regular',Helvetica] font-normal text-gray-900 text-sm">
                                            2
                                        </td>
                                        <td className="px-4 py-4 [font-family:'Roboto-Regular',Helvetica] font-normal text-gray-900 text-sm">
                                            1
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="px-4 py-4 [font-family:'Roboto-Regular',Helvetica] font-normal text-gray-900 text-sm">
                                            2024.12.10 19:00
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-xl text-xs font-medium">
                                                S석
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 [font-family:'Roboto-Medium',Helvetica] font-medium text-gray-900 text-sm">
                                            120
                                        </td>
                                        <td className="px-4 py-4 [font-family:'Roboto-Regular',Helvetica] font-normal text-gray-900 text-sm">
                                            115
                                        </td>
                                        <td className="px-4 py-4 [font-family:'Roboto-Regular',Helvetica] font-normal text-gray-900 text-sm">
                                            3
                                        </td>
                                        <td className="px-4 py-4 [font-family:'Roboto-Regular',Helvetica] font-normal text-gray-900 text-sm">
                                            2
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="px-4 py-4 [font-family:'Roboto-Regular',Helvetica] font-normal text-gray-900 text-sm">
                                            2024.12.11 14:30
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-xl text-xs font-medium">
                                                R석
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 [font-family:'Roboto-Medium',Helvetica] font-medium text-gray-900 text-sm">
                                            200
                                        </td>
                                        <td className="px-4 py-4 [font-family:'Roboto-Regular',Helvetica] font-normal text-gray-900 text-sm">
                                            185
                                        </td>
                                        <td className="px-4 py-4 [font-family:'Roboto-Regular',Helvetica] font-normal text-gray-900 text-sm">
                                            8
                                        </td>
                                        <td className="px-4 py-4 [font-family:'Roboto-Regular',Helvetica] font-normal text-gray-900 text-sm">
                                            7
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="px-4 py-4 [font-family:'Roboto-Regular',Helvetica] font-normal text-gray-900 text-sm">
                                            2024.12.11 19:00
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-xl text-xs font-medium">
                                                VIP석
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 [font-family:'Roboto-Medium',Helvetica] font-medium text-gray-900 text-sm">
                                            38
                                        </td>
                                        <td className="px-4 py-4 [font-family:'Roboto-Regular',Helvetica] font-normal text-gray-900 text-sm">
                                            35
                                        </td>
                                        <td className="px-4 py-4 [font-family:'Roboto-Regular',Helvetica] font-normal text-gray-900 text-sm">
                                            1
                                        </td>
                                        <td className="px-4 py-4 [font-family:'Roboto-Regular',Helvetica] font-normal text-gray-900 text-sm">
                                            2
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="px-4 py-4 [font-family:'Roboto-Regular',Helvetica] font-normal text-gray-900 text-sm">
                                            2024.12.12 14:30
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-xl text-xs font-medium">
                                                S석
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 [font-family:'Roboto-Medium',Helvetica] font-medium text-gray-900 text-sm">
                                            95
                                        </td>
                                        <td className="px-4 py-4 [font-family:'Roboto-Regular',Helvetica] font-normal text-gray-900 text-sm">
                                            88
                                        </td>
                                        <td className="px-4 py-4 [font-family:'Roboto-Regular',Helvetica] font-normal text-gray-900 text-sm">
                                            4
                                        </td>
                                        <td className="px-4 py-4 [font-family:'Roboto-Regular',Helvetica] font-normal text-gray-900 text-sm">
                                            3
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="px-4 py-4 [font-family:'Roboto-Regular',Helvetica] font-normal text-gray-900 text-sm">
                                            2024.12.12 19:00
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-xl text-xs font-medium">
                                                R석
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 [font-family:'Roboto-Medium',Helvetica] font-medium text-gray-900 text-sm">
                                            180
                                        </td>
                                        <td className="px-4 py-4 [font-family:'Roboto-Regular',Helvetica] font-normal text-gray-900 text-sm">
                                            170
                                        </td>
                                        <td className="px-4 py-4 [font-family:'Roboto-Regular',Helvetica] font-normal text-gray-900 text-sm">
                                            5
                                        </td>
                                        <td className="px-4 py-4 [font-family:'Roboto-Regular',Helvetica] font-normal text-gray-900 text-sm">
                                            5
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-sm">
                            <span className="[font-family:'Roboto-Regular',Helvetica] font-normal text-gray-500">
                                총 6개 회차
                            </span>
                            <div className="flex space-x-6">
                                <span className="[font-family:'Roboto-Medium',Helvetica] font-medium text-gray-700">
                                    총 예약: {stats.totalBookings}건
                                </span>
                                <span className="[font-family:'Roboto-Medium',Helvetica] font-medium text-gray-700">
                                    총 체크인: {stats.checkins}건
                                </span>
                                <span className="[font-family:'Roboto-Medium',Helvetica] font-medium text-gray-700">
                                    총 취소: {stats.cancellations}건
                                </span>
                                <span className="[font-family:'Roboto-Medium',Helvetica] font-medium text-gray-700">
                                    총 노쇼: {stats.noShows}건
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
