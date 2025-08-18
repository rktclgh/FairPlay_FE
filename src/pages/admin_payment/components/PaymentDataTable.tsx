import React, { useState } from 'react';
import { PaymentAdminDto, PaymentSearchCriteria, PaginationInfo } from '../types/payment.types';

interface PaymentDataTableProps {
  payments: PaymentAdminDto[];
  pagination: PaginationInfo;
  loading: boolean;
  onPageChange: (page: number) => void;
  onSort: (field: string, direction: 'asc' | 'desc') => void;
  searchCriteria: PaymentSearchCriteria;
}

const PaymentDataTable: React.FC<PaymentDataTableProps> = ({
  payments,
  pagination,
  loading,
  onPageChange,
  onSort,
  searchCriteria
}) => {
  const [selectedPayment, setSelectedPayment] = useState<PaymentAdminDto | null>(null);

  const handleSort = (field: string) => {
    if (loading) return;
    
    const direction = 
      searchCriteria.sort === field && searchCriteria.direction === 'asc' 
        ? 'desc' 
        : 'asc';
    
    onSort(field, direction);
  };

  const getPaymentStatusBadge = (statusCode: string, statusName: string) => {
    const statusConfig = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800',
      'REFUNDED': 'bg-gray-100 text-gray-800'
    };

    const className = statusConfig[statusCode as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`px-2 py-1 rounded text-sm ${className}`}>
        {statusName}
      </span>
    );
  };

  const getPaymentTypeBadge = (targetType: string, targetName: string) => {
    const typeConfig = {
      'RESERVATION': 'bg-blue-100 text-blue-800',
      'BOOTH': 'bg-green-100 text-green-800', 
      'AD': 'bg-purple-100 text-purple-800'
    };

    const className = typeConfig[targetType as keyof typeof typeConfig] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`px-2 py-1 rounded text-sm ${className}`}>
        {targetName}
      </span>
    );
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  const renderPagination = () => {
    const { currentPage, totalPages, hasNext, hasPrevious } = pagination;
    
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
        <div className="text-sm text-gray-500">
          총 {pagination.totalElements?.toLocaleString()}건 중{' '}
          {currentPage * pagination.size + 1}-
          {Math.min((currentPage + 1) * pagination.size, pagination.totalElements || 0)}건 표시
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(0)}
            disabled={!hasPrevious || loading}
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
          >
            ⏮️
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevious || loading}
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
          >
            ◀️
          </button>
          
          <span className="text-sm">
            {currentPage + 1} / {totalPages}
          </span>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNext || loading}
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
          >
            ▶️
          </button>
          <button
            onClick={() => onPageChange(totalPages - 1)}
            disabled={!hasNext || loading}
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
          >
            ⏭️
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          <span>결제 내역을 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">검색 조건에 맞는 결제 내역이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('paymentId')}
              >
                결제ID {searchCriteria.sort === 'paymentId' && (searchCriteria.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('eventName')}
              >
                행사명 {searchCriteria.sort === 'eventName' && (searchCriteria.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                결제항목
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('buyerName')}
              >
                구매자명 {searchCriteria.sort === 'buyerName' && (searchCriteria.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('amount')}
              >
                결제금액 {searchCriteria.sort === 'amount' && (searchCriteria.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                결제상태
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('paidAt')}
              >
                결제일시 {searchCriteria.sort === 'paidAt' && (searchCriteria.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상세
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.paymentId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                  #{payment.paymentId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="max-w-[200px]">
                    <p className="font-medium truncate">
                      {payment.eventName || '-'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {payment.merchantUid}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getPaymentTypeBadge(payment.paymentTargetType, payment.paymentTargetName)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p className="font-medium">{payment.buyerName}</p>
                    <p className="text-xs text-gray-500">
                      {payment.buyerEmail}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <p className="font-semibold">
                    {formatAmount(payment.amount)}
                  </p>
                  {payment.refundedAmount > 0 && (
                    <p className="text-xs text-red-600">
                      환불: {formatAmount(payment.refundedAmount)}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getPaymentStatusBadge(payment.paymentStatusCode, payment.paymentStatusName)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <p>{formatDate(payment.paidAt)}</p>
                  {payment.refundedAt && (
                    <p className="text-xs text-gray-500">
                      환불: {formatDate(payment.refundedAt)}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => setSelectedPayment(payment)}
                    className="text-blue-600 hover:text-blue-900 text-sm"
                  >
                    👁️ 보기
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {payments.length > 0 && renderPagination()}

      {/* 결제 상세 정보 모달 */}
      {selectedPayment && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          onClick={() => setSelectedPayment(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-lg max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">결제 상세 정보</h3>
                <button 
                  onClick={() => setSelectedPayment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 모달 본문 */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              <div className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">결제 ID</label>
                    <p className="font-medium">#{selectedPayment.paymentId}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">주문 번호</label>
                    <p className="font-mono text-sm">{selectedPayment.merchantUid}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">행사명</label>
                    <p className="font-medium">{selectedPayment.eventName || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">결제 항목</label>
                    <div>{getPaymentTypeBadge(selectedPayment.paymentTargetType, selectedPayment.paymentTargetName)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">구매자</label>
                    <p className="font-medium">{selectedPayment.buyerName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">이메일</label>
                    <p className="text-sm">{selectedPayment.buyerEmail}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <label className="text-sm text-gray-500 block">수량</label>
                      <p className="text-lg font-semibold">{selectedPayment.quantity}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 block">단가</label>
                      <p className="text-lg font-semibold">{formatAmount(selectedPayment.price)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 block">총액</label>
                      <p className="text-lg font-bold text-blue-600">{formatAmount(selectedPayment.amount)}</p>
                    </div>
                  </div>
                </div>

                {selectedPayment.refundedAmount > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-red-700">환불 금액</span>
                      <span className="font-semibold text-red-700">{formatAmount(selectedPayment.refundedAmount)}</span>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">결제 상태</label>
                      <div>{getPaymentStatusBadge(selectedPayment.paymentStatusCode, selectedPayment.paymentStatusName)}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">결제 방식</label>
                      <p className="font-medium">{selectedPayment.paymentTypeName}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-sm text-gray-500">결제일시</label>
                    <p className="text-sm">{formatDate(selectedPayment.paidAt)}</p>
                  </div>
                  {selectedPayment.refundedAt && (
                    <div>
                      <label className="text-sm text-gray-500">환불일시</label>
                      <p className="text-sm text-red-600">{formatDate(selectedPayment.refundedAt)}</p>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <button 
                  onClick={() => setSelectedPayment(null)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDataTable;