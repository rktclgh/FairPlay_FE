import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TopNav } from "../../components/TopNav";
import { AdminSideNav } from "../../components/AdminSideNav";
import { modificationRequestAPI, ModificationRequestListItem, PageResponse } from '../../services/modificationRequest';
import { toast } from 'react-toastify';


export const EventEditRequests: React.FC = () => {
    const navigate = useNavigate();

    // 상태 관리
    const [requests, setRequests] = useState<ModificationRequestListItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalElements, setTotalElements] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [statusFilter, setStatusFilter] = useState<string>('');

    // 데이터 패칭 함수
    const fetchRequests = async (page: number = 0, status: string = '') => {
        try {
            setLoading(true);
            const response: PageResponse<ModificationRequestListItem> = await modificationRequestAPI.getModificationRequests({
                status: status || undefined,
                page,
                size: 10
            });
            
            setRequests(response.content);
            setCurrentPage(response.number);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (error) {
            console.error('수정 요청 목록 조회 실패:', error);
            toast.error('수정 요청 목록을 불러올 수 없습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 초기 데이터 로드
    useEffect(() => {
        fetchRequests(0, statusFilter);
    }, [statusFilter]);

    // 페이지 변경
    const handlePageChange = (page: number) => {
        if (page >= 0 && page < totalPages) {
            fetchRequests(page, statusFilter);
        }
    };

    // 상태 필터 변경
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value);
    };

    // 상세보기 클릭
    const handleDetailClick = (requestId: number) => {
        navigate(`/admin_dashboard/event-edit-requests/${requestId}`);
    };

    // 상태별 색상 및 텍스트
    const getStatusBadge = (statusCode: string) => {
        const statusConfig = {
            'PENDING': { text: '대기', className: 'bg-yellow-100 text-yellow-800' },
            'APPROVED': { text: '승인', className: 'bg-green-100 text-green-800' },
            'REJECTED': { text: '반려', className: 'bg-red-100 text-red-800' }
        };
        
        const config = statusConfig[statusCode as keyof typeof statusConfig] || { text: statusCode, className: 'bg-gray-100 text-gray-800' };
        
        return (
            <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${config.className}`}>
                {config.text}
            </span>
        );
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
                    {/* 필터 및 검색 */}
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                        상태 필터
                                    </label>
                                    <select
                                        id="status"
                                        value={statusFilter}
                                        onChange={handleStatusChange}
                                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">전체</option>
                                        <option value="PENDING">대기</option>
                                        <option value="APPROVED">승인</option>
                                        <option value="REJECTED">반려</option>
                                    </select>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500">
                                총 {totalElements}개의 요청
                            </div>
                        </div>
                    </div>
                    {/* 행사 수정 요청 목록 테이블 */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* 테이블 헤더 */}
                        <div className="bg-gray-50 border-b border-gray-200 py-4 px-6">
                            <div className="grid grid-cols-6 gap-4 text-sm font-bold text-gray-700" style={{ gridTemplateColumns: '1fr 1fr 2fr 1fr 1fr 1fr' }}>
                                <div className="text-center">신청일</div>
                                <div className="text-center">이벤트코드</div>
                                <div className="text-center">행사명</div>
                                <div className="text-center">상태</div>
                                <div className="text-center">처리일</div>
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
                            ) : requests.length === 0 ? (
                                <div className="py-8 text-center text-gray-500">
                                    수정 요청이 없습니다.
                                </div>
                            ) : (
                                requests.map((request, index) => (
                                    <div
                                        key={request.requestId}
                                        className={`grid grid-cols-6 gap-4 py-5 px-6 text-sm items-center ${index !== requests.length - 1 ? "border-b border-gray-200" : ""}`}
                                        style={{ gridTemplateColumns: '1fr 1fr 2fr 1fr 1fr 1fr' }}
                                    >
                                        <div className="text-gray-600 text-center">
                                            {new Date(request.createdAt).toLocaleDateString('ko-KR')}
                                        </div>
                                        <div className="text-gray-600 text-center">
                                            {request.eventCode || `E${request.eventId}`}
                                        </div>
                                        <div className="text-gray-900 text-center font-bold truncate">
                                            {request.eventTitle}
                                        </div>
                                        <div className="text-center">
                                            {getStatusBadge(request.statusCode)}
                                        </div>
                                        <div className="text-gray-600 text-center">
                                            {request.processedAt 
                                                ? new Date(request.processedAt).toLocaleDateString('ko-KR')
                                                : '-'
                                            }
                                        </div>
                                        <div className="text-center">
                                            <button
                                                onClick={() => handleDetailClick(request.requestId)}
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
                                        disabled={currentPage === 0}
                                        onClick={() => handlePageChange(currentPage - 1)}
                                    >
                                        이전
                                    </button>
                                    <div className="flex space-x-1">
                                        {Array.from({ length: totalPages }, (_, i) => i).map(page => (
                                            <button
                                                key={page}
                                                className={`px-3 py-2 text-sm border rounded-md ${currentPage === page
                                                    ? "text-white bg-blue-600 border-blue-600"
                                                    : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                                                    }`}
                                                onClick={() => handlePageChange(page)}
                                            >
                                                {page + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        className="px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={currentPage >= totalPages - 1}
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
