import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Eye, RotateCcw } from "lucide-react";
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";
import authManager from "../../utils/auth";
import RefundApprovalModal from "../admin_refund/RefundApprovalModal";

// 관리하는 이벤트 타입
interface ManagedEvent {
    eventId: number;
    eventName: string;
    eventStatus: string;
    startDate?: string;
    endDate?: string;
}

// 환불 데이터 타입
interface RefundData {
    refundId: number;
    refundAmount: number;
    refundReason: string;
    refundStatus: string;
    refundStatusName: string;
    refundCreatedAt: string;
    refundApprovedAt?: string;
    adminComment?: string;
    approvedByName?: string;
    
    // 결제 정보
    paymentId: number;
    merchantUid: string;
    impUid?: string;
    paymentAmount: number;
    quantity: number;
    price: number;
    paymentTargetType: string;
    paymentTargetName: string;
    paidAt: string;
    
    // 이벤트 정보
    eventId?: number;
    eventName?: string;
    eventStartDate?: string;
    eventEndDate?: string;
    
    // 사용자 정보
    userId: number;
    userName: string;
    userEmail: string;
    userPhone: string;
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
    eventId?: number;
    userName?: string;
    paymentDateFrom?: string;
    paymentDateTo?: string;
    refundStatus?: string;
    paymentTargetType?: string;
    page: number;
    size: number;
    sortBy: string;
    sortDirection: string;
}

