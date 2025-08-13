import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TopNav } from "../../components/TopNav";
import { AdminSideNav } from "../../components/AdminSideNav";

// 임시 데이터 타입 정의
interface EventEditRequest {
    id: number;
    requestDate: string;
    eventName: string;
    eventPeriod: {
        startDate: string;
        endDate: string;
    };
    manager: string;
    contact: string;
    status: '대기' | '승인' | '반려';
}

export const EventEditRequests: React.FC = () => {
    const navigate = useNavigate();

    // 상태 관리
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [loading] = useState<boolean>(false);
    const [totalElements, setTotalElements] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);

    // 임시 더미 데이터
    const [eventData] = useState<EventEditRequest[]>([
        {
            id: 1,
            requestDate: '2025-01-15',
            eventName: '2025 서울 국제 박람회',
            eventPeriod: { startDate: '2025-03-15', endDate: '2025-03-20' },
            manager: '김철수',
            contact: '010-1234-5678',
            status: '대기'
        },
        {
            id: 2,
            requestDate: '2025-01-14',
            eventName: 'AI 기술 컨퍼런스 2025',
            eventPeriod: { startDate: '2025-04-10', endDate: '2025-04-12' },
            manager: '이영희',
            contact: '010-2345-6789',
            status: '승인'
        },
        {
            id: 3,
            requestDate: '2025-01-13',
            eventName: '부산 해양 축제',
            eventPeriod: { startDate: '2025-07-20', endDate: '2025-07-25' },
            manager: '박민수',
            contact: '010-3456-7890',
            status: '반려'
        },
        {
            id: 4,
            requestDate: '2025-01-12',
            eventName: '전시회: 미래 도시',
            eventPeriod: { startDate: '2025-05-01', endDate: '2025-05-10' },
            manager: '최지영',
            contact: '010-4567-8901',
            status: '대기'
        },
        {
            id: 5,
            requestDate: '2025-01-11',
            eventName: '클래식 음악 페스티벌',
            eventPeriod: { startDate: '2025-06-15', endDate: '2025-06-20' },
            manager: '정수민',
            contact: '010-5678-9012',
            status: '승인'
        },
        {
            id: 6,
            requestDate: '2025-01-10',
            eventName: '스타트업 데모데이',
            eventPeriod: { startDate: '2025-08-05', endDate: '2025-08-07' },
            manager: '한동훈',
            contact: '010-6789-0123',
            status: '대기'
        },
        {
            id: 7,
            requestDate: '2025-01-09',
            eventName: '환경 보호 세미나',
            eventPeriod: { startDate: '2025-09-10', endDate: '2025-09-12' },
            manager: '윤서연',
            contact: '010-7890-1234',
            status: '승인'
        },
        {
            id: 8,
            requestDate: '2025-01-08',
            eventName: '게임 개발자 컨퍼런스',
            eventPeriod: { startDate: '2025-10-20', endDate: '2025-10-22' },
            manager: '강현우',
            contact: '010-8901-2345',
            status: '대기'
        },
        {
            id: 9,
            requestDate: '2025-01-07',
            eventName: '요리 챔피언십',
            eventPeriod: { startDate: '2025-11-15', endDate: '2025-11-17' },
            manager: '임하나',
            contact: '010-9012-3456',
            status: '반려'
        },
        {
            id: 10,
            requestDate: '2025-01-06',
            eventName: '디자인 워크샵',
            eventPeriod: { startDate: '2025-12-01', endDate: '2025-12-05' },
            manager: '송태호',
            contact: '010-0123-4567',
            status: '대기'
        }
    ]);

    // 페이지당 항목 수
    const itemsPerPage = 10;

    // 현재 페이지 데이터 계산
    const currentData = eventData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // 총 페이지 수 계산
    useEffect(() => {
        setTotalElements(eventData.length);
        setTotalPages(Math.ceil(eventData.length / itemsPerPage));
    }, [eventData]);

    // 페이지 변경
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // 상세보기 클릭
    const handleDetailClick = (eventId: number) => {
        navigate(`/admin_dashboard/event-edit-requests/${eventId}`);
    };

    // 상태별 색상
    const getStatusColor = (status: string) => {
        switch (status) {
            case '대기':
                return 'bg-yellow-100 text-yellow-800';
            case '승인':
                return 'bg-green-100 text-green-800';
            case '반려':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    행사 수정 요청
                </div>

                {/* 사이드바 */}
                <AdminSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20 space-y-6">
                    {/* 행사 수정 요청 목록 테이블 */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* 테이블 헤더 */}
                        <div className="bg-gray-50 border-b border-gray-200 py-4 px-6">
                            <div className="grid grid-cols-7 gap-4 text-sm font-bold text-gray-700" style={{ gridTemplateColumns: '1fr 2fr 1.5fr 1fr 1.5fr 1fr 1fr' }}>
                                <div className="text-center">신청일</div>
                                <div className="text-center">행사명(국문)</div>
                                <div className="text-center">행사기간</div>
                                <div className="text-center">담당자</div>
                                <div className="text-center">연락처</div>
                                <div className="text-center">상태</div>
                                <div className="text-center">처리</div>
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
                                    수정 요청 대기 중인 행사가 없습니다.
                                </div>
                            ) : (
                                currentData.map((event, index) => (
                                    <div
                                        key={event.id}
                                        className={`grid grid-cols-7 gap-4 py-5 px-6 text-sm items-center ${index !== currentData.length - 1 ? "border-b border-gray-200" : ""}`}
                                        style={{ gridTemplateColumns: '1fr 2fr 1.5fr 1fr 1.5fr 1fr 1fr' }}
                                    >
                                        <div className="text-gray-600 text-center">
                                            {new Date(event.requestDate).toLocaleDateString('ko-KR')}
                                        </div>
                                        <div className="text-gray-900 text-center font-bold truncate">
                                            {event.eventName}
                                        </div>
                                        <div className="text-gray-600 text-center">
                                            {new Date(event.eventPeriod.startDate).toLocaleDateString('ko-KR')} ~ {new Date(event.eventPeriod.endDate).toLocaleDateString('ko-KR')}
                                        </div>
                                        <div className="text-gray-600 text-center">
                                            {event.manager}
                                        </div>
                                        <div className="text-gray-600 text-center truncate">
                                            {event.contact}
                                        </div>
                                        <div className="text-center">
                                            <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${getStatusColor(event.status)}`}>
                                                {event.status}
                                            </span>
                                        </div>
                                        <div className="text-center">
                                            <button
                                                onClick={() => handleDetailClick(event.id)}
                                                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                상세보기
                                            </button>
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
                                    총 <span className="font-bold text-black">{totalElements}</span>개의 요청
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

export default EventEditRequests;
