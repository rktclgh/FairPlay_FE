import React, { useState } from "react";
import { TopNav } from "../../components/TopNav";
import { AdminSideNav } from "../../components/AdminSideNav";

export const EventList: React.FC = () => {
    // 상태 관리
    const [searchName, setSearchName] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("전체");
    const [selectedStatus, setSelectedStatus] = useState<string>("전체");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);

    // 더미 데이터 정의
    const eventData = [
        {
            id: 1,
            name: "AI 혁신 포럼",
            category: "기술",
            registrationDate: "2024-12-01",
            eventPeriod: "2025.01.15 ~ 01.17",
            managerEmail: "ai@example.com",
            status: "진행중",
            statusColor: "bg-green-100",
            statusTextColor: "text-green-800"
        },
        {
            id: 2,
            name: "2025 테크 컨퍼런스",
            category: "기술",
            registrationDate: "2024-11-15",
            eventPeriod: "2025.02.20 ~ 02.22",
            managerEmail: "tech@example.com",
            status: "예정",
            statusColor: "bg-blue-100",
            statusTextColor: "text-blue-800"
        },
        {
            id: 3,
            name: "블록체인 컨퍼런스",
            category: "금융",
            registrationDate: "2024-10-20",
            eventPeriod: "2024.12.10 ~ 12.12",
            managerEmail: "blockchain@example.com",
            status: "종료됨",
            statusColor: "bg-gray-100",
            statusTextColor: "text-gray-800"
        },
        {
            id: 4,
            name: "디지털 마케팅 서밋",
            category: "마케팅",
            registrationDate: "2024-12-10",
            eventPeriod: "2025.03.15 ~ 03.17",
            managerEmail: "marketing@example.com",
            status: "예정",
            statusColor: "bg-blue-100",
            statusTextColor: "text-blue-800"
        },
        {
            id: 5,
            name: "스타트업 투자 페어",
            category: "비즈니스",
            registrationDate: "2024-09-25",
            eventPeriod: "2024.11.20 ~ 11.22",
            managerEmail: "startup@example.com",
            status: "종료됨",
            statusColor: "bg-gray-100",
            statusTextColor: "text-gray-800"
        },
        {
            id: 6,
            name: "클라우드 기술 컨퍼런스",
            category: "기술",
            registrationDate: "2024-11-30",
            eventPeriod: "2025.01.25 ~ 01.27",
            managerEmail: "cloud@example.com",
            status: "진행중",
            statusColor: "bg-green-100",
            statusTextColor: "text-green-800"
        },
        {
            id: 7,
            name: "모바일 앱 개발 워크샵",
            category: "기술",
            registrationDate: "2024-08-15",
            eventPeriod: "2024.10.15 ~ 10.17",
            managerEmail: "mobile@example.com",
            status: "종료됨",
            statusColor: "bg-gray-100",
            statusTextColor: "text-gray-800"
        },
        {
            id: 8,
            name: "데이터 사이언스 심포지엄",
            category: "기술",
            registrationDate: "2024-12-05",
            eventPeriod: "2025.02.10 ~ 02.12",
            managerEmail: "data@example.com",
            status: "예정",
            statusColor: "bg-blue-100",
            statusTextColor: "text-blue-800"
        },
        {
            id: 9,
            name: "UX/UI 디자인 컨퍼런스",
            category: "디자인",
            registrationDate: "2024-07-20",
            eventPeriod: "2024.09.25 ~ 09.27",
            managerEmail: "design@example.com",
            status: "종료됨",
            statusColor: "bg-gray-100",
            statusTextColor: "text-gray-800"
        },
        {
            id: 10,
            name: "게임 개발자 컨퍼런스",
            category: "게임",
            registrationDate: "2024-11-20",
            eventPeriod: "2025.03.05 ~ 03.07",
            managerEmail: "game@example.com",
            status: "예정",
            statusColor: "bg-blue-100",
            statusTextColor: "text-blue-800"
        },
        {
            id: 11,
            name: "보안 기술 컨퍼런스",
            category: "보안",
            registrationDate: "2024-12-15",
            eventPeriod: "2025.01.30 ~ 02.01",
            managerEmail: "security@example.com",
            status: "진행중",
            statusColor: "bg-green-100",
            statusTextColor: "text-green-800"
        },
        {
            id: 12,
            name: "IoT 혁신 엑스포",
            category: "기술",
            registrationDate: "2024-06-10",
            eventPeriod: "2024.08.15 ~ 08.17",
            managerEmail: "iot@example.com",
            status: "종료됨",
            statusColor: "bg-gray-100",
            statusTextColor: "text-gray-800"
        }
    ];

    // 카테고리 옵션
    const categories = ["전체", "기술", "마케팅", "금융", "비즈니스", "디자인", "게임", "보안"];

    // 행사 상태 옵션
    const statuses = ["전체", "예정", "진행중", "종료됨"];

    // 필터링된 데이터 생성
    const getFilteredData = () => {
        return eventData.filter(event => {
            const nameMatch = event.name.toLowerCase().includes(searchName.toLowerCase());
            const categoryMatch = selectedCategory === "전체" || event.category === selectedCategory;
            const statusMatch = selectedStatus === "전체" || event.status === selectedStatus;
            const startDateMatch = !startDate || event.registrationDate >= startDate;
            const endDateMatch = !endDate || event.registrationDate <= endDate;

            return nameMatch && categoryMatch && statusMatch && startDateMatch && endDateMatch;
        });
    };

    // 페이지당 항목 수
    const itemsPerPage = 10;
    const filteredData = getFilteredData();
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredData.slice(startIndex, endIndex);

    // 검색 초기화
    const handleReset = () => {
        setSearchName("");
        setSelectedCategory("전체");
        setSelectedStatus("전체");
        setStartDate("");
        setEndDate("");
        setCurrentPage(1);
    };

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

                        {/* 검색 버튼 */}
                        <div className="flex justify-end mt-4 space-x-3">
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
                            <div className="grid grid-cols-7 gap-4 text-sm font-bold text-gray-700">
                                <div className="text-left">행사명</div>
                                <div className="text-center">카테고리</div>
                                <div className="text-center">등록일</div>
                                <div className="text-center">행사 기간</div>
                                <div className="text-center">담당자 이메일</div>
                                <div className="text-center">상태</div>
                                <div className="text-center">관리</div>
                            </div>
                        </div>

                        {/* 테이블 바디 */}
                        <div>
                            {currentData.map((event, index) => (
                                <div
                                    key={event.id}
                                    className={`grid grid-cols-7 gap-4 py-5 px-6 text-sm items-center ${index !== currentData.length - 1 ? "border-b border-gray-200" : ""}`}
                                >
                                    <div className="font-bold text-gray-900 text-left truncate">{event.name}</div>
                                    <div className="text-gray-600 text-center">{event.category}</div>
                                    <div className="text-gray-600 text-center">{event.registrationDate}</div>
                                    <div className="text-gray-600 text-center">{event.eventPeriod}</div>
                                    <div className="text-gray-600 text-center truncate">{event.managerEmail}</div>
                                    <div className="text-center pl-4">
                                        <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${event.statusColor} ${event.statusTextColor}`}>
                                            {event.status}
                                        </span>
                                    </div>
                                    <div className="text-center pl-4">
                                        <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200">
                                            상세보기
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 페이지네이션 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                총 <span className="font-bold text-black">{filteredData.length}</span>개의 행사
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    className="px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(currentPage - 1)}
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
                                            onClick={() => setCurrentPage(page)}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    className="px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                >
                                    다음
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventList;