export const HostRefundManagement = () => {
    const [refunds, setRefunds] = useState<RefundData[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedRefunds, setSelectedRefunds] = useState<Set<number>>(new Set());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRefund, setSelectedRefund] = useState<RefundData | null>(null);
    const [managedEvents, setManagedEvents] = useState<ManagedEvent[]>([]);
    const itemsPerPage = 20;

    // 검색 필터 상태
    const [filters, setFilters] = useState<RefundFilters>({
        eventId: undefined,
        userName: "",
        paymentDateFrom: "",
        paymentDateTo: "",
        refundStatus: "",
        paymentTargetType: "",
        page: 0,
        size: itemsPerPage,
        sortBy: "createdAt",
        sortDirection: "desc"
    });

    // 관리하는 이벤트 목록 조회
    const fetchManagedEvents = async () => {
        try {
            const response = await authManager.authenticatedFetch('/api/host/refunds/managed-events');
            if (response.ok) {
                const data: ManagedEvent[] = await response.json();
                setManagedEvents(data);
            }
        } catch (error) {
            console.error('관리 이벤트 조회 중 오류:', error);
        }
    };

    // 환불 목록 조회
    const fetchRefunds = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== "") {
                    queryParams.append(key, value.toString());
                }
            });

            const response = await authManager.authenticatedFetch(`/api/host/refunds?${queryParams.toString()}`);

            if (response.ok) {
                const data: PagedResponse<RefundData> = await response.json();
                setRefunds(data.content);
                setTotalElements(data.totalElements);
                setTotalPages(data.totalPages);
                setCurrentPage(data.number);
            } else {
                console.error('환불 목록 조회 실패');
                alert('환불 목록을 불러오는데 실패했습니다.');
            }
        } catch (error) {
            console.error('환불 목록 조회 중 오류:', error);
            alert('환불 목록을 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchManagedEvents();
    }, []);

    useEffect(() => {
        fetchRefunds();
    }, [filters]);

    // 필터 초기화
    const handleResetFilters = () => {
        setFilters({
            eventId: undefined,
            userName: "",
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

    // 체크박스 선택 (호스트는 일괄 처리 제한)
    const handleSelectRefund = (refundId: number) => {
        // 호스트는 개별 선택만 허용
    };

    // 전체 선택/해제 (호스트는 사용하지 않음)
    const handleSelectAll = () => {
        // 호스트는 일괄 처리 제한
    };

    // 환불 상세 보기
    const handleViewRefund = (refund: RefundData) => {
        setSelectedRefund(refund);
        setIsModalOpen(true);
    };

    // 상태별 색상 반환
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'REQUESTED':
                return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
            case 'APPROVED':
                return { bg: 'bg-blue-100', text: 'text-blue-800' };
            case 'PROCESSING':
                return { bg: 'bg-purple-100', text: 'text-purple-800' };
            case 'COMPLETED':
                return { bg: 'bg-green-100', text: 'text-green-800' };
            case 'REJECTED':
                return { bg: 'bg-red-100', text: 'text-red-800' };
            case 'FAILED':
                return { bg: 'bg-gray-100', text: 'text-gray-800' };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-800' };
        }
    };

    // 상태별 요약 계산
    const getStatusSummary = () => {
        const summary = refunds.reduce((acc, refund) => {
            acc[refund.refundStatus] = (acc[refund.refundStatus] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            pending: summary['REQUESTED'] || 0,
            approved: summary['APPROVED'] || 0,
            completed: summary['COMPLETED'] || 0,
            rejected: summary['REJECTED'] || 0,
        };
    };

    const statusSummary = getStatusSummary();

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] h-[1407px] relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    환불 관리
                </div>

                {/* 사이드바 */}
                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20 space-y-6">
                    {/* 필터 영역 */}
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
                                    내 이벤트
                                </label>
                                <select
                                    value={filters.eventId || ""}
                                    onChange={(e) => setFilters(prev => ({ ...prev, eventId: e.target.value ? Number(e.target.value) : undefined, page: 0 }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">전체 이벤트</option>
                                    {managedEvents.map(event => (
                                        <option key={event.eventId} value={event.eventId}>
                                            {event.eventName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    사용자명
                                </label>
                                <input
                                    type="text"
                                    value={filters.userName || ""}
                                    onChange={(e) => setFilters(prev => ({ ...prev, userName: e.target.value, page: 0 }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="사용자명 검색"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    결제일 시작
                                </label>
                                <input
                                    type="date"
                                    value={filters.paymentDateFrom || ""}
                                    onChange={(e) => setFilters(prev => ({ ...prev, paymentDateFrom: e.target.value, page: 0 }))}
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
                                    onChange={(e) => setFilters(prev => ({ ...prev, paymentDateTo: e.target.value, page: 0 }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    환불 상태
                                </label>
                                <select
                                    value={filters.refundStatus || ""}
                                    onChange={(e) => setFilters(prev => ({ ...prev, refundStatus: e.target.value, page: 0 }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">전체</option>
                                    <option value="REQUESTED">요청</option>
                                    <option value="APPROVED">승인</option>
                                    <option value="PROCESSING">처리중</option>
                                    <option value="COMPLETED">완료</option>
                                    <option value="REJECTED">거부</option>
                                    <option value="FAILED">실패</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    결제 유형
                                </label>
                                <select
                                    value={filters.paymentTargetType || ""}
                                    onChange={(e) => setFilters(prev => ({ ...prev, paymentTargetType: e.target.value, page: 0 }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">전체</option>
                                    <option value="RESERVATION">티켓</option>
                                    <option value="BOOTH">부스</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 요약 정보 */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="text-sm text-yellow-600 font-medium">대기중</div>
                            <div className="text-2xl font-bold text-yellow-700">{statusSummary.pending}건</div>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="text-sm text-blue-600 font-medium">승인</div>
                            <div className="text-2xl font-bold text-blue-700">{statusSummary.approved}건</div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="text-sm text-green-600 font-medium">완료</div>
                            <div className="text-2xl font-bold text-green-700">{statusSummary.completed}건</div>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="text-sm text-red-600 font-medium">거부</div>
                            <div className="text-2xl font-bold text-red-700">{statusSummary.rejected}건</div>
                        </div>
                    </div>

                    {/* 총 요소 수 표시 */}
                    <div className="mb-4">
                        <div className="text-sm text-gray-600">
                            전체 <span className="font-bold text-blue-600">{totalElements}</span>건의 환불 요청
                        </div>
                    </div>

                    {/* 환불 목록 테이블 */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            환불ID
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            사용자
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            결제유형
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            환불금액
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            상태
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            요청일
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            액션
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                                로딩 중...
                                            </td>
                                        </tr>
                                    ) : refunds.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                                환불 요청이 없습니다.
                                            </td>
                                        </tr>
                                    ) : (
                                        refunds.map((refund) => {
                                            const statusColor = getStatusColor(refund.refundStatus);
                                            return (
                                                <tr key={refund.refundId} className="hover:bg-gray-50">
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        #{refund.refundId}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{refund.userName}</div>
                                                        <div className="text-sm text-gray-500">{refund.userEmail}</div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {refund.paymentTargetName}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {refund.refundAmount.toLocaleString()}원
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor.bg} ${statusColor.text}`}>
                                                            {refund.refundStatusName}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(refund.refundCreatedAt).toLocaleDateString('ko-KR')}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => handleViewRefund(refund)}
                                                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                                                        >
                                                            <Eye className="w-3 h-3" />
                                                            보기
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 페이지네이션 */}
                    {totalPages > 1 && (
                        <div className="mt-6">
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
                        </div>
                    )}
                </div>

            {/* 환불 승인 모달 - 호스트용 API 사용 */}
            {isModalOpen && selectedRefund && (
                <RefundApprovalModal
                    isOpen={isModalOpen}
                    refund={selectedRefund}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedRefund(null);
                    }}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        setSelectedRefund(null);
                        fetchRefunds(); // 목록 새로고침
                    }}
                    apiBaseUrl="/api/host" // 호스트 API 사용
                />
            )}
        </div>
    </div>
    );
};

export default HostRefundManagement;