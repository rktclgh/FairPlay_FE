import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TopNav } from "../../components/TopNav";
import { AdminSideNav } from "../../components/AdminSideNav";
import { eventAPI } from "../../services/event";
import type { EventSummaryDto } from "../../services/types/eventType";

export const EventList: React.FC = () => {
    const navigate = useNavigate();

    // 상태 관리
    const [searchName, setSearchName] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("전체");
    const [selectedStatus, setSelectedStatus] = useState<string>("전체");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [eventData, setEventData] = useState<EventSummaryDto[]>([]);
    const [totalElements, setTotalElements] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);

    // 카테고리 옵션
    const categories = ["전체", "박람회", "강연/세미나", "전시/행사", "공연", "축제"];

    // 행사 상태 옵션
    const statuses = ["전체", "예정", "진행중", "종료됨"];

    // 카테고리 이름을 ID로 매핑
    const mapCategoryToId = (categoryName: string): number | undefined => {
        switch (categoryName) {
            case "박람회": return 1;
            case "강연/세미나": return 2;
            case "전시/행사": return 3;
            case "공연": return 4;
            case "축제": return 5;
            default: return undefined;
        }
    };



    // 행사 목록 조회
    const fetchEvents = async () => {
        try {
            setLoading(true);
            const params: {
                keyword?: string;
                mainCategoryId?: number;
                fromDate?: string;
                toDate?: string;
                page?: number;
                size?: number;
            } = {
                page: currentPage - 1, // API는 0부터 시작
                size: 10,
            };

            if (searchName) {
                params.keyword = searchName;
            }

            if (selectedCategory !== "전체") {
                params.mainCategoryId = mapCategoryToId(selectedCategory);
            }

            if (startDate) {
                params.fromDate = startDate;
            }

            if (endDate) {
                params.toDate = endDate;
            }

            const response = await eventAPI.getEventList(params);
            setEventData(response.events || []);
            setTotalElements(response.totalElements || 0);
            setTotalPages(response.totalPages || 0);
        } catch (error) {
            console.error('행사 목록 조회 실패:', error);
            setEventData([]);
            setTotalElements(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };



    // 검색 초기화
    const handleReset = () => {
        setSearchName("");
        setSelectedCategory("전체");
        setSelectedStatus("전체");
        setStartDate("");
        setEndDate("");
        setCurrentPage(1);
        fetchEvents();
    };

    // 행사명 클릭 시 이벤트 디테일 페이지로 이동
    const handleEventClick = (eventId: number) => {
        navigate(`/eventdetail/${eventId}`);
    };

    // 페이지 변경
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        fetchEvents();
    }, [currentPage]);

    // 검색 조건 변경 시 자동 검색
    useEffect(() => {
        if (currentPage === 1) {
            fetchEvents();
        }
    }, [selectedCategory, selectedStatus, searchName, startDate, endDate]);

    // 현재 페이지 데이터
    const currentData = eventData;

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    행사 목록
                </div>

                {/* 사이드바 */}
                <AdminSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20 space-y-6">
                    {/* 카드 1: 검색 필터 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">검색 조건</h3>
                        </div>
                        <div className="grid grid-cols-5 gap-4" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr' }}>
                            {/* 행사명 검색 */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">행사명</label>
                                <input
                                    type="text"
                                    placeholder="행사명을 입력하세요"
                                    value={searchName}
                                    onChange={(e) => setSearchName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                            </div>

                            {/* 카테고리 드롭다운 */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">카테고리</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                >
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>

                            {/* 행사 상태 드롭다운 */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">행사 상태</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                >
                                    {statuses.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>

                            {/* 시작일 */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">시작일</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                            </div>

                            {/* 종료일 */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">종료일</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                            </div>
                        </div>

                        {/* 초기화 버튼 */}
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={handleReset}
                                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-[10px] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                초기화
                            </button>
                        </div>
                    </div>

                    {/* 카드 2: 행사 목록 테이블 */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* 테이블 헤더 */}
                        <div className="bg-gray-50 border-b border-gray-200 py-4 px-6">
                            <div className="grid grid-cols-6 gap-4 text-sm font-bold text-gray-700" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr 1fr 1fr' }}>
                                <div className="text-left">행사명</div>
                                <div className="text-center">카테고리</div>
                                <div className="text-center">등록일</div>
                                <div className="text-center">행사 기간</div>
                                <div className="text-center">지역</div>
                                <div className="text-center">상태</div>
                            </div>
                        </div>

                        {/* 테이블 바디 */}
                        <div>
                            {loading ? (
                                <div className="py-8 text-center text-gray-500">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                    데이터를 불러오는 중...
                                </div>
                            ) : currentData.length === 0 ? (
                                <div className="py-8 text-center text-gray-500">
                                    검색 조건에 맞는 행사가 없습니다.
                                </div>
                            ) : (
                                currentData.map((event, index) => (
                                    <div
                                        key={event.id}
                                        className={`grid grid-cols-6 gap-4 py-5 px-6 text-sm items-center ${index !== currentData.length - 1 ? "border-b border-gray-200" : ""}`}
                                        style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr 1fr 1fr' }}
                                    >
                                        <div
                                            className="font-bold text-black text-left cursor-pointer hover:text-gray-700 hover:underline truncate"
                                            onClick={() => handleEventClick(event.id)}
                                        >
                                            {event.title}
                                        </div>
                                        <div className="text-gray-600 text-center">{event.mainCategory}</div>
                                        <div className="text-gray-600 text-center">
                                            {/* 임시로 현재 날짜 표시, 추후 API에서 createdAt 필드가 오면 교체 */}
                                            {new Date().toLocaleDateString('ko-KR')}
                                        </div>
                                        <div className="text-gray-600 text-center">
                                            {event.startDate && event.endDate
                                                ? `${new Date(event.startDate).toLocaleDateString('ko-KR')} ~ ${new Date(event.endDate).toLocaleDateString('ko-KR')}`
                                                : '-'
                                            }
                                        </div>
                                        <div className="text-gray-600 text-center truncate">
                                            {event.region || '-'}
                                        </div>
                                        <div className="text-center">
                                            <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${new Date(event.startDate) > new Date()
                                                ? 'bg-blue-100 text-blue-800' // 예정
                                                : new Date(event.endDate) < new Date()
                                                    ? 'bg-gray-100 text-gray-800' // 종료됨
                                                    : 'bg-green-100 text-green-800' // 진행중
                                                }`}>
                                                {new Date(event.startDate) > new Date() ? '예정' :
                                                    new Date(event.endDate) < new Date() ? '종료됨' : '진행중'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* 페이지네이션 */}
                    {totalPages > 1 && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    총 <span className="font-bold text-black">{totalElements}</span>개의 행사
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        className="px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={currentPage === 1}
                                        onClick={() => handlePageChange(currentPage - 1)}
                                    >
                                        이전
                                    </button>
                                    <div className="flex space-x-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                className={`px-3 py-2 text-sm border rounded-md ${currentPage === page
                                                    ? "text-white bg-blue-600 border-blue-600"
                                                    : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                                                    }`}
                                                onClick={() => handlePageChange(page)}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        className="px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={currentPage === totalPages}
                                        onClick={() => handlePageChange(currentPage + 1)}
                                    >
                                        다음
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventList;
