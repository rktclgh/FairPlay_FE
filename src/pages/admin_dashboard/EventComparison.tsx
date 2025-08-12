import React, { useState } from "react";
import { TopNav } from "../../components/TopNav";
import { AdminSideNav } from "../../components/AdminSideNav";
import "./EventComparison.css";

export const EventComparison: React.FC = () => {
    // 상태 관리
    const [selectedStatus, setSelectedStatus] = useState<string>("전체");
    const [sortField, setSortField] = useState<string>("totalRevenue");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    // 더미 데이터 정의
    const eventData = [
        {
            id: 1,
            name: "AI 혁신 포럼",
            userCount: 1250,
            totalReservations: 1180,
            totalRevenue: 71560000,
            cancellationRate: 5.6,
            eventPeriod: "2025.01.15 ~ 01.17",
            status: "진행중",
            statusColor: "bg-green-100",
            statusTextColor: "text-green-800"
        },
        {
            id: 2,
            name: "2025 테크 컨퍼런스",
            userCount: 890,
            totalReservations: 820,
            totalRevenue: 45600000,
            cancellationRate: 7.9,
            eventPeriod: "2025.02.20 ~ 02.22",
            status: "예정",
            statusColor: "bg-blue-100",
            statusTextColor: "text-blue-800"
        },
        {
            id: 3,
            name: "블록체인 컨퍼런스",
            userCount: 650,
            totalReservations: 580,
            totalRevenue: 36150000,
            cancellationRate: 10.8,
            eventPeriod: "2024.12.10 ~ 12.12",
            status: "종료됨",
            statusColor: "bg-gray-100",
            statusTextColor: "text-gray-800"
        },
        {
            id: 4,
            name: "디지털 마케팅 서밋",
            userCount: 980,
            totalReservations: 920,
            totalRevenue: 52800000,
            cancellationRate: 6.1,
            eventPeriod: "2025.03.15 ~ 03.17",
            status: "예정",
            statusColor: "bg-blue-100",
            statusTextColor: "text-blue-800"
        },
        {
            id: 5,
            name: "스타트업 투자 페어",
            userCount: 750,
            totalReservations: 680,
            totalRevenue: 38900000,
            cancellationRate: 9.3,
            eventPeriod: "2024.11.20 ~ 11.22",
            status: "종료됨",
            statusColor: "bg-gray-100",
            statusTextColor: "text-gray-800"
        },
        {
            id: 6,
            name: "클라우드 기술 컨퍼런스",
            userCount: 1100,
            totalReservations: 1050,
            totalRevenue: 62300000,
            cancellationRate: 4.5,
            eventPeriod: "2025.01.25 ~ 01.27",
            status: "진행중",
            statusColor: "bg-green-100",
            statusTextColor: "text-green-800"
        },
        {
            id: 7,
            name: "모바일 앱 개발 워크샵",
            userCount: 420,
            totalReservations: 380,
            totalRevenue: 21500000,
            cancellationRate: 9.5,
            eventPeriod: "2024.10.15 ~ 10.17",
            status: "종료됨",
            statusColor: "bg-gray-100",
            statusTextColor: "text-gray-800"
        },
        {
            id: 8,
            name: "데이터 사이언스 심포지엄",
            userCount: 680,
            totalReservations: 620,
            totalRevenue: 34200000,
            cancellationRate: 8.8,
            eventPeriod: "2025.02.10 ~ 02.12",
            status: "예정",
            statusColor: "bg-blue-100",
            statusTextColor: "text-blue-800"
        },
        {
            id: 9,
            name: "UX/UI 디자인 컨퍼런스",
            userCount: 520,
            totalReservations: 480,
            totalRevenue: 28900000,
            cancellationRate: 7.7,
            eventPeriod: "2024.09.25 ~ 09.27",
            status: "종료됨",
            statusColor: "bg-gray-100",
            statusTextColor: "text-gray-800"
        },
        {
            id: 10,
            name: "게임 개발자 컨퍼런스",
            userCount: 850,
            totalReservations: 790,
            totalRevenue: 45600000,
            cancellationRate: 7.1,
            eventPeriod: "2025.03.05 ~ 03.07",
            status: "예정",
            statusColor: "bg-blue-100",
            statusTextColor: "text-blue-800"
        },
        {
            id: 11,
            name: "보안 기술 컨퍼런스",
            userCount: 720,
            totalReservations: 680,
            totalRevenue: 39800000,
            cancellationRate: 5.6,
            eventPeriod: "2025.01.30 ~ 02.01",
            status: "진행중",
            statusColor: "bg-green-100",
            statusTextColor: "text-green-800"
        },
        {
            id: 12,
            name: "IoT 혁신 엑스포",
            userCount: 580,
            totalReservations: 540,
            totalRevenue: 31200000,
            cancellationRate: 6.9,
            eventPeriod: "2024.08.15 ~ 08.17",
            status: "종료됨",
            statusColor: "bg-gray-100",
            statusTextColor: "text-gray-800"
        }
    ];

    // 정렬 함수
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
    };

    // 정렬된 데이터 생성
    const getSortedData = () => {
        const filteredData = eventData.filter(event => {
            if (selectedStatus === "전체") return true;
            return event.status === selectedStatus;
        });

        return filteredData.sort((a, b) => {
            let aValue: string | number;
            let bValue: string | number;

            switch (sortField) {
                case "name":
                    aValue = a.name;
                    bValue = b.name;
                    break;
                case "userCount":
                    aValue = a.userCount;
                    bValue = b.userCount;
                    break;
                case "totalReservations":
                    aValue = a.totalReservations;
                    bValue = b.totalReservations;
                    break;
                case "totalRevenue":
                    aValue = a.totalRevenue;
                    bValue = b.totalRevenue;
                    break;
                case "cancellationRate":
                    aValue = a.cancellationRate;
                    bValue = b.cancellationRate;
                    break;
                case "eventPeriod":
                    aValue = a.eventPeriod;
                    bValue = b.eventPeriod;
                    break;
                default:
                    aValue = a.name;
                    bValue = b.name;
            }

            if (sortDirection === "asc") {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    행사별 비교
                </div>

                {/* 사이드바 */}
                <AdminSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20 space-y-6">
                    {/* 카드 1: 행사 상태 필터 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">행사 상태</h3>
                            <div className="radio-buttons-container">
                                <div className="radio-button">
                                    <input
                                        type="radio"
                                        id="all"
                                        name="status"
                                        value="전체"
                                        checked={selectedStatus === "전체"}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="radio-button__input"
                                    />
                                    <label htmlFor="all" className="radio-button__label">
                                        <span className="radio-button__custom"></span>
                                        전체
                                    </label>
                                </div>
                                <div className="radio-button">
                                    <input
                                        type="radio"
                                        id="ongoing"
                                        name="status"
                                        value="진행중"
                                        checked={selectedStatus === "진행중"}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="radio-button__input"
                                    />
                                    <label htmlFor="ongoing" className="radio-button__label">
                                        <span className="radio-button__custom"></span>
                                        진행중
                                    </label>
                                </div>
                                <div className="radio-button">
                                    <input
                                        type="radio"
                                        id="scheduled"
                                        name="status"
                                        value="예정"
                                        checked={selectedStatus === "예정"}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="radio-button__input"
                                    />
                                    <label htmlFor="scheduled" className="radio-button__label">
                                        <span className="radio-button__custom"></span>
                                        예정
                                    </label>
                                </div>
                                <div className="radio-button">
                                    <input
                                        type="radio"
                                        id="completed"
                                        name="status"
                                        value="종료됨"
                                        checked={selectedStatus === "종료됨"}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="radio-button__input"
                                    />
                                    <label htmlFor="completed" className="radio-button__label">
                                        <span className="radio-button__custom"></span>
                                        종료됨
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 카드 2: 행사 목록 테이블 */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* 테이블 헤더 */}
                        <div className="bg-gray-50 border-b border-gray-200 py-4 px-6">
                            <div className="grid grid-cols-7 gap-2 text-sm font-bold text-gray-700" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr' }}>
                                <div
                                    className="text-left cursor-pointer hover:text-blue-600 transition-colors flex items-center"
                                    onClick={() => handleSort("name")}
                                >
                                    행사명
                                    {sortField === "name" && (
                                        <span className="ml-1 text-blue-600">
                                            {sortDirection === "asc" ? "↑" : "↓"}
                                        </span>
                                    )}
                                </div>
                                <div
                                    className="text-center cursor-pointer hover:text-blue-600 transition-colors flex items-center justify-center"
                                    onClick={() => handleSort("userCount")}
                                >
                                    사용자 수
                                    {sortField === "userCount" && (
                                        <span className="ml-1 text-blue-600">
                                            {sortDirection === "asc" ? "↑" : "↓"}
                                        </span>
                                    )}
                                </div>
                                <div
                                    className="text-center cursor-pointer hover:text-blue-600 transition-colors flex items-center justify-center"
                                    onClick={() => handleSort("totalReservations")}
                                >
                                    총 예약 수
                                    {sortField === "totalReservations" && (
                                        <span className="ml-1 text-blue-600">
                                            {sortDirection === "asc" ? "↑" : "↓"}
                                        </span>
                                    )}
                                </div>
                                <div
                                    className="text-center cursor-pointer hover:text-blue-600 transition-colors flex items-center justify-center"
                                    onClick={() => handleSort("totalRevenue")}
                                >
                                    총 매출
                                    {sortField === "totalRevenue" && (
                                        <span className="ml-1 text-blue-600">
                                            {sortDirection === "asc" ? "↑" : "↓"}
                                        </span>
                                    )}
                                </div>
                                <div
                                    className="text-center cursor-pointer hover:text-blue-600 transition-colors flex items-center justify-center"
                                    onClick={() => handleSort("cancellationRate")}
                                >
                                    취소율
                                    {sortField === "cancellationRate" && (
                                        <span className="ml-1 text-blue-600">
                                            {sortDirection === "asc" ? "↑" : "↓"}
                                        </span>
                                    )}
                                </div>
                                <div
                                    className="text-center cursor-pointer hover:text-blue-600 transition-colors flex items-center justify-center"
                                    onClick={() => handleSort("eventPeriod")}
                                >
                                    행사기간
                                    {sortField === "eventPeriod" && (
                                        <span className="ml-1 text-blue-600">
                                            {sortDirection === "asc" ? "↑" : "↓"}
                                        </span>
                                    )}
                                </div>
                                <div className="text-center">상태</div>
                            </div>
                        </div>

                        {/* 테이블 바디 */}
                        <div>
                            {getSortedData().map((event, index, sortedData) => (
                                <div
                                    key={event.id}
                                    className={`grid grid-cols-7 gap-2 py-5 px-6 text-sm items-center ${index !== sortedData.length - 1 ? "border-b border-gray-200" : ""}`}
                                    style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr' }}
                                >
                                    <div className="font-bold text-gray-900 text-left truncate flex items-center gap-2">
                                        {event.name}
                                        {event.totalRevenue === Math.max(...eventData.map(e => e.totalRevenue)) && (
                                            <span className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">HOT</span>
                                        )}
                                    </div>
                                    <div className="text-gray-600 text-center">{event.userCount.toLocaleString()}</div>
                                    <div className="text-gray-600 text-center">{event.totalReservations.toLocaleString()}</div>
                                    <div className="font-bold text-gray-900 text-center">₩{event.totalRevenue.toLocaleString()}</div>
                                    <div className="text-center text-gray-600">{event.cancellationRate}%</div>
                                    <div className="text-center text-gray-600">{event.eventPeriod}</div>
                                    <div className="text-center">
                                        <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${event.statusColor} ${event.statusTextColor}`}>
                                            {event.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 페이지네이션 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                총 <span className="font-bold text-black">{
                                    eventData.filter(event => {
                                        if (selectedStatus === "전체") return true;
                                        return event.status === selectedStatus;
                                    }).length
                                }</span>개의 행사
                            </div>
                            <div className="flex items-center space-x-2">
                                <button className="px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                    이전
                                </button>
                                <div className="flex space-x-1">
                                    <button className="px-3 py-2 text-sm text-white bg-blue-600 border border-blue-600 rounded-md">1</button>
                                    <button className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">2</button>
                                    <button className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">3</button>
                                    <button className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">4</button>
                                    <button className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">5</button>
                                </div>
                                <button className="px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                                    다음
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 카드 3: 상위 실적 행사 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">상위 실적 행사</h3>
                            <p className="text-sm text-gray-600">매출 기준 상위 3개 행사</p>
                        </div>

                        <div className="space-y-4">
                            {eventData
                                .sort((a, b) => b.totalRevenue - a.totalRevenue)
                                .slice(0, 3)
                                .map((event, index) => {
                                    const maxRevenue = Math.max(...eventData.map(e => e.totalRevenue));
                                    const revenuePercentage = (event.totalRevenue / maxRevenue) * 100;
                                    const rankColors = ['bg-red-500', 'bg-orange-500', 'bg-green-500'];

                                    return (
                                        <div key={event.id} className="flex items-center space-x-4">
                                            <div className={`w-8 h-8 ${rankColors[index]} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="text-sm font-medium text-gray-900">{event.name}</span>
                                                    {index === 0 && (
                                                        <span className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">HOT</span>
                                                    )}
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`${rankColors[index]} h-2 rounded-full`}
                                                        style={{ width: `${revenuePercentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-semibold text-gray-900">₩{event.totalRevenue.toLocaleString()}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>

                        {/* 요약 통계 */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">6,638</div>
                                    <div className="text-sm text-gray-600">총 등록 사용자</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">5,094</div>
                                    <div className="text-sm text-gray-600">총 예약 수</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">₩215,350,000</div>
                                    <div className="text-sm text-gray-600">총 매출</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventComparison;
