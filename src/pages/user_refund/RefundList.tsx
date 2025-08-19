import React, { useState, useEffect } from "react";
import { TopNav } from "../../components/TopNav";
import { AttendeeSideNav } from "../user_mypage/AttendeeSideNav";
import { Plus, Download, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import RefundRequestModal from "./RefundRequestModal";
import authManager from "../../utils/auth";

// 환불 데이터 타입
interface RefundData {
    refundId: number;
    paymentId: number;
    merchantUid: string;
    eventId?: number;
    eventName?: string;
    userId: number;
    userName: string;
    userEmail: string;
    userPhone: string;
    paymentTargetType: string;
    paymentTargetName: string;
    targetId: number;
    quantity: number;
    price: number;
    totalAmount: number;
    paidAt: string;
    refundAmount: number;
    refundReason?: string;
    refundStatus: string;
    refundStatusName: string;
    refundCreatedAt: string;
    refundApprovedAt?: string;
}

// 페이지네이션 응답 타입
interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

// 검색 필터 타입
interface RefundFilters {
    eventName?: string;
    paymentDateFrom?: string;
    paymentDateTo?: string;
    refundStatus?: string;
    paymentTargetType?: string;
    page: number;
    size: number;
    sortBy: string;
    sortDirection: string;
}

export const RefundList = () => {
    const [refunds, setRefunds] = useState<RefundData[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const itemsPerPage = 15;

    // 검색 필터 상태
    const [filters, setFilters] = useState<RefundFilters>({
        eventName: "",
        paymentDateFrom: "",
        paymentDateTo: "",
        refundStatus: "",
        paymentTargetType: "",
        page: 0,
        size: itemsPerPage,
        sortBy: "createdAt",
        sortDirection: "desc"
    });

    // 내 환불 목록 조회
    const fetchRefunds = async () => {
        setLoading(true);
        try {
            const response = await authManager.authenticatedFetch('/api/refunds/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data: RefundData[] = await response.json();
                // 클라이언트 측에서 필터링 및 페이징 처리
                let filteredData = data;
                
                // 행사명 필터링
                if (filters.eventName && filters.eventName.trim()) {
                    filteredData = filteredData.filter(item => 
                        item.eventName?.toLowerCase().includes(filters.eventName!.toLowerCase())
                    );
                }
                
                // 결제일자 필터링
                if (filters.paymentDateFrom) {
                    const fromDate = new Date(filters.paymentDateFrom);
                    filteredData = filteredData.filter(item => 
                        new Date(item.paidAt) >= fromDate
                    );
                }
                
                if (filters.paymentDateTo) {
                    const toDate = new Date(filters.paymentDateTo);
                    toDate.setHours(23, 59, 59, 999);
                    filteredData = filteredData.filter(item => 
                        new Date(item.paidAt) <= toDate
                    );
                }
                
                // 환불 상태 필터링
                if (filters.refundStatus) {
                    filteredData = filteredData.filter(item => 
                        item.refundStatus === filters.refundStatus
                    );
                }
                
                // 결제 유형 필터링
                if (filters.paymentTargetType) {
                    filteredData = filteredData.filter(item => 
                        item.paymentTargetType === filters.paymentTargetType
                    );
                }
                
                // 정렬
                filteredData.sort((a, b) => {
                    const aValue = a.refundCreatedAt;
                    const bValue = b.refundCreatedAt;
                    if (filters.sortDirection === 'desc') {
                        return new Date(bValue).getTime() - new Date(aValue).getTime();
                    } else {
                        return new Date(aValue).getTime() - new Date(bValue).getTime();
                    }
                });
                
                // 페이징
                const startIndex = filters.page * filters.size;
                const endIndex = startIndex + filters.size;
                const paginatedData = filteredData.slice(startIndex, endIndex);
                
                setRefunds(paginatedData);
                setTotalElements(filteredData.length);
                setTotalPages(Math.ceil(filteredData.length / filters.size));
                setCurrentPage(filters.page);
            } else {
                console.error('환불 목록 조회 실패');
            }
        } catch (error) {
            console.error('환불 목록 조회 중 오류:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRefunds();
    }, [filters]);

    // 필터 초기화
    const handleResetFilters = () => {
        setFilters({
            eventName: "",
            paymentDateFrom: "",
            paymentDateTo: "",
            refundStatus: "",
            paymentTargetType: "",
            page: 0,
            size: itemsPerPage,
            sortBy: "createdAt",
            sortDirection: "desc"
        });
    };

    // 페이지 변경
    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    // 상태별 색상 반환
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'REQUESTED':
                return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
            case 'APPROVED':
                return { bg: 'bg-green-100', text: 'text-green-800' };
            case 'REJECTED':
                return { bg: 'bg-red-100', text: 'text-red-800' };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-800' };
        }
    };

    // 환불 요청 모달 열기
    const handleRefundRequest = () => {
        setIsModalOpen(true);
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    내 환불 내역
                </div>

                <AttendeeSideNav className="!absolute !left-0 !top-[117px]" />
                <TopNav />

                <div className="absolute top-[195px] left-64 right-0 pr-8">
                    <div className="mb-6">
                        <p className="text-gray-600">나의 결제 환불 요청 및 처리 현황을 확인합니다.</p>
                    </div>

                    {/* 검색 필터 */}
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6">
                        {/* 검색 조건 헤더 */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">검색 조건</h3>
                            <button
                                onClick={handleResetFilters}
                                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md transition-colors"
                                title="검색 조건 초기화"
                            >
                                <RotateCcw className="w-4 h-4" />
                                초기화
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    행사명
                                </label>
                                <input
                                    type="text"
                                    value={filters.eventName || ""}
                                    onChange={(e) => setFilters(prev => ({ ...prev, eventName: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="행사명 검색"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    결제일 시작
                                </label>
                                <input
                                    type="date"
                                    value={filters.paymentDateFrom || ""}
                                    onChange={(e) => setFilters(prev => ({ ...prev, paymentDateFrom: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    결제일 종료
                                </label>
                                <input
                                    type="date"
                                    value={filters.paymentDateTo || ""}
                                    onChange={(e) => setFilters(prev => ({ ...prev, paymentDateTo: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    환불 상태
                                </label>
                                <select
                                    value={filters.refundStatus || ""}
                                    onChange={(e) => setFilters(prev => ({ ...prev, refundStatus: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">전체</option>
                                    <option value="REQUESTED">요청</option>
                                    <option value="APPROVED">승인</option>
                                    <option value="REJECTED">거부</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    결제 유형
                                </label>
                                <select
                                    value={filters.paymentTargetType || ""}
                                    onChange={(e) => setFilters(prev => ({ ...prev, paymentTargetType: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">전체</option>
                                    <option value="RESERVATION">예약</option>
                                    <option value="BOOTH">부스</option>
                                    <option value="AD">광고</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end items-center mt-6">
                            <button
                                onClick={handleRefundRequest}
                                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                환불 요청
                            </button>
                        </div>
                    </div>

                    {/* 검색 결과 요약 */}
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                전체 <span className="font-bold text-blue-600">{totalElements}</span>건의 환불 요청
                            </div>
                            <button className="text-gray-500 hover:text-gray-700 flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                엑셀 다운로드
                            </button>
                        </div>
                    </div>

                    {/* 환불 목록 테이블 */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
                        <div className="overflow-x-auto w-full">
                            <table className="w-full min-w-[800px]">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            환불ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            행사명
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            신청자
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            결제 유형
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            결제 금액
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            환불 금액
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            환불 상태
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            요청일
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                                                로딩 중...
                                            </td>
                                        </tr>
                                    ) : refunds.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                                                환불 요청이 없습니다.
                                            </td>
                                        </tr>
                                    ) : (
                                        refunds.map((refund) => {
                                            const statusColor = getStatusColor(refund.refundStatus);
                                            return (
                                                <tr key={refund.refundId} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        #{refund.refundId}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {refund.eventName || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{refund.userName}</div>
                                                        <div className="text-sm text-gray-500">{refund.userEmail}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {refund.paymentTargetName}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {refund.totalAmount.toLocaleString()}원
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {refund.refundAmount.toLocaleString()}원
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor.bg} ${statusColor.text}`}>
                                                            {refund.refundStatusName}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(refund.refundCreatedAt).toLocaleDateString('ko-KR')}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* 페이지네이션 */}
                        {totalPages > 1 && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button
                                        onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                                        disabled={currentPage === 0}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        이전
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                                        disabled={currentPage === totalPages - 1}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        다음
                                    </button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            <span className="font-medium">{currentPage * itemsPerPage + 1}</span>
                                            {' '}~{' '}
                                            <span className="font-medium">
                                                {Math.min((currentPage + 1) * itemsPerPage, totalElements)}
                                            </span>
                                            {' '}/ {' '}
                                            <span className="font-medium">{totalElements}</span>
                                            {' '}건
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            <button
                                                onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                                                disabled={currentPage === 0}
                                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                <ChevronLeft className="h-5 w-5" />
                                            </button>
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                const pageNum = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => handlePageChange(pageNum)}
                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                            pageNum === currentPage
                                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {pageNum + 1}
                                                    </button>
                                                );
                                            })}
                                            <button
                                                onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                                                disabled={currentPage === totalPages - 1}
                                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                <ChevronRight className="h-5 w-5" />
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 환불 요청 모달 */}
            {isModalOpen && (
                <RefundRequestModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchRefunds(); // 목록 새로고침
                    }}
                />
            )}
        </div>
    );
};