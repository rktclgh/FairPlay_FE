import React from "react";
import { TopNav } from "../components/TopNav";
import { HostSideNav } from "../components/HostSideNav";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
const BookingTrendChart: React.FC = () => {
    const data = [
        { time: '09:00', bookings: 120 },
        { time: '10:00', bookings: 245 },
        { time: '11:00', bookings: 389 },
        { time: '12:00', bookings: 567 },
        { time: '13:00', bookings: 734 },
        { time: '14:00', bookings: 892 },
        { time: '15:00', bookings: 1023 },
        { time: '16:00', bookings: 1156 },
        { time: '17:00', bookings: 1208 },
        { time: '18:00', bookings: 1247 },
    ];

    const totalBookings = 1247;
    const totalSeats = 1500;
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
    const totalReservations = 1247;
    const checkedIn = 892;
    const notCheckedIn = totalReservations - checkedIn;
    const checkinRate = Math.round((checkedIn / totalReservations) * 100);

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] h-[1407px] relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    대시보드
                </div>

                {/* 사이드바 */}
                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px]">

                    {/* 통계 카드 섹션 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard title="행사명" value="2025 테크 컨퍼런스" />
                        <StatCard title="행사 일정" value="2024년 12월 15일~17일" />
                        <StatCard title="장소" value="코엑스 컨벤션센터 3층" />
                        <StatCard title="총 예약자 수" value="1,247" unit="명" />
                    </div>

                    {/* 첫 번째 행: 실시간 예매 현황 + 매출 요약 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* 실시간 예매 현황 */}
                        <BookingTrendChart />

                        {/* 매출 요약 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">매출 요약</h2>
                            <RevenueCard label="총 매출" amount="3,741,000" />
                            <RevenueCard label="예매 취소 금액" amount="1,250,000" isNegative />
                            <div className="border-t pt-4">
                                <RevenueCard label="순수익" amount="2,491,000" isProfit />
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
                                    <span>{checkedIn} / {totalReservations} 명</span>
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
                                    <span className="text-xl font-semibold text-emerald-500">{checkedIn}</span>
                                </div>
                                <div className="bg-red-50 rounded-lg p-4 flex justify-between items-center">
                                    <span className="text-sm text-gray-600">미체크인</span>
                                    <span className="text-xl font-semibold text-red-500">{notCheckedIn}</span>
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
                </div>
            </div>
        </div>
    );
};
