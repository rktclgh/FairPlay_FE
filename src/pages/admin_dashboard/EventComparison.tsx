import React, { useState, useEffect, useCallback } from "react";
import { TopNav } from "../../components/TopNav";
import { AdminSideNav } from "../../components/AdminSideNav";
import { adminStatisticsService, type EventCompareDto, type PageableResponse } from "../../services/adminStatistics.service";
import "./EventComparison.css";

interface EventData {
    id: number;
    name: string;
    userCount: number;
    totalReservations: number;
    totalRevenue: number;
    cancellationRate: number;
    eventPeriod: string;
    status: string;
    statusColor: string;
    statusTextColor: string;
}

export const EventComparison: React.FC = () => {
    // 상태 관리
    const [selectedStatus, setSelectedStatus] = useState<string>("전체");
    const [sortField, setSortField] = useState<string>("totalRevenue");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [eventData, setEventData] = useState<EventData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    
    // 페이징 상태
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalElements, setTotalElements] = useState<number>(0);
    const [pageSize] = useState<number>(5);

    // 백엔드 데이터를 프론트엔드 형식으로 변환
    const transformEventData = (apiData: EventCompareDto[]): EventData[] => {
        return apiData.map((event, index) => {
            // status 숫자를 텍스트로 변환 (예: 1=예정, 2=진행중, 3=종료됨)
            let statusText = "알 수 없음";
            let statusColor = "bg-gray-100";
            let statusTextColor = "text-gray-800";

            switch (event.status) {
                case 1:
                    statusText = "예정";
                    statusColor = "bg-blue-100";
                    statusTextColor = "text-blue-800";
                    break;
                case 2:
                    statusText = "진행중";
                    statusColor = "bg-green-100";
                    statusTextColor = "text-green-800";
                    break;
                case 3:
                    statusText = "종료됨";
                    statusColor = "bg-gray-100";
                    statusTextColor = "text-gray-800";
                    break;
            }

            return {
                id: index + 1,
                name: event.eventName,
                userCount: event.userCount,
                totalReservations: event.reservationCount,
                totalRevenue: event.totalRevenue,
                cancellationRate: Math.round(event.cancelRate * 100 * 100) / 100, // 소수점 2자리로 변환
                eventPeriod: `${event.startDate} ~ ${event.endDate}`,
                status: statusText,
                statusColor,
                statusTextColor
            };
        });
    };

    // 데이터 로드
    const loadEventData = useCallback(async (page: number = 0) => {
        try {
            setLoading(true);
            const response = await adminStatisticsService.getEventComparison(page, pageSize);
            console.log('백엔드에서 받은 데이터:', response);
            
            // 페이징 정보 업데이트 (response는 PageableResponse 객체)
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
            
            // 데이터 변환 (response.content가 EventCompareDto 배열)
            const transformedData = transformEventData(response.content);
            setEventData(transformedData);
        } catch (err) {
            console.error('이벤트 비교 데이터 로드 실패:', err);
            // 실패시 빈 배열로 설정
            setEventData([]);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    }, [pageSize]);

    useEffect(() => {
        loadEventData(currentPage);
    }, [currentPage, loadEventData]);


    // 정렬 함수
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
    };

    // 정렬된 데이터 반환
    const getSortedData = () => {
        const filteredData = eventData.filter(event => {
            if (selectedStatus === "전체") return true;
            return event.status === selectedStatus;
        });

        return filteredData.sort((a, b) => {
            const aValue = a[sortField as keyof EventData];
            const bValue = b[sortField as keyof EventData];

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
            }

            const aStr = String(aValue).toLowerCase();
            const bStr = String(bValue).toLowerCase();
            return sortDirection === "asc" 
                ? aStr.localeCompare(bStr) 
                : bStr.localeCompare(aStr);
        });
    };

    // 페이지 변경 핸들러
    const handlePageChange = (page: number) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page);
        }
    };

    // 페이지 번호 배열 생성
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
        
        // 시작 페이지 조정
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(0, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };
    if (loading) {
        return (
            <div className="bg-white flex flex-row justify-center w-full">
                <div className="bg-white w-[1256px] min-h-screen relative">
                    <TopNav />
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <span className="ml-4 text-gray-600">데이터를 불러오는 중...</span>
                    </div>
                </div>
            </div>
        );
    }

    

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
                                총 <span className="font-bold text-black">{totalElements}</span>개의 행사
                                {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)} 표시
                            </div>
                            <div className="flex items-center space-x-2">
                                <button 
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 0}
                                    className="px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    이전
                                </button>
                                <div className="flex space-x-1">
                                    {getPageNumbers().map(pageNum => (
                                        <button 
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-3 py-2 text-sm rounded-md ${
                                                currentPage === pageNum 
                                                    ? 'text-white bg-blue-600 border border-blue-600' 
                                                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {pageNum + 1}
                                        </button>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage >= totalPages - 1}
                                    className="px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
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
                                    <div className="text-2xl font-bold text-gray-900">
                                        {eventData.reduce((total, event) => total + event.userCount, 0).toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-600">총 등록 사용자</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {eventData.reduce((total, event) => total + event.totalReservations, 0).toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-600">총 예약 수</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        ₩{eventData.reduce((total, event) => total + event.totalRevenue, 0).toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-600">총 매출액</div>
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
