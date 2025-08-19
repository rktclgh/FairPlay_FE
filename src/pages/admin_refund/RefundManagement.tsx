import React, { useState, useEffect } from "react";
import { Eye, Check, X, Download, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { TopNav } from "../../components/TopNav";
import { AdminSideNav } from "../../components/AdminSideNav";
import authManager from "../../utils/auth";
import RefundApprovalModal from "./RefundApprovalModal";

// 관리자용 환불 데이터 타입
interface AdminRefundData {
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
    eventName?: string;
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

export const RefundManagement = () => {
    const [refunds, setRefunds] = useState<AdminRefundData[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedRefunds, setSelectedRefunds] = useState<Set<number>>(new Set());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRefund, setSelectedRefund] = useState<AdminRefundData | null>(null);
    const itemsPerPage = 20;

    // 검색 필터 상태
    const [filters, setFilters] = useState<RefundFilters>({
        eventName: "",
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

            const response = await authManager.authenticatedFetch(`/api/admin/refunds?${queryParams.toString()}`);

            if (response.ok) {
                const data: PagedResponse<AdminRefundData> = await response.json();
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
        fetchRefunds();
    }, [filters]);

    // 페이지 변경
    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    // 체크박스 선택
    const handleSelectRefund = (refundId: number) => {
        const newSelected = new Set(selectedRefunds);
        if (newSelected.has(refundId)) {
            newSelected.delete(refundId);
        } else {
            newSelected.add(refundId);
        }
        setSelectedRefunds(newSelected);
    };

    // 전체 선택/해제
    const handleSelectAll = () => {
        if (selectedRefunds.size === refunds.length) {
            setSelectedRefunds(new Set());
        } else {
            setSelectedRefunds(new Set(refunds.map(r => r.refundId)));
        }
    };

    // 환불 상세 보기
    const handleViewRefund = (refund: AdminRefundData) => {
        setSelectedRefund(refund);
        setIsModalOpen(true);
    };

    // 필터 초기화
    const handleResetFilters = () => {
        setFilters({
            eventName: "",
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
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    환불 요청 관리
                </div>

                {/* 사이드바 */}
                <AdminSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20 space-y-6">
                    <div className="bg-white min-h-screen p-6">
                        <div className="max-w-7xl mx-auto">

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
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                    <option value="PROCESSING">처리중</option>
                                    <option value="COMPLETED">완료</option>
                                    <option value="REJECTED">거부</option>
                                    <option value="FAILED">실패</option>
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
                                    <option value="RESERVATION">티켓</option>
                                    <option value="BOOTH">부스</option>
                                    <option value="AD">광고</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    이벤트명
                                </label>
                                <input
                                    type="text"
                                    value={filters.eventName || ""}
                                    onChange={(e) => setFilters(prev => ({ ...prev, eventName: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="이벤트명 검색"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    사용자명
                                </label>
                                <input
                                    type="text"
                                    value={filters.userName || ""}
                                    onChange={(e) => setFilters(prev => ({ ...prev, userName: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="사용자명"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 요약 정보 */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

                    {/* 환불 목록 테이블 */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* 헤더 */}
                        <div className="bg-gray-50 border-b border-gray-200 py-4 px-6">
                            <div
                                className="grid grid-cols-9 gap-4 text-sm font-bold text-gray-700"
                                style={{ gridTemplateColumns: "0.5fr 1fr 1.5fr 1fr 1fr 1fr 1fr 1fr 1fr" }}
                            >
                                <div className="text-center">선택</div>
                                <div className="text-center">환불ID</div>
                                <div className="text-center">이벤트명</div>
                                <div className="text-center">사용자</div>
                                <div className="text-center">결제유형</div>
                                <div className="text-center">환불금액</div>
                                <div className="text-center">상태</div>
                                <div className="text-center">요청일</div>
                                <div className="text-center">액션</div>
                            </div>
                        </div>

                        {/* 바디 */}
                        <div>
                            {loading ? (
                                <div className="py-8 text-center text-gray-500">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                    데이터를 불러오는 중...
                                </div>
                            ) : refunds.length === 0 ? (
                                <div className="py-8 text-center text-gray-500">
                                    환불 요청이 없습니다.
                                </div>
                            ) : (
                                refunds.map((refund, index) => {
                                    const statusColor = getStatusColor(refund.refundStatus);
                                    return (
                                        <div
                                            key={refund.refundId}
                                            className={`grid grid-cols-9 gap-4 py-5 px-6 text-sm items-center ${
                                                index !== refunds.length - 1 ? "border-b border-gray-200" : ""
                                            }`}
                                            style={{ gridTemplateColumns: "0.5fr 1fr 1.5fr 1fr 1fr 1fr 1fr 1fr 1fr" }}
                                        >
                                            <div className="text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRefunds.has(refund.refundId)}
                                                    onChange={() => handleSelectRefund(refund.refundId)}
                                                    className="rounded border-gray-300"
                                                />
                                            </div>
                                            <div className="text-gray-900 text-center font-bold">
                                                #{refund.refundId}
                                            </div>
                                            <div className="text-gray-600 text-center truncate">
                                                {refund.eventName || '-'}
                                            </div>
                                            <div className="text-gray-600 text-center truncate">
                                                {refund.userName}
                                            </div>
                                            <div className="text-gray-600 text-center">
                                                {refund.paymentTargetName}
                                            </div>
                                            <div className="text-gray-900 text-center font-bold">
                                                {refund.refundAmount.toLocaleString()}원
                                            </div>
                                            <div className="text-center">
                                                <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                                                    {refund.refundStatusName}
                                                </span>
                                            </div>
                                            <div className="text-gray-600 text-center">
                                                {new Date(refund.refundCreatedAt).toLocaleDateString('ko-KR')}
                                            </div>
                                            <div className="text-center">
                                                <button
                                                    onClick={() => handleViewRefund(refund)}
                                                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    상세보기
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* 페이지네이션 */}
                    {totalPages > 1 && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    총 <span className="font-bold text-black">{totalElements}</span>건의 환불 요청
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
                                        {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
                                            <button
                                                key={p}
                                                className={`px-3 py-2 text-sm border rounded-md ${
                                                    currentPage === p
                                                        ? "text-white bg-blue-600 border-blue-600"
                                                        : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                                                }`}
                                                onClick={() => handlePageChange(p)}
                                            >
                                                {p + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        className="px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={currentPage === totalPages - 1}
                                        onClick={() => handlePageChange(currentPage + 1)}
                                    >
                                        다음
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                        {/* 환불 승인 모달 */}
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
                            />
                        )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RefundManagement;