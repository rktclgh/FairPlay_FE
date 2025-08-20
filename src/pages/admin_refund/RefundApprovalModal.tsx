import React, { useState } from "react";
import { X, AlertTriangle, Check, Ban } from "lucide-react";
import authManager from "../../utils/auth";

// 환불 승인 모달 props 타입
interface RefundApprovalModalProps {
    isOpen: boolean;
    refund: {
        refundId: number;
        refundAmount: number;
        refundReason: string;
        refundStatus: string;
        refundStatusName: string;
        refundCreatedAt: string;
        
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
        
        // 사용자 정보
        userId: number;
        userName: string;
        userEmail: string;
        userPhone: string;
    };
    onClose: () => void;
    onSuccess: () => void;
    apiBaseUrl?: string; // 선택적 API 기본 경로 (기본값: /api/admin)
}

// 승인/거부 요청 타입
interface ApprovalRequest {
    action: 'APPROVE' | 'REJECT';
    adminComment: string;
    refundAmount?: number;
    processImmediately?: boolean;
}

const RefundApprovalModal: React.FC<RefundApprovalModalProps> = ({ isOpen, refund, onClose, onSuccess, apiBaseUrl = '/api/admin' }) => {
    const [adminComment, setAdminComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    // 환불 승인 처리
    const handleApprove = async () => {
        if (!adminComment.trim()) {
            alert('검토 의견을 입력해주세요.');
            return;
        }

        // 환불 승인 확인
        if (!confirm('환불을 승인하시겠습니까?')) {
            return;
        }

        setSubmitting(true);
        try {
            const approvalData: ApprovalRequest = {
                action: 'APPROVE',
                adminComment: adminComment.trim(),
                refundAmount: refund.refundAmount,
                processImmediately: true
            };

            const response = await authManager.authenticatedFetch(`/api/refunds/${refund.refundId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(approvalData)
            });

            if (response.ok) {
                alert('환불이 승인되었습니다.');
                onSuccess();
            } else {
                const errorData = await response.json();
                alert(`환불 승인 실패: ${errorData.message || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error('환불 승인 중 오류:', error);
            alert('환불 승인 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    // 환불 거부 처리
    const handleReject = async () => {
        if (!adminComment.trim()) {
            alert('거부 사유를 입력해주세요.');
            return;
        }

        // 환불 거부 확인
        if (!confirm('환불을 거부하시겠습니까?')) {
            return;
        }

        setSubmitting(true);
        try {
            const rejectionData: ApprovalRequest = {
                action: 'REJECT',
                adminComment: adminComment.trim()
            };

            const response = await authManager.authenticatedFetch(`${apiBaseUrl}/refunds/${refund.refundId}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(rejectionData)
            });

            if (response.ok) {
                alert('환불이 거부되었습니다.');
                onSuccess();
            } else {
                const errorData = await response.json();
                alert(`환불 거부 실패: ${errorData.message || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error('환불 거부 중 오류:', error);
            alert('환불 거부 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    // 환불 가능 여부 체크
    const isProcessable = refund.refundStatus === 'REQUESTED';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-hidden">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        환불 요청 상세 검토
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* 내용 */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 환불 요청 정보 */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">환불 요청 정보</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="text-gray-500">요청 ID:</span>
                                    <span className="ml-2 font-medium">#{refund.refundId}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">요청일:</span>
                                    <span className="ml-2">{new Date(refund.refundCreatedAt).toLocaleDateString('ko-KR')}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">요청자:</span>
                                    <span className="ml-2">{refund.userName}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">연락처:</span>
                                    <span className="ml-2">{refund.userPhone}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">이메일:</span>
                                    <span className="ml-2">{refund.userEmail}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">환불 유형:</span>
                                    <span className="ml-2">
                                        {refund.refundAmount === refund.paymentAmount ? '전체환불' : '부분환불'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500">환불 수량:</span>
                                    <span className="ml-2">
                                        {Math.floor(refund.refundAmount / refund.price)}개
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500">환불 금액:</span>
                                    <span className="ml-2 font-medium text-red-600">
                                        {refund.refundAmount.toLocaleString()}원
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 결제 정보 */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">결제 정보</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="text-gray-500">결제 ID:</span>
                                    <span className="ml-2 font-medium">#{refund.paymentId}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">이벤트:</span>
                                    <span className="ml-2">{refund.eventName || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">결제일:</span>
                                    <span className="ml-2">{new Date(refund.paidAt).toLocaleDateString('ko-KR')}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">결제품목:</span>
                                    <span className="ml-2">{refund.paymentTargetName}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">결제금액:</span>
                                    <span className="ml-2 font-medium">{refund.paymentAmount.toLocaleString()}원</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">결제수단:</span>
                                    <span className="ml-2">신용카드</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">PG사:</span>
                                    <span className="ml-2">이니시스</span>
                                </div>
                                {refund.impUid && (
                                    <div>
                                        <span className="text-gray-500">imp_uid:</span>
                                        <span className="ml-2 font-mono text-xs">{refund.impUid}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 환불 사유 */}
                    <div className="mt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">환불 사유</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {refund.refundReason || '환불 사유가 입력되지 않았습니다.'}
                            </p>
                        </div>
                    </div>

                    {/* 관리자 검토 영역 */}
                    {isProcessable && (
                        <div className="mt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">관리자 검토</h3>
                            
                            {/* 환불 요청 금액 */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    환불 요청 금액
                                </label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="text"
                                        value={`${refund.refundAmount.toLocaleString()}원`}
                                        readOnly
                                        className="w-48 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                                    />
                                </div>
                            </div>


                            {/* 검토 의견 입력 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    검토 의견 <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={adminComment}
                                    onChange={(e) => setAdminComment(e.target.value)}
                                    placeholder="승인/거부 사유를 입력해주세요"
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}

                    {/* 환불 처리 안내 */}
                    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                            <div className="text-sm text-yellow-800">
                                <p className="font-medium mb-1">환불 처리 안내</p>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li>승인 시 즉시 PG사로 환불 요청이 전송됩니다</li>
                                    <li>환불 처리는 3-5 영업일 소요됩니다</li>
                                    <li>환불 수수료가 차감될 수 있습니다</li>
                                    <li>승인 후에는 취소가 불가능합니다</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 푸터 - 액션 버튼 */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                    >
                        취소
                    </button>
                    
                    {isProcessable && (
                        <>
                            <button
                                onClick={handleReject}
                                disabled={submitting || !adminComment.trim()}
                                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                <Ban className="w-4 h-4" />
                                {submitting ? '처리 중...' : '거부'}
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={submitting || !adminComment.trim()}
                                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                {submitting ? '처리 중...' : '승인 및 환불 처리'}
                            </button>
                        </>
                    )}
                    
                    {!isProcessable && (
                        <div className="text-sm text-gray-500">
                            현재 상태: {refund.refundStatusName} (처리 불가)
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RefundApprovalModal;