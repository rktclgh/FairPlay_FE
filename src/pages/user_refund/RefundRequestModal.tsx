import React, { useState, useEffect } from "react";
import { X, AlertCircle, RefreshCw } from "lucide-react";
import authManager from "../../utils/auth";

// 결제 데이터 타입
interface PaymentData {
    paymentId: number;
    eventId?: number;
    eventName?: string;
    eventStartDate?: string; // 행사 시작일
    eventEndDate?: string;   // 행사 종료일
    userId: number;
    targetType: string; // 결제 대상 타입 코드 (RESERVATION, BOOTH, AD)
    targetTypeName: string; // 결제 대상 타입 이름 (예약, 부스, 광고)
    targetId: number; // 실제 결제 대상 ID
    merchantUid: string;
    impUid?: string;
    quantity: number;
    price: number;
    refundedAmount: number;
    amount: number;
    pgProvider?: string;
    paymentTypeCodeId: number;
    paymentStatusCodeId: number;
    requestedAt?: string;
    paidAt: string;
    refundedAt?: string;
}

// 환불 요청 데이터 타입
interface RefundRequestData {
    paymentId: number;
    refundAmount: number;
    refundQuantity?: number;
    reason: string;
    refundType: 'FULL' | 'PARTIAL';
}

interface RefundRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const RefundRequestModal: React.FC<RefundRequestModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [payments, setPayments] = useState<PaymentData[]>([]);
    const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState<'select' | 'request'>('select');

    // 환불 요청 폼 데이터
    const [refundForm, setRefundForm] = useState<RefundRequestData>({
        paymentId: 0,
        refundAmount: 0,
        refundQuantity: 1,
        reason: '',
        refundType: 'FULL'
    });

    // 모달이 열릴 때 결제 내역 로드
    useEffect(() => {
        if (isOpen) {
            loadPayments();
        }
    }, [isOpen]);

    // 내 결제 내역 조회
    const loadPayments = async () => {
        setLoading(true);
        try {
            const response = await authManager.authenticatedFetch('/api/payments/me');

            if (response.ok) {
                const data = await response.json();
                setPayments(data);
            } else {
                console.error('결제 내역 조회 실패');
                alert('결제 내역을 불러오는데 실패했습니다.');
            }
        } catch (error) {
            console.error('결제 내역 조회 중 오류:', error);
            alert('결제 내역을 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };



    // 환불 가능 여부 판단
    const isRefundable = (payment: PaymentData): { canRefund: boolean; reason?: string } => {
        // 이미 전액 환불된 경우
        if (payment.refundedAmount >= payment.amount) {
            return { canRefund: false, reason: '이미 전액 환불되었습니다' };
        }

        // 티켓의 경우 행사일 체크
        if (payment.targetType === 'RESERVATION' && payment.eventEndDate) {
            const eventEndDate = new Date(payment.eventEndDate);
            const now = new Date();
            if (eventEndDate < now) {
                return { canRefund: false, reason: '행사가 종료되어 환불이 불가능합니다' };
            }
        }

        return { canRefund: true };
    };

    // 결제 선택
    const selectPayment = (payment: PaymentData) => {
        const refundCheck = isRefundable(payment);
        if (!refundCheck.canRefund) {
            alert(refundCheck.reason || '환불이 불가능한 결제입니다.');
            return;
        }

        setSelectedPayment(payment);
        setRefundForm(prev => ({
            ...prev,
            paymentId: payment.paymentId,
            refundAmount: payment.amount - payment.refundedAmount,
            refundQuantity: payment.quantity
        }));
        setStep('request');
    };

    // 환불 유형 변경
    const handleRefundTypeChange = (type: 'FULL' | 'PARTIAL') => {
        if (!selectedPayment) return;

        if (type === 'FULL') {
            // 전체 환불: 남은 전체 금액과 수량
            setRefundForm(prev => ({
                ...prev,
                refundType: type,
                refundAmount: selectedPayment.amount - selectedPayment.refundedAmount,
                refundQuantity: selectedPayment.quantity
            }));
        } else {
            // 부분 환불: 1개 기본값으로 설정
            const maxRefundableQuantity = getMaxRefundableQuantity(selectedPayment);
            const initialQuantity = Math.min(1, maxRefundableQuantity);
            const initialAmount = selectedPayment.price * initialQuantity;

            setRefundForm(prev => ({
                ...prev,
                refundType: type,
                refundAmount: initialAmount,
                refundQuantity: initialQuantity
            }));
        }
    };

    // 환불 가능한 최대 수량 계산
    const getMaxRefundableQuantity = (payment: PaymentData): number => {
        // 이미 환불된 수량 계산 (이미 환불된 금액 ÷ 단가)
        const refundedQuantity = Math.floor(payment.refundedAmount / payment.price);

        // 환불 가능한 최대 수량 (전체 수량 - 이미 환불된 수량)
        return Math.max(0, payment.quantity - refundedQuantity);
    };

    // 환불 수량 변경 (부분 환불)
    const handleQuantityChange = (quantity: number) => {
        if (!selectedPayment || refundForm.refundType !== 'PARTIAL') return;

        const maxRefundableQuantity = getMaxRefundableQuantity(selectedPayment);

        // 유효한 환불 수량 계산
        const validQuantity = Math.max(1, Math.min(quantity, maxRefundableQuantity));

        // 환불 금액 계산 (단가 × 환불 수량)
        const refundAmount = selectedPayment.price * validQuantity;

        setRefundForm(prev => ({
            ...prev,
            refundQuantity: validQuantity,
            refundAmount: refundAmount
        }));
    };

    // 환불 요청 제출
    const submitRefundRequest = async () => {
        if (!selectedPayment) return;

        if (!refundForm.reason.trim()) {
            alert('환불 사유를 입력해주세요.');
            return;
        }

        if (refundForm.refundAmount <= 0) {
            alert('환불 금액이 올바르지 않습니다.');
            return;
        }

        setSubmitting(true);
        try {
            const response = await authManager.authenticatedFetch('/api/refunds/request-refund', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(refundForm)
            });

            if (response.ok) {
                alert('환불 요청이 성공적으로 제출되었습니다.');
                onSuccess();
            } else {
                const errorData = await response.json();
                alert(`환불 요청 실패: ${errorData.message || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error('환불 요청 중 오류:', error);
            alert('환불 요청 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    // 모달 초기화
    const resetModal = () => {
        setStep('select');
        setSelectedPayment(null);
        setPayments([]);
        setRefundForm({
            paymentId: 0,
            refundAmount: 0,
            refundQuantity: 1,
            reason: '',
            refundType: 'FULL'
        });
    };

    // 모달 닫기
    const handleClose = () => {
        resetModal();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-2 sm:p-4">
            <div className="bg-white rounded-[10px] shadow-xl w-full max-w-[95vw] sm:max-w-4xl mx-auto max-h-[98vh] min-h-[400px] overflow-hidden">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-200">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                        {step === 'select' ? '환불할 결제 선택' : '환불 요청'}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                {/* 내용 */}
                <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(98vh-200px)]">
                    {step === 'select' ? (
                        <>
                            {/* 결제 내역 선택 화면 */}
                            <div>
                                <div className="mb-4 flex items-center justify-between">
                                    <p className="text-sm text-gray-600">환불하려는 결제를 선택해주세요.</p>
                                    <button
                                        onClick={loadPayments}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-[10px] disabled:opacity-50"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                        새로고침
                                    </button>
                                </div>

                                {loading ? (
                                    <div className="flex items-center justify-center h-64">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                                            <p className="text-gray-600">결제 내역을 불러오는 중...</p>
                                        </div>
                                    </div>
                                ) : payments.length === 0 ? (
                                    <div className="flex items-center justify-center h-64">
                                        <div className="text-center text-gray-500">
                                            <p>결제 내역이 없습니다.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border border-gray-200 rounded-[10px] overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-[600px] sm:min-w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                            결제ID
                                                        </th>
                                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                            행사명 / 결제품목
                                                        </th>
                                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                            수량 / 결제일
                                                        </th>
                                                        <th className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                            결제금액
                                                        </th>
                                                        <th className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                            환불가능금액
                                                        </th>
                                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                            상태
                                                        </th>
                                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                            액션
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {payments.map((payment) => {
                                                        const refundCheck = isRefundable(payment);
                                                        const refundableAmount = payment.amount - payment.refundedAmount;

                                                        return (
                                                            <tr key={payment.paymentId} className={`hover:bg-gray-50 ${!refundCheck.canRefund ? 'opacity-50' : ''}`}>
                                                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-900">
                                                                    #{payment.paymentId}
                                                                </td>
                                                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-900">
                                                                    <div className="max-w-[120px] sm:max-w-xs">
                                                                        <div className="font-medium text-gray-900 text-xs sm:text-sm">
                                                                            {payment.eventName || '행사명 없음'}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">
                                                                            {payment.targetTypeName || '기타'}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-900">
                                                                    <div>
                                                                        <div className="font-medium text-xs sm:text-sm">{payment.quantity}개</div>
                                                                        <div className="text-xs text-gray-500">
                                                                            {new Date(payment.paidAt).toLocaleDateString('ko-KR')}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-900">
                                                                    {payment.amount.toLocaleString()}원
                                                                </td>
                                                                <td className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-900">
                                                                    {refundableAmount.toLocaleString()}원
                                                                </td>
                                                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm">
                                                                    {refundCheck.canRefund ? (
                                                                        <span className="inline-flex px-1 sm:px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                                            환불가능
                                                                        </span>
                                                                    ) : (
                                                                        <span
                                                                            className="inline-flex px-1 sm:px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 cursor-help"
                                                                            title={refundCheck.reason}
                                                                        >
                                                                            환불불가
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-2 sm:px-4 py-2 sm:py-3">
                                                                    <button
                                                                        onClick={() => selectPayment(payment)}
                                                                        disabled={!refundCheck.canRefund}
                                                                        className="bg-blue-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        title={!refundCheck.canRefund ? refundCheck.reason : '환불 요청'}
                                                                    >
                                                                        선택
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* 환불 요청 양식 화면 */}
                            <div>
                                {/* 선택된 결제 정보 */}
                                {selectedPayment && (
                                    <div className="bg-gray-50 rounded-[10px] p-4 mb-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-3">선택된 결제 정보</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500">결제ID:</span> #{selectedPayment.paymentId}
                                            </div>
                                            <div>
                                                <span className="text-gray-500">행사:</span> {selectedPayment.eventName || '-'}
                                            </div>
                                            <div>
                                                <span className="text-gray-500">결제 유형:</span> {selectedPayment.targetTypeName}
                                            </div>
                                            <div>
                                                <span className="text-gray-500">수량:</span> {selectedPayment.quantity}개
                                            </div>
                                            <div>
                                                <span className="text-gray-500">단가:</span> {selectedPayment.price.toLocaleString()}원
                                            </div>
                                            <div>
                                                <span className="text-gray-500">총 결제 금액:</span> {selectedPayment.amount.toLocaleString()}원
                                            </div>
                                            <div>
                                                <span className="text-gray-500">환불 가능 금액:</span> {(selectedPayment.amount - selectedPayment.refundedAmount).toLocaleString()}원
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 환불 요청 폼 */}
                                <div className="space-y-6">
                                    {/* 환불 유형 선택 */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            환불 유형
                                        </label>
                                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="refundType"
                                                    value="FULL"
                                                    checked={refundForm.refundType === 'FULL'}
                                                    onChange={(e) => handleRefundTypeChange(e.target.value as 'FULL')}
                                                    className="mr-2"
                                                />
                                                전체 환불
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="refundType"
                                                    value="PARTIAL"
                                                    checked={refundForm.refundType === 'PARTIAL'}
                                                    onChange={(e) => handleRefundTypeChange(e.target.value as 'PARTIAL')}
                                                    className="mr-2"
                                                />
                                                부분 환불
                                            </label>
                                        </div>
                                    </div>

                                    {/* 부분 환불 시 수량 선택 */}
                                    {refundForm.refundType === 'PARTIAL' && selectedPayment && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                환불 수량
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max={getMaxRefundableQuantity(selectedPayment)}
                                                value={refundForm.refundQuantity}
                                                onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                                                className="w-32 px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-500">
                                                (최대 {getMaxRefundableQuantity(selectedPayment)}개)
                                            </span>
                                        </div>
                                    )}

                                    {/* 환불 금액 */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            환불 금액
                                        </label>
                                        <div className="flex items-center">
                                            <input
                                                type="text"
                                                value={refundForm.refundAmount.toLocaleString()}
                                                readOnly
                                                className="w-48 px-3 py-2 border border-gray-300 rounded-[10px] bg-gray-50"
                                            />
                                            <span className="ml-2 text-sm text-gray-500">원</span>
                                        </div>
                                    </div>

                                    {/* 환불 사유 */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            환불 사유 <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={refundForm.reason}
                                            onChange={(e) => setRefundForm(prev => ({ ...prev, reason: e.target.value }))}
                                            placeholder="환불 사유를 입력해주세요"
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* 주의사항 */}
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-[10px] p-4">
                                        <div className="flex items-start">
                                            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                                            <div className="text-sm text-yellow-800">
                                                <p className="font-medium mb-1">환불 요청 시 주의사항</p>
                                                <ul className="list-disc list-inside space-y-1 text-xs">
                                                    <li>환불 요청 후 관리자 승인이 필요합니다.</li>
                                                    <li>승인된 환불은 3-5 영업일 내에 처리됩니다.</li>
                                                    <li>환불 수수료가 발생할 수 있습니다.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* 푸터 */}
                <div className="flex items-center justify-between p-3 sm:p-6 border-t border-gray-200">
                    <div>
                        {step === 'request' && (
                            <button
                                onClick={() => setStep('select')}
                                className="text-gray-600 hover:text-gray-800"
                            >
                                ← 다른 결제 선택
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleClose}
                            disabled={submitting}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-[10px] hover:bg-gray-200 disabled:opacity-50"
                        >
                            취소
                        </button>
                        {step === 'request' && (
                            <button
                                onClick={submitRefundRequest}
                                disabled={submitting || !refundForm.reason.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-[10px] hover:bg-blue-700 disabled:opacity-50"
                            >
                                {submitting ? '처리 중...' : '환불 요청'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RefundRequestModal;